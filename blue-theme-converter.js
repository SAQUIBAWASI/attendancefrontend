// blue-theme-converter.js
// Converts sidebar/navbar to dark blue theme (matching Recruitment dashboard - Image 1)
// Run: node blue-theme-converter.js (from your project root)

const fs = require('fs');
const path = require('path');

// ─── CONFIGURATION ────────────────────────────────────────────────────────────
// Directories to scan — adjust these paths to match your project structure
const DIRECTORIES = [
  path.join(__dirname, 'src', 'Pages'),
  path.join(__dirname, 'src', 'Components'),
  path.join(__dirname, 'src', 'components'),
  path.join(__dirname, 'src', 'layouts'),
  path.join(__dirname, 'src', 'Layout'),
];

// ─── THEME: Dark Navy Blue (matching Image 1 - Recruitment Dashboard) ─────────
// Sidebar: deep navy (#1e3a8a / blue-900)
// Navbar:  deep navy same color
// Active:  green accent (#16a34a / green-600) or bright blue
// Text:    white / gray-200
// ─────────────────────────────────────────────────────────────────────────────

// Keywords that identify sidebar/navbar files
const SIDEBAR_KEYWORDS = ['sidebar', 'sidenav', 'side-nav', 'side_nav', 'employeesidebar', 'employee-sidebar'];
const NAVBAR_KEYWORDS  = ['navbar', 'topbar', 'top-bar', 'header', 'employeenavbar', 'employee-navbar'];

// ─── RULES ────────────────────────────────────────────────────────────────────

// General light→dark-blue rules applied to ALL matched files
const generalRules = [
  // Backgrounds: white/gray → dark blue navy
  { regex: /\bbg-white\b/g,        replace: 'bg-blue-900' },
  { regex: /\bbg-gray-50\b/g,      replace: 'bg-blue-900' },
  { regex: /\bbg-gray-100\b/g,     replace: 'bg-blue-800' },
  { regex: /\bbg-gray-200\b/g,     replace: 'bg-blue-800' },

  // Text: dark → white/light
  { regex: /\btext-gray-900\b/g,   replace: 'text-white' },
  { regex: /\btext-gray-800\b/g,   replace: 'text-gray-100' },
  { regex: /\btext-gray-700\b/g,   replace: 'text-gray-200' },
  { regex: /\btext-gray-600\b/g,   replace: 'text-gray-300' },
  { regex: /\btext-gray-500\b/g,   replace: 'text-gray-400' },

  // Borders
  { regex: /\bborder-gray-200\b/g, replace: 'border-blue-700' },
  { regex: /\bborder-gray-300\b/g, replace: 'border-blue-700' },

  // Hover states
  { regex: /\bhover:bg-gray-50\b/g,  replace: 'hover:bg-blue-700' },
  { regex: /\bhover:bg-gray-100\b/g, replace: 'hover:bg-blue-700' },
  { regex: /\bhover:bg-blue-50\b/g,  replace: 'hover:bg-blue-700' },

  // Active / selected items — keep green accent like Image 1
  { regex: /\bbg-blue-600 text-white\b/g,  replace: 'bg-green-600 text-white' },
  { regex: /\bbg-blue-500 text-white\b/g,  replace: 'bg-green-600 text-white' },

  // Blue accents on text → white (for sidebar icon/label colors)
  { regex: /\btext-blue-600\b/g,   replace: 'text-white' },
  { regex: /\btext-blue-700\b/g,   replace: 'text-white' },
  { regex: /\btext-blue-500\b/g,   replace: 'text-gray-200' },
  { regex: /\bhover:text-blue-600\b/g, replace: 'hover:text-green-400' },

  // Divide lines
  { regex: /\bdivide-gray-200\b/g, replace: 'divide-blue-700' },

  // Shadows — subtle on dark bg
  { regex: /\bshadow-sm\b/g,       replace: 'shadow-md shadow-black/30' },
];

// Extra rules for sidebar files
const sidebarRules = [
  // Active sidebar item — green dot / green highlight (Image 1 style)
  { regex: /\bbg-green-600\b/g,           replace: 'bg-green-500' },
  { regex: /\btext-green-600\b/g,         replace: 'text-green-400' },
  { regex: /\bhover:bg-blue-700\b/g,      replace: 'hover:bg-blue-700/70' },
  // Sidebar wrapper — make sure it's dark blue with a right border
  { regex: /\bbg-blue-900 border-r\b/g,   replace: 'bg-blue-900 border-r border-blue-700' },
];

// Extra rules for navbar files
const navbarRules = [
  // Navbar bottom border
  { regex: /\bborder-b border-gray-200\b/g, replace: 'border-b border-blue-700' },
  { regex: /\bborder-b border-blue-700\b/g, replace: 'border-b border-blue-700' },
  // Navbar button / badge
  { regex: /\bbg-blue-50 border border-blue-200 text-blue-700\b/g,
    replace: 'bg-blue-800 border border-blue-600 text-white' },
];

// ─── HELPER ──────────────────────────────────────────────────────────────────

function applyRules(content, rules) {
  rules.forEach(rule => {
    content = content.replace(rule.regex, rule.replace);
  });
  return content;
}

function isSidebar(fileName) {
  return SIDEBAR_KEYWORDS.some(k => fileName.toLowerCase().includes(k));
}

function isNavbar(fileName) {
  return NAVBAR_KEYWORDS.some(k => fileName.toLowerCase().includes(k));
}

function processFile(filePath) {
  const fileName  = path.basename(filePath);
  const lowerName = fileName.toLowerCase();
  const matched   = isSidebar(lowerName) || isNavbar(lowerName);

  if (!matched) return false; // only touch sidebar/navbar files

  let content  = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Apply general rules
  content = applyRules(content, generalRules);

  if (isSidebar(lowerName)) {
    content = applyRules(content, sidebarRules);
    console.log(`  → Applied Sidebar dark-blue rules`);
  }

  if (isNavbar(lowerName)) {
    content = applyRules(content, navbarRules);
    console.log(`  → Applied Navbar dark-blue rules`);
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Updated: ${path.relative(__dirname, filePath)}`);
    return true;
  }

  console.log(`  (no changes needed): ${path.relative(__dirname, filePath)}`);
  return false;
}

function traverseDirectory(dir) {
  if (!fs.existsSync(dir)) return 0;

  let count = 0;
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat     = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      count += traverseDirectory(fullPath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.tsx') || file.endsWith('.ts')) {
      if (processFile(fullPath)) count++;
    }
  }

  return count;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
console.log('\n🔵 Starting Dark-Blue Theme Conversion (Sidebar & Navbar only)...');
console.log('🎨 Target: Navy blue sidebar/navbar — matching Recruitment dashboard\n');

let totalUpdated = 0;

DIRECTORIES.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`📁 Scanning: ${path.relative(__dirname, dir)}`);
    totalUpdated += traverseDirectory(dir);
  } else {
    console.log(`⚠️  Directory not found (skipped): ${path.relative(__dirname, dir)}`);
  }
});

console.log(`\n✅ Conversion Complete!`);
console.log(`📊 Updated ${totalUpdated} sidebar/navbar files`);
console.log('\n✨ New Theme Applied:');
console.log('   • Sidebar: Deep navy blue (bg-blue-900)');
console.log('   • Navbar:  Deep navy blue (bg-blue-900)');
console.log('   • Active item: Green accent (bg-green-500/600)');
console.log('   • Text: White / light gray');
console.log('   • Hover: bg-blue-700');
console.log('   • Borders: blue-700');
console.log('\n💡 TIP: If your files have custom hex colors (e.g. bg-[#...]),');
console.log('   add them manually to the generalRules array in this script.\n');