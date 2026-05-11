const fs = require('fs');
const path = require('path');

// YE FILES CHANGE HONGI - Sidebar aur Navbar files
const sidebarFiles = [
  'src/Components/Sidebar.jsx',
  'src/Components/EmployeeSidebar.jsx'
];

const navbarFiles = [
  'src/Components/Navbar.jsx',
  'src/Components/EmployeeNavbar.jsx'
];

// Saari Pages aur Components folders ki files
const srcDirs = [
  path.join(__dirname, 'src', 'Pages'),
  path.join(__dirname, 'src', 'Components')
];

// Image ke hisaab se DARK THEME colors
const darkThemeColors = [
  // Backgrounds
  { regex: /bg-white/g, replace: 'bg-[#0D1117]' },
  { regex: /bg-gray-50/g, replace: 'bg-[#0D1117]' },
  { regex: /bg-gray-100/g, replace: 'bg-[#161B22]' },
  { regex: /bg-gray-200/g, replace: 'bg-[#21262D]' },
  { regex: /bg-slate-50/g, replace: 'bg-[#0D1117]' },
  { regex: /bg-slate-100/g, replace: 'bg-[#161B22]' },
  
  // Text colors
  { regex: /text-gray-900/g, replace: 'text-[#E6EDF3]' },
  { regex: /text-gray-800/g, replace: 'text-[#E6EDF3]' },
  { regex: /text-gray-700/g, replace: 'text-[#C9D1D9]' },
  { regex: /text-gray-600/g, replace: 'text-[#8B949E]' },
  { regex: /text-gray-500/g, replace: 'text-[#8B949E]' },
  { regex: /text-black/g, replace: 'text-[#E6EDF3]' },
  
  // Border colors
  { regex: /border-gray-200/g, replace: 'border-[#21262D]' },
  { regex: /border-gray-300/g, replace: 'border-[#30363D]' },
  
  // Hover states
  { regex: /hover:bg-gray-100/g, replace: 'hover:bg-[#21262D]' },
  { regex: /hover:bg-gray-50/g, replace: 'hover:bg-[#161B22]' },
  
  // Accent colors (Green jaisa image mein)
  { regex: /bg-blue-600/g, replace: 'bg-[#238636]' },
  { regex: /bg-blue-500/g, replace: 'bg-[#2EA043]' },
  { regex: /text-blue-600/g, replace: 'text-[#2EA043]' },
  
  // Card backgrounds
  { regex: /bg-white\/90/g, replace: 'bg-[#0D1117]/90' },
  { regex: /bg-white\/80/g, replace: 'bg-[#0D1117]/80' },
];

// SIDEBAR specific changes
function processSidebars() {
  sidebarFiles.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (!fs.existsSync(fullPath)) {
      console.log(`❌ File not found: ${file}`);
      return;
    }
    let content = fs.readFileSync(fullPath, 'utf8');
    let original = content;
    
    content = content.replace(/bg-\[\#.*?\]/g, 'bg-[#0D1117]');
    content = content.replace(/bg-gray-[\d]+/g, 'bg-[#161B22]');
    content = content.replace(/text-white/g, 'text-[#E6EDF3]');
    content = content.replace(/text-gray-[\d]+/g, 'text-[#C9D1D9]');
    content = content.replace(/border-[\w-]+/g, 'border-[#21262D]');
    content = content.replace(/bg-emerald-600/g, 'bg-[#238636]');
    content = content.replace(/text-emerald-400/g, 'text-[#2EA043]');
    
    if (content !== original) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Updated Sidebar: ${file}`);
    }
  });
}

// NAVBAR specific changes
function processNavbars() {
  navbarFiles.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (!fs.existsSync(fullPath)) {
      console.log(`❌ File not found: ${file}`);
      return;
    }
    let content = fs.readFileSync(fullPath, 'utf8');
    let original = content;
    
    content = content.replace(/bg-blue-[\d]+/g, 'bg-[#161B22]');
    content = content.replace(/bg-[\#\w-]+/g, 'bg-[#0D1117]');
    content = content.replace(/text-white/g, 'text-[#E6EDF3]');
    content = content.replace(/border-[\w-]+/g, 'border-[#21262D]');
    content = content.replace(/shadow-[\w]+/g, '');
    
    if (content !== original) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Updated Navbar: ${file}`);
    }
  });
}

// Saari dusri files ke liye
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  darkThemeColors.forEach(r => {
    content = content.replace(r.regex, r.replace);
  });
  
  content = content.replace(/bg-opacity-[\d]+/g, '');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${path.basename(filePath)}`);
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

// RUN sab kuch
console.log('\n🚀 Starting Dark Theme Conversion...\n');
console.log('📁 Converting Sidebars...');
processSidebars();
console.log('\n📁 Converting Navbars...');
processNavbars();
console.log('\n📁 Converting Pages & Components...');
srcDirs.forEach(dir => traverseDirectory(dir));
console.log('\n✅ DONE! Restart your dev server to see changes.\n');