// sidebar-navbar-exact-colors.js
// Applies exact blue/green colors to sidebar & navbar matching the dashboard image
// Run: node sidebar-navbar-exact-colors.js

const fs = require('fs');
const path = require('path');

const DIRECTORIES = [
  path.join(__dirname, 'src', 'Pages'),
  path.join(__dirname, 'src', 'Components'),
  path.join(__dirname, 'src', 'components'),
  path.join(__dirname, 'src', 'layouts'),
  path.join(__dirname, 'src', 'Layout'),
];

const SIDEBAR_KEYWORDS = ['sidebar', 'sidenav', 'employeesidebar', 'employee-sidebar', 'side-nav'];
const NAVBAR_KEYWORDS  = ['navbar', 'topbar', 'header', 'employeenavbar', 'employee-navbar'];

// ─── TARGET COLORS (matching your dashboard image) ────────────────────────────
// Navbar bg      : #1E3A8A  (blue-900 deep navy)
// Navbar title   : #1D4ED8  (blue-600 pill)
// Sidebar bg     : #1E3A8A  (same deep navy)
// Sidebar hover  : #1D4ED8/60 (blue hover)
// Active item bg : #16A34A  (green-600)
// Active text    : white
// Icon color     : #BFDBFE  (blue-200 / blue-100)
// Text color     : white / #E0F2FE

// ─── NAVBAR RULES ─────────────────────────────────────────────────────────────
const navbarRules = [
  // Background colors → deep navy
  { regex: /\bbg-blue-900\b/g,           replace: 'bg-[#1E3A8A]' },
  { regex: /\bbg-blue-800\b/g,           replace: 'bg-[#1E3A8A]' },
  { regex: /\bbg-\[#1E40AF\]/g,          replace: 'bg-[#1E3A8A]' },
  { regex: /\bbg-\[#1e40af\]/g,          replace: 'bg-[#1E3A8A]' },
  { regex: /\bbg-indigo-900\b/g,         replace: 'bg-[#1E3A8A]' },
  { regex: /\bbg-indigo-800\b/g,         replace: 'bg-[#1E3A8A]' },

  // Title pill background
  { regex: /\bbg-\[#1D4ED8\]\b/g,        replace: 'bg-[#1D4ED8]' },
  { regex: /\bbg-blue-700\b/g,           replace: 'bg-[#1D4ED8]' },
  { regex: /\bbg-blue-600\b/g,           replace: 'bg-[#1D4ED8]' },

  // Border
  { regex: /\bborder-blue-700\/50\b/g,   replace: 'border-blue-800/50' },
  { regex: /\bborder-blue-700\b/g,       replace: 'border-blue-800/50' },

  // Avatar
  { regex: /\bbg-indigo-100 text-indigo-700\b/g, replace: 'bg-blue-100 text-blue-800' },
  { regex: /\bborder-indigo-200\b/g,     replace: 'border-blue-200' },
];

// ─── SIDEBAR RULES ────────────────────────────────────────────────────────────
const sidebarRules = [
  // Sidebar wrapper background → deep navy
  { regex: /\bbg-blue-900\b/g,           replace: 'bg-[#1E3A8A]' },
  { regex: /\bbg-blue-800\b/g,           replace: 'bg-[#1E3A8A]' },
  { regex: /\bbg-gray-900\b/g,           replace: 'bg-[#1E3A8A]' },
  { regex: /\bbg-\[#1E40AF\]/g,          replace: 'bg-[#1E3A8A]' },
  { regex: /\bbg-\[#1e40af\]/g,          replace: 'bg-[#1E3A8A]' },
  { regex: /\bbg-indigo-900\b/g,         replace: 'bg-[#1E3A8A]' },

  // Hover state → blue hover
  { regex: /\bhover:bg-blue-700\/60\b/g, replace: 'hover:bg-[#1D4ED8]/60' },
  { regex: /\bhover:bg-blue-700\b/g,     replace: 'hover:bg-[#1D4ED8]/60' },
  { regex: /\bhover:bg-blue-800\b/g,     replace: 'hover:bg-[#1D4ED8]/60' },

  // Active item → green (like image)
  { regex: /\bbg-green-600 text-white\b/g,  replace: 'bg-[#16A34A] text-white' },
  { regex: /\bbg-green-500 text-white\b/g,  replace: 'bg-[#16A34A] text-white' },
  { regex: /\bbg-blue-600 text-white\b/g,   replace: 'bg-[#16A34A] text-white' },
  { regex: /\bbg-\[#16A34A\]\b/g,           replace: 'bg-[#16A34A]' },

  // Icon colors → blue-100 (soft light blue like image)
  { regex: /\btext-blue-100\b/g,         replace: 'text-[#BFDBFE]' },
  { regex: /\btext-blue-200\b/g,         replace: 'text-[#BFDBFE]' },
  { regex: /\btext-gray-400\b/g,         replace: 'text-[#BFDBFE]' },
  { regex: /\btext-gray-300\b/g,         replace: 'text-[#E0F2FE]' },

  // Borders
  { regex: /\bborder-blue-700\b/g,       replace: 'border-blue-800/40' },
  { regex: /\bborder-blue-800\b/g,       replace: 'border-blue-900/50' },

  // Text colors
  { regex: /\btext-gray-200\b/g,         replace: 'text-white' },
  { regex: /\btext-gray-100\b/g,         replace: 'text-white' },

  // Active dot (green indicator)
  { regex: /\bbg-green-400\b/g,          replace: 'bg-[#22C55E]' },
  { regex: /\bbg-green-500\b/g,          replace: 'bg-[#16A34A]' },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function applyRules(content, rules) {
  rules.forEach(r => { content = content.replace(r.regex, r.replace); });
  return content;
}

function processFile(filePath) {
  const name = path.basename(filePath).toLowerCase();
  const isSidebar = SIDEBAR_KEYWORDS.some(k => name.includes(k));
  const isNavbar  = NAVBAR_KEYWORDS.some(k => name.includes(k));
  if (!isSidebar && !isNavbar) return false;

  let content  = fs.readFileSync(filePath, 'utf8');
  let original = content;

  if (isSidebar) {
    content = applyRules(content, sidebarRules);
    console.log(`  → Sidebar rules applied`);
  }
  if (isNavbar) {
    content = applyRules(content, navbarRules);
    console.log(`  → Navbar rules applied`);
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Updated: ${path.relative(__dirname, filePath)}`);
    return true;
  }
  return false;
}

function traverseDirectory(dir) {
  if (!fs.existsSync(dir)) return 0;
  let count = 0;
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) count += traverseDirectory(full);
    else if (/\.(js|jsx|ts|tsx)$/.test(file) && processFile(full)) count++;
  }
  return count;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
console.log('\n🎨 Applying Exact Blue-Green Theme to Sidebar & Navbar...\n');

let total = 0;
DIRECTORIES.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`📁 Scanning: ${path.relative(__dirname, dir)}`);
    total += traverseDirectory(dir);
  }
});

console.log(`\n✅ Done! Updated ${total} files`);
console.log('\n🎨 Colors Applied:');
console.log('   Navbar bg     → #1E3A8A (deep navy)');
console.log('   Navbar pill   → #1D4ED8 (blue-600)');
console.log('   Sidebar bg    → #1E3A8A (deep navy)');
console.log('   Hover         → #1D4ED8/60 (blue translucent)');
console.log('   Active item   → #16A34A (green-600)');
console.log('   Icons         → #BFDBFE (blue-200 soft)');
console.log('   Text          → white\n');