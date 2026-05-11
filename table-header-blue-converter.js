// table-header-blue-converter.js
// Converts table headers from green to blue (matching Recruitment dashboard - Image 1)
// Run: node table-header-blue-converter.js (from your project root)

const fs = require('fs');
const path = require('path');

// ─── CONFIGURATION ────────────────────────────────────────────────────────────
const DIRECTORIES = [
  path.join(__dirname, 'src', 'Pages'),
  path.join(__dirname, 'src', 'Components'),
  path.join(__dirname, 'src', 'components'),
  path.join(__dirname, 'src', 'layouts'),
  path.join(__dirname, 'src', 'Layout'),
];

// ─── TABLE HEADER RULES ───────────────────────────────────────────────────────
// Image 1: Blue gradient table header (blue-600 → blue-800 / teal-600)
// Image 2: Green table header — needs to be replaced with blue

const tableHeaderRules = [

  // ── Green solid backgrounds on <th> or thead ─────────────────────────────
  { regex: /\bbg-green-600\b/g,          replace: 'bg-blue-700' },
  { regex: /\bbg-green-500\b/g,          replace: 'bg-blue-600' },
  { regex: /\bbg-green-700\b/g,          replace: 'bg-blue-800' },
  { regex: /\bbg-green-400\b/g,          replace: 'bg-blue-500' },

  // ── Emerald (often used for table headers in light themes) ────────────────
  { regex: /\bbg-emerald-600\b/g,        replace: 'bg-blue-700' },
  { regex: /\bbg-emerald-500\b/g,        replace: 'bg-blue-600' },
  { regex: /\bbg-emerald-700\b/g,        replace: 'bg-blue-800' },
  { regex: /\bbg-emerald-400\b/g,        replace: 'bg-blue-500' },

  // ── Teal (another common green-ish header color) ──────────────────────────
  { regex: /\bbg-teal-600\b/g,           replace: 'bg-blue-700' },
  { regex: /\bbg-teal-500\b/g,           replace: 'bg-blue-600' },
  { regex: /\bbg-teal-700\b/g,           replace: 'bg-blue-800' },

  // ── Hex green table headers ───────────────────────────────────────────────
  { regex: /bg-\[#16a34a\]/g,            replace: 'bg-blue-700' },
  { regex: /bg-\[#15803d\]/g,            replace: 'bg-blue-800' },
  { regex: /bg-\[#22c55e\]/g,            replace: 'bg-blue-600' },
  { regex: /bg-\[#059669\]/g,            replace: 'bg-blue-700' },  // emerald-600 hex
  { regex: /bg-\[#10b981\]/g,            replace: 'bg-blue-600' },  // emerald-500 hex

  // ── Text inside green headers → white (already white usually, keep safe) ──
  { regex: /\btext-green-900\b/g,        replace: 'text-white' },
  { regex: /\btext-emerald-900\b/g,      replace: 'text-white' },

  // ── Green border on table header ─────────────────────────────────────────
  { regex: /\bborder-green-700\b/g,      replace: 'border-blue-800' },
  { regex: /\bborder-green-600\b/g,      replace: 'border-blue-700' },
  { regex: /\bborder-emerald-700\b/g,    replace: 'border-blue-800' },
  { regex: /\bborder-emerald-600\b/g,    replace: 'border-blue-700' },
  { regex: /\bborder-teal-700\b/g,       replace: 'border-blue-800' },

  // ── Gradient headers (green gradient → blue gradient like Image 1) ────────
  { regex: /from-green-600 to-green-800/g,   replace: 'from-blue-600 to-blue-800' },
  { regex: /from-green-500 to-green-700/g,   replace: 'from-blue-500 to-blue-700' },
  { regex: /from-emerald-600 to-emerald-800/g, replace: 'from-blue-600 to-blue-800' },
  { regex: /from-emerald-500 to-teal-600/g,  replace: 'from-blue-600 to-blue-800' },
  { regex: /from-teal-500 to-teal-700/g,     replace: 'from-blue-600 to-blue-800' },

  // ── Sticky/fixed header green → blue ─────────────────────────────────────
  { regex: /\bsticky top-0 bg-green-600\b/g, replace: 'sticky top-0 bg-blue-700' },
  { regex: /\bsticky top-0 bg-emerald-600\b/g, replace: 'sticky top-0 bg-blue-700' },

  // ── Hover rows — keep table row hover subtle (not green) ─────────────────
  { regex: /\bhover:bg-green-50\b/g,     replace: 'hover:bg-blue-50' },
  { regex: /\bhover:bg-emerald-50\b/g,   replace: 'hover:bg-blue-50' },

  // ── Active/selected row highlight ────────────────────────────────────────
  { regex: /\bbg-green-100\b/g,          replace: 'bg-blue-100' },
  { regex: /\bbg-emerald-100\b/g,        replace: 'bg-blue-100' },

  // ── Pagination active button green → blue ────────────────────────────────
  { regex: /\bbg-green-600 text-white rounded\b/g, replace: 'bg-blue-600 text-white rounded' },
];

// ─── PROCESS FILE ─────────────────────────────────────────────────────────────

function processFile(filePath) {
  let content  = fs.readFileSync(filePath, 'utf8');
  let original = content;

  tableHeaderRules.forEach(rule => {
    content = content.replace(rule.regex, rule.replace);
  });

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
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat     = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      count += traverseDirectory(fullPath);
    } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
      if (processFile(fullPath)) count++;
    }
  }

  return count;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
console.log('\n🔵 Starting Table Header Blue Conversion...');
console.log('🎨 Target: Blue table headers (matching Recruitment dashboard)\n');

let totalUpdated = 0;

DIRECTORIES.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`📁 Scanning: ${path.relative(__dirname, dir)}`);
    totalUpdated += traverseDirectory(dir);
  } else {
    console.log(`⚠️  Not found (skipped): ${path.relative(__dirname, dir)}`);
  }
});

console.log(`\n✅ Done! Updated ${totalUpdated} files`);
console.log('\n✨ Changes Applied:');
console.log('   • Table headers: green/emerald/teal → bg-blue-700');
console.log('   • Header borders: green → border-blue-800');
console.log('   • Gradient headers: green gradient → blue gradient');
console.log('   • Row hover: green-50 → blue-50');
console.log('   • Pagination active: green → blue-600');
console.log('\n💡 TIP: If your header still shows green, check for inline styles');
console.log('   or custom hex colors and add them to tableHeaderRules above.\n');