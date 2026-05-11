// light-theme-converter.js
const fs = require('fs');
const path = require('path');

const directories = [
  path.join(__dirname, 'src', 'Pages'),
  path.join(__dirname, 'src', 'Components')
];

// Light Professional Theme - White background with Blue & Green accents
const themeRules = [
  // Remove any dark backgrounds - convert to white/light
  { regex: /bg-\[\#0a0a0a\]/g, replace: 'bg-white' },
  { regex: /bg-\[\#000000\]/g, replace: 'bg-gray-50' },
  { regex: /bg-\[\#111111\]/g, replace: 'bg-gray-100' },
  { regex: /bg-\[\#1a1a1a\]/g, replace: 'bg-gray-100' },
  { regex: /bg-black/g, replace: 'bg-white' },
  { regex: /bg-black\/90/g, replace: 'bg-white/90' },
  { regex: /bg-black\/80/g, replace: 'bg-white/80' },
  
  // Ensure white/light backgrounds
  { regex: /bg-\[\#1f2937\]/g, replace: 'bg-gray-100' },
  { regex: /bg-gray-900/g, replace: 'bg-gray-100' },
  { regex: /bg-gray-800/g, replace: 'bg-gray-200' },
  
  // Text colors - dark for light background
  { regex: /text-white/g, replace: 'text-gray-900' },
  { regex: /text-gray-100/g, replace: 'text-gray-900' },
  { regex: /text-gray-200/g, replace: 'text-gray-800' },
  { regex: /text-gray-300/g, replace: 'text-gray-700' },
  { regex: /text-gray-400/g, replace: 'text-gray-600' },
  
  // Blue accents (primary)
  { regex: /bg-emerald-500/g, replace: 'bg-blue-500' },
  { regex: /bg-emerald-600/g, replace: 'bg-blue-600' },
  { regex: /bg-emerald-400/g, replace: 'bg-blue-400' },
  { regex: /text-emerald-400/g, replace: 'text-blue-600' },
  { regex: /text-emerald-500/g, replace: 'text-blue-600' },
  { regex: /text-emerald-600/g, replace: 'text-blue-700' },
  { regex: /hover:bg-emerald-500/g, replace: 'hover:bg-blue-500' },
  { regex: /hover:bg-emerald-600/g, replace: 'hover:bg-blue-600' },
  
  // Green accents (for success/positive metrics)
  { regex: /bg-green-500/g, replace: 'bg-emerald-500' },
  { regex: /text-green-600/g, replace: 'text-emerald-600' },
  { regex: /text-green-500/g, replace: 'text-emerald-500' },
  
  // Borders - light for clean look
  { regex: /border-\[\#1f2937\]/g, replace: 'border-gray-200' },
  { regex: /border-\[\#374151\]/g, replace: 'border-gray-300' },
  { regex: /border-gray-700/g, replace: 'border-gray-300' },
  { regex: /border-gray-800/g, replace: 'border-gray-300' },
  
  // Dividers
  { regex: /divide-\[\#1f2937\]/g, replace: 'divide-gray-200' },
  
  // Cards - white with subtle shadow
  { regex: /bg-\[\#0a0a0a\] border border-\[\#1f2937\] rounded-xl/g, replace: 'bg-white border border-gray-200 rounded-xl shadow-sm' },
  { regex: /bg-\[\#0a0a0a\] border border-\[\#1f2937\] rounded-lg/g, replace: 'bg-white border border-gray-200 rounded-lg shadow-sm' },
  
  // Table hover states
  { regex: /hover:bg-\[\#1a1a1a\]/g, replace: 'hover:bg-gray-50' },
  { regex: /hover:bg-\[\#1f2937\]/g, replace: 'hover:bg-gray-100' },
  
  // Badges - light backgrounds
  { regex: /bg-emerald-900\/30 text-emerald-400 border border-emerald-800/g, replace: 'bg-green-100 text-green-700 border-green-200' },
  { regex: /bg-red-900\/30 text-red-400 border border-red-800/g, replace: 'bg-red-100 text-red-700 border-red-200' },
  { regex: /bg-yellow-900\/30 text-yellow-400 border border-yellow-800/g, replace: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  
  // Shadows
  { regex: /shadow-lg shadow-black\/20/g, replace: 'shadow-md' },
  { regex: /shadow-xl shadow-black\/30/g, replace: 'shadow-lg' }
];

// Sidebar - Light theme with blue accent
function processSidebar(content) {
  const rules = [
    { regex: /bg-\[\#000000\]/g, replace: 'bg-white' },
    { regex: /bg-\[\#0a0a0a\]/g, replace: 'bg-gray-50' },
    { regex: /bg-\[\#111111\]/g, replace: 'bg-gray-100' },
    { regex: /text-gray-300/g, replace: 'text-gray-700' },
    { regex: /text-gray-400/g, replace: 'text-gray-500' },
    { regex: /text-gray-500/g, replace: 'text-gray-500' },
    { regex: /border-\[\#1f2937\]/g, replace: 'border-gray-200' },
    { regex: /hover:bg-\[\#111111\]/g, replace: 'hover:bg-blue-50' },
    // Active state - blue
    { regex: /bg-emerald-600 text-white/g, replace: 'bg-blue-600 text-white' },
    { regex: /text-emerald-400/g, replace: 'text-blue-600' },
    { regex: /hover:text-emerald-400/g, replace: 'hover:text-blue-600' }
  ];
  
  rules.forEach(rule => {
    content = content.replace(rule.regex, rule.replace);
  });
  return content;
}

// Navbar - Light with blue
function processNavbar(content) {
  const rules = [
    { regex: /bg-\[\#000000\]/g, replace: 'bg-white' },
    { regex: /text-gray-200/g, replace: 'text-gray-800' },
    { regex: /hover:bg-\[\#111111\]/g, replace: 'hover:bg-gray-100' },
    { regex: /border-b border-\[\#1f2937\]/g, replace: 'border-b border-gray-200' },
    { regex: /bg-emerald-600/g, replace: 'bg-blue-600' },
    { regex: /hover:bg-emerald-500/g, replace: 'hover:bg-blue-500' },
    { regex: /bg-indigo-600/g, replace: 'bg-blue-600' },
    { regex: /hover:bg-indigo-500/g, replace: 'hover:bg-blue-500' },
    // Brand/Title
    { regex: /bg-\[\#111111\] border border-\[\#1f2937\] text-emerald-400/g, replace: 'bg-blue-50 border border-blue-200 text-blue-700' }
  ];
  
  rules.forEach(rule => {
    content = content.replace(rule.regex, rule.replace);
  });
  return content;
}

// Dashboard Cards - Clean white with blue accents
function processDashboard(content) {
  const rules = [
    { regex: /bg-\[\#0a0a0a\] border border-\[\#1f2937\] rounded-xl/g, replace: 'bg-white border border-gray-200 rounded-xl shadow-sm' },
    { regex: /bg-\[\#0a0a0a\] rounded-xl/g, replace: 'bg-white border border-gray-200 rounded-xl shadow-sm' },
    // Stats cards
    { regex: /text-emerald-400/g, replace: 'text-blue-600' },
    { regex: /text-emerald-300/g, replace: 'text-blue-500' }
  ];
  
  rules.forEach(rule => {
    content = content.replace(rule.regex, rule.replace);
  });
  return content;
}

// Calendar icons - blue
function fixIcons(content) {
  content = content.replace(/<FaCalendarAlt className="([^"]*)"([^>]*)>/g, (match, classes, rest) => {
    if (classes.includes('text-emerald-400')) {
      return `<FaCalendarAlt className="${classes.replace('text-emerald-400', 'text-blue-500')}"${rest}>`;
    }
    if (!classes.includes('text-')) {
      return `<FaCalendarAlt className="${classes} text-blue-500"${rest}>`;
    }
    return match;
  });
  
  content = content.replace(/<FiCalendar className="([^"]*)"([^>]*)>/g, (match, classes, rest) => {
    if (classes.includes('text-emerald-400')) {
      return `<FiCalendar className="${classes.replace('text-emerald-400', 'text-blue-500')}"${rest}>`;
    }
    if (!classes.includes('text-')) {
      return `<FiCalendar className="${classes} text-blue-500"${rest}>`;
    }
    return match;
  });
  
  return content;
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  let fileName = path.basename(filePath).toLowerCase();
  
  // Apply general theme rules
  themeRules.forEach(rule => {
    content = content.replace(rule.regex, rule.replace);
  });
  
  // Apply component-specific rules
  if (fileName.includes('sidebar')) {
    content = processSidebar(content);
    console.log(`  → Applied Sidebar styles`);
  }
  
  if (fileName.includes('navbar')) {
    content = processNavbar(content);
    console.log(`  → Applied Navbar styles`);
  }
  
  if (fileName.includes('dashboard') || fileName.includes('home') || 
      fileName.includes('hr') || fileName.includes('attendance')) {
    content = processDashboard(content);
    console.log(`  → Applied Dashboard styles`);
  }
  
  // Fix icons
  content = fixIcons(content);
  
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
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      count += traverseDirectory(fullPath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      if (processFile(fullPath)) count++;
    }
  }
  return count;
}

console.log('\n🌈 Starting Light Theme Conversion...');
console.log('🎨 Target: White background with Blue & Green accents\n');

let totalUpdated = 0;
directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`📁 Scanning: ${path.relative(__dirname, dir)}`);
    totalUpdated += traverseDirectory(dir);
  }
});

console.log(`\n✅ Conversion Complete!`);
console.log(`📊 Updated ${totalUpdated} files`);
console.log('\n✨ New Light Theme:');
console.log('   • White/light backgrounds');
console.log('   • Blue primary accents');
console.log('   • Green for success metrics');
console.log('   • Clean, professional look');