// timely-theme-converter.js
const fs = require('fs');
const path = require('path');

const directories = [
  path.join(__dirname, 'src', 'Pages'),
  path.join(__dirname, 'src', 'Components')
];

// TIMELY HEALTH Theme - Blue (#2563EB) & Green (#10B981)
const themeRules = [
  // Remove all dark backgrounds
  { regex: /bg-\[\#0a0a0a\]/g, replace: 'bg-white' },
  { regex: /bg-\[\#000000\]/g, replace: 'bg-gray-50' },
  { regex: /bg-\[\#111111\]/g, replace: 'bg-gray-100' },
  { regex: /bg-\[\#1a1a1a\]/g, replace: 'bg-gray-100' },
  { regex: /bg-black/g, replace: 'bg-white' },
  { regex: /bg-black\/90/g, replace: 'bg-white/90' },
  { regex: /bg-black\/80/g, replace: 'bg-white/80' },
  { regex: /bg-\[\#1f2937\]/g, replace: 'bg-gray-100' },
  { regex: /bg-gray-900/g, replace: 'bg-gray-100' },
  { regex: /bg-gray-800/g, replace: 'bg-gray-200' },
  
  // Text colors - dark for readability
  { regex: /text-white/g, replace: 'text-gray-900' },
  { regex: /text-gray-100/g, replace: 'text-gray-900' },
  { regex: /text-gray-200/g, replace: 'text-gray-800' },
  { regex: /text-gray-300/g, replace: 'text-gray-700' },
  { regex: /text-gray-400/g, replace: 'text-gray-500' },
  
  // PRIMARY BLUE (#2563EB) - Main brand color
  { regex: /bg-emerald-500/g, replace: 'bg-blue-600' },
  { regex: /bg-emerald-600/g, replace: 'bg-blue-600' },
  { regex: /bg-emerald-400/g, replace: 'bg-blue-500' },
  { regex: /bg-blue-500/g, replace: 'bg-blue-600' },
  { regex: /hover:bg-emerald-500/g, replace: 'hover:bg-blue-700' },
  { regex: /hover:bg-emerald-600/g, replace: 'hover:bg-blue-700' },
  { regex: /hover:bg-blue-500/g, replace: 'hover:bg-blue-700' },
  
  // Text Blue
  { regex: /text-emerald-400/g, replace: 'text-blue-600' },
  { regex: /text-emerald-500/g, replace: 'text-blue-600' },
  { regex: /text-emerald-600/g, replace: 'text-blue-700' },
  { regex: /text-blue-500/g, replace: 'text-blue-600' },
  { regex: /text-blue-400/g, replace: 'text-blue-500' },
  
  // SECONDARY GREEN (#10B981) - For success/positive/health metrics
  { regex: /text-green-600/g, replace: 'text-emerald-600' },
  { regex: /text-green-500/g, replace: 'text-emerald-500' },
  { regex: /bg-green-500/g, replace: 'bg-emerald-500' },
  { regex: /bg-green-600/g, replace: 'bg-emerald-600' },
  { regex: /hover:bg-green-500/g, replace: 'hover:bg-emerald-600' },
  
  // Badges - Light versions
  { regex: /bg-green-100 text-green-800/g, replace: 'bg-emerald-50 text-emerald-700' },
  { regex: /bg-red-100 text-red-800/g, replace: 'bg-red-50 text-red-700' },
  { regex: /bg-yellow-100 text-yellow-800/g, replace: 'bg-amber-50 text-amber-700' },
  { regex: /bg-blue-100 text-blue-800/g, replace: 'bg-blue-50 text-blue-700' },
  
  // Borders
  { regex: /border-\[\#1f2937\]/g, replace: 'border-gray-200' },
  { regex: /border-\[\#374151\]/g, replace: 'border-gray-300' },
  { regex: /border-gray-700/g, replace: 'border-gray-300' },
  { regex: /border-gray-800/g, replace: 'border-gray-300' },
  { regex: /border-emerald-500/g, replace: 'border-blue-500' },
  { regex: /border-emerald-600/g, replace: 'border-blue-600' },
  
  // Dividers
  { regex: /divide-\[\#1f2937\]/g, replace: 'divide-gray-200' },
  
  // Cards - White with subtle shadow
  { regex: /bg-\[\#0a0a0a\] border border-\[\#1f2937\] rounded-xl/g, replace: 'bg-white border border-gray-200 rounded-xl shadow-sm' },
  { regex: /bg-\[\#0a0a0a\] rounded-xl/g, replace: 'bg-white border border-gray-200 rounded-xl shadow-sm' },
  { regex: /bg-\[\#0a0a0a\] rounded-lg/g, replace: 'bg-white border border-gray-200 rounded-lg shadow-sm' },
  
  // Hover states
  { regex: /hover:bg-\[\#1a1a1a\]/g, replace: 'hover:bg-gray-50' },
  { regex: /hover:bg-\[\#1f2937\]/g, replace: 'hover:bg-gray-100' },
  
  // Shadows
  { regex: /shadow-lg shadow-black\/20/g, replace: 'shadow-md' },
  { regex: /shadow-xl shadow-black\/30/g, replace: 'shadow-lg' },
  
  // Focus rings
  { regex: /ring-emerald-500/g, replace: 'ring-blue-500' },
  { regex: /focus:ring-emerald-500/g, replace: 'focus:ring-blue-500' }
];

// SIDEBAR - White with Blue active state
function processSidebar(content) {
  const rules = [
    { regex: /bg-\[\#000000\]/g, replace: 'bg-white' },
    { regex: /bg-\[\#0a0a0a\]/g, replace: 'bg-gray-50' },
    { regex: /bg-\[\#111111\]/g, replace: 'bg-gray-50' },
    { regex: /text-gray-300/g, replace: 'text-gray-600' },
    { regex: /text-gray-400/g, replace: 'text-gray-500' },
    { regex: /text-gray-500/g, replace: 'text-gray-500' },
    { regex: /border-\[\#1f2937\]/g, replace: 'border-gray-200' },
    { regex: /hover:bg-\[\#111111\]/g, replace: 'hover:bg-blue-50' },
    { regex: /hover:bg-\[\#1f2937\]/g, replace: 'hover:bg-blue-50' },
    // Active menu item - Blue
    { regex: /bg-emerald-600 text-white/g, replace: 'bg-blue-600 text-white' },
    { regex: /bg-emerald-600\/80 text-white shadow-lg/g, replace: 'bg-blue-600 text-white shadow-md' },
    { regex: /text-emerald-400/g, replace: 'text-blue-600' },
    { regex: /group-hover:text-emerald-400/g, replace: 'group-hover:text-blue-600' },
    { regex: /hover:text-emerald-400/g, replace: 'hover:text-blue-600' },
    // Footer section
    { regex: /bg-\[\#0a0a0a\]/g, replace: 'bg-gray-50' },
    { regex: /text-gray-500/g, replace: 'text-gray-500' }
  ];
  
  rules.forEach(rule => {
    content = content.replace(rule.regex, rule.replace);
  });
  return content;
}

// NAVBAR - White with Blue border
function processNavbar(content) {
  const rules = [
    { regex: /bg-\[\#000000\]/g, replace: 'bg-white' },
    { regex: /text-gray-200/g, replace: 'text-gray-800' },
    { regex: /text-gray-300/g, replace: 'text-gray-600' },
    { regex: /hover:bg-\[\#111111\]/g, replace: 'hover:bg-gray-100' },
    { regex: /border-b border-\[\#1f2937\]/g, replace: 'border-b border-gray-200' },
    // Primary buttons - Blue
    { regex: /bg-emerald-600/g, replace: 'bg-blue-600' },
    { regex: /hover:bg-emerald-500/g, replace: 'hover:bg-blue-700' },
    { regex: /bg-indigo-600/g, replace: 'bg-blue-600' },
    { regex: /hover:bg-indigo-500/g, replace: 'hover:bg-blue-700' },
    // Brand badge
    { regex: /bg-\[\#111111\] border border-\[\#1f2937\] text-emerald-400/g, replace: 'bg-blue-50 border border-blue-200 text-blue-700' },
    // Notification/Profile
    { regex: /hover:text-emerald-400/g, replace: 'hover:text-blue-600' }
  ];
  
  rules.forEach(rule => {
    content = content.replace(rule.regex, rule.replace);
  });
  return content;
}

// DASHBOARD CARDS
function processDashboard(content) {
  const rules = [
    { regex: /bg-\[\#0a0a0a\] border border-\[\#1f2937\] rounded-xl/g, replace: 'bg-white border border-gray-200 rounded-xl shadow-sm' },
    { regex: /bg-\[\#0a0a0a\] rounded-xl/g, replace: 'bg-white border border-gray-200 rounded-xl shadow-sm' },
    { regex: /text-emerald-400/g, replace: 'text-blue-600' },
    { regex: /text-emerald-300/g, replace: 'text-blue-500' },
    // Stat cards with gradient - make it subtle blue
    { regex: /from-\[\#000000\]/g, replace: 'from-blue-50' },
    { regex: /to-\[\#0a0a0a\]/g, replace: 'to-white' }
  ];
  
  rules.forEach(rule => {
    content = content.replace(rule.regex, rule.replace);
  });
  return content;
}

// TABLES
function processTables(content) {
  const rules = [
    { regex: /hover:bg-\[\#1a1a1a\]/g, replace: 'hover:bg-gray-50' },
    { regex: /even:bg-\[\#0a0a0a\]/g, replace: 'even:bg-gray-50' }
  ];
  
  rules.forEach(rule => {
    content = content.replace(rule.regex, rule.replace);
  });
  return content;
}

// Icons - Blue color
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
    console.log(`  🎨 Sidebar → Blue theme`);
  }
  
  if (fileName.includes('navbar')) {
    content = processNavbar(content);
    console.log(`  🎨 Navbar → Blue theme`);
  }
  
  if (fileName.includes('dashboard') || fileName.includes('home') || 
      fileName.includes('hr') || fileName.includes('attendance') ||
      fileName.includes('employee')) {
    content = processDashboard(content);
    content = processTables(content);
    console.log(`  🎨 Dashboard → White cards + Blue accents`);
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

console.log('\n💙💚 Starting TIMELY HEALTH Theme Conversion...');
console.log('🎨 Primary: Blue (#2563EB) | Secondary: Green (#10B981)');
console.log('📱 Target: Clean white background with healthcare professional look\n');

let totalUpdated = 0;
directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`📁 Scanning: ${path.relative(__dirname, dir)}`);
    totalUpdated += traverseDirectory(dir);
  }
});

console.log(`\n✅ Conversion Complete!`);
console.log(`📊 Updated ${totalUpdated} files`);
console.log('\n✨ TIMELY HEALTH Theme Applied:');
console.log('   • White/light backgrounds');
console.log('   • 🔵 Blue primary buttons & active states');
console.log('   • 🟢 Green for success/health metrics');
console.log('   • Clean medical/healthcare professional look');
console.log('   • Sidebar & Navbar now match brand colors');