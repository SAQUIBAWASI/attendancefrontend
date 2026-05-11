// final-blue-theme.js
const fs = require('fs');
const path = require('path');

const srcDirs = [
  path.join(__dirname, 'src', 'Pages'),
  path.join(__dirname, 'src', 'Components')
];

// Special files jinhe blue theme dena hai (sidebar + navbar)
const blueThemeFiles = [
  'sidebar', 'Sidebar',
  'navbar', 'Navbar', 
  'EmployeeSidebar', 'employeesidebar',
  'EmployeeNavbar', 'employeenavbar'
];

function shouldApplyBlueTheme(filePath) {
  const lowerPath = filePath.toLowerCase();
  return blueThemeFiles.some(file => lowerPath.includes(file.toLowerCase()));
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  const applyBlue = shouldApplyBlueTheme(filePath);
  
  // ==================== SIDEBAR & NAVBAR (BLUE THEME) ====================
  if (applyBlue) {
    console.log(`🔵 Processing Blue Theme: ${path.basename(filePath)}`);
    
    // Background to Blue
    content = content.replace(/bg-\[\#0a0a0a\]/g, 'bg-blue-800');
    content = content.replace(/bg-\[\#000000\]/g, 'bg-blue-800');
    content = content.replace(/bg-\[\#111111\]/g, 'bg-blue-700');
    content = content.replace(/bg-\[\#1f2937\]/g, 'bg-blue-700');
    content = content.replace(/bg-black/g, 'bg-blue-800');
    content = content.replace(/bg-gray-900/g, 'bg-blue-800');
    content = content.replace(/bg-gray-800/g, 'bg-blue-700');
    content = content.replace(/bg-gray-700/g, 'bg-blue-600');
    content = content.replace(/bg-white/g, 'bg-blue-800');
    content = content.replace(/bg-gray-50/g, 'bg-blue-800');
    content = content.replace(/bg-gray-100/g, 'bg-blue-800');
    
    // Text to White
    content = content.replace(/text-gray-[0-9]+/g, 'text-white');
    content = content.replace(/text-white/g, 'text-white');
    content = content.replace(/text-black/g, 'text-white');
    content = content.replace(/text-gray-50/g, 'text-white');
    content = content.replace(/text-gray-100/g, 'text-white');
    
    // Borders to Blue variants
    content = content.replace(/border-\[\#1f2937\]/g, 'border-blue-600');
    content = content.replace(/border-gray-[0-9]+/g, 'border-blue-500');
    content = content.replace(/border-white/g, 'border-blue-500');
    
    // Hover states
    content = content.replace(/hover:bg-\[\#111111\]/g, 'hover:bg-blue-600');
    content = content.replace(/hover:bg-gray-[0-9]+/g, 'hover:bg-blue-600');
    content = content.replace(/hover:bg-white/g, 'hover:bg-blue-600');
    content = content.replace(/hover:bg-gray-50/g, 'hover:bg-blue-600');
    content = content.replace(/hover:bg-gray-100/g, 'hover:bg-blue-600');
    
    // Active/Selected item
    content = content.replace(/bg-emerald-600/g, 'bg-blue-500');
    content = content.replace(/bg-emerald-500/g, 'bg-blue-500');
    content = content.replace(/text-emerald-400/g, 'text-white');
    content = content.replace(/text-emerald-300/g, 'text-white');
    
    // Icons color
    content = content.replace(/text-gray-400/g, 'text-blue-200');
    content = content.replace(/text-gray-500/g, 'text-blue-200');
    
    // Fix any remaining dark classes
    content = content.replace(/dark:/g, '');
  }
  
  // ==================== MODALS (TRANSPARENT BACKGROUND) ====================
  // Modal overlay with blur effect
  content = content.replace(
    /(fixed inset-0 bg-black bg-opacity-\d+)/g,
    'fixed inset-0 bg-black/40 backdrop-blur-sm'
  );
  
  content = content.replace(
    /(fixed inset-0 bg-black\/[0-9]+)/g,
    'fixed inset-0 bg-black/40 backdrop-blur-sm'
  );
  
  // Modal content - white background
  content = content.replace(
    /(bg-\[\#1f2937\]|bg-gray-800|bg-\[\#0a0a0a\])(?=\s+rounded|\s+shadow)/g,
    'bg-white'
  );
  
  // Modal text colors
  content = content.replace(/text-gray-200/g, 'text-gray-800');
  content = content.replace(/text-gray-300/g, 'text-gray-700');
  content = content.replace(/text-gray-400/g, 'text-gray-600');
  content = content.replace(/text-white(?!.*shadow)/g, 'text-gray-900');
  
  // ==================== REST OF THE APP (LIGHT THEME) ====================
  if (!applyBlue) {
    console.log(`⚪ Processing Light Theme: ${path.basename(filePath)}`);
    
    // Backgrounds to Light
    content = content.replace(/bg-\[\#0a0a0a\]/g, 'bg-white');
    content = content.replace(/bg-\[\#000000\]/g, 'bg-gray-50');
    content = content.replace(/bg-\[\#111111\]/g, 'bg-gray-50');
    content = content.replace(/bg-\[\#1f2937\]/g, 'bg-gray-100');
    content = content.replace(/bg-black/g, 'bg-white');
    content = content.replace(/bg-gray-900/g, 'bg-white');
    content = content.replace(/bg-gray-800/g, 'bg-gray-100');
    
    // Text colors to Dark
    content = content.replace(/text-gray-200/g, 'text-gray-800');
    content = content.replace(/text-gray-300/g, 'text-gray-700');
    content = content.replace(/text-gray-400/g, 'text-gray-600');
    content = content.replace(/text-white(?!.*shadow)/g, 'text-gray-900');
    
    // Borders to Light
    content = content.replace(/border-\[\#1f2937\]/g, 'border-gray-200');
    content = content.replace(/border-gray-700/g, 'border-gray-200');
    content = content.replace(/border-gray-800/g, 'border-gray-200');
  }
  
  // ==================== BUTTONS (BLUE PRIMARY) ====================
  // Primary buttons - Blue (for all files except sidebar/navbar buttons)
  content = content.replace(/bg-emerald-600/g, 'bg-blue-600');
  content = content.replace(/bg-emerald-500/g, 'bg-blue-500');
  content = content.replace(/bg-emerald-700/g, 'bg-blue-700');
  content = content.replace(/hover:bg-emerald-700/g, 'hover:bg-blue-700');
  content = content.replace(/hover:bg-emerald-600/g, 'hover:bg-blue-600');
  
  // Text colors emerald to blue
  content = content.replace(/text-emerald-600/g, 'text-blue-600');
  content = content.replace(/text-emerald-500/g, 'text-blue-500');
  content = content.replace(/text-emerald-400/g, 'text-blue-400');
  
  // Focus rings
  content = content.replace(/ring-emerald-500/g, 'ring-blue-500');
  content = content.replace(/focus:ring-emerald-500/g, 'focus:ring-blue-500');
  
  // ==================== DASHBOARD CARDS ====================
  if (filePath.toLowerCase().includes('dashboard')) {
    content = content.replace(/bg-\[\#111111\]/g, 'bg-white');
    content = content.replace(/bg-\[\#1f2937\]/g, 'bg-gray-50');
    content = content.replace(/border-\[\#1f2937\]/g, 'border-gray-200');
    content = content.replace(/shadow-\[\#0a0a0a\]/g, 'shadow-gray-200');
  }
  
  // ==================== REMOVE DARK MODE CLASSES ====================
  content = content.replace(/dark:/g, '');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`   ✅ Updated: ${path.basename(filePath)}`);
  }
}

function traverseDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      traverseDirectory(fullPath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      processFile(fullPath);
    }
  }
}

console.log('🎨 Applying Blue Theme + Transparent Modals...\n');
console.log('📁 Files to convert:\n');

srcDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    traverseDirectory(dir);
  }
});

console.log('\n✨ Done! Refresh your browser to see changes.');
console.log('\n📝 Summary:');
console.log('   🔵 Sidebar & Navbar → Blue background + White text');
console.log('   🪟 Modals → Transparent background with blur effect');
console.log('   ⚪ Other pages → Light theme (white/gray backgrounds)');
console.log('   🔘 Buttons → Blue color');