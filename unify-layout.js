const fs = require('fs');
const path = require('path');

const sidebarFiles = [
  'src/Components/Sidebar.jsx',
  'src/Components/EmployeeSidebar.jsx'
];

const navbarFiles = [
  'src/Components/Navbar.jsx',
  'src/Components/EmployeeNavbar.jsx'
];

function processSidebars() {
  sidebarFiles.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (!fs.existsSync(fullPath)) {
      console.log(`Skipping ${file}`);
      return;
    }
    let content = fs.readFileSync(fullPath, 'utf8');

    // Sidebar Container
    content = content.replace(/bg-\[\#1f2937\] text-white/g, 'bg-[#000000] text-gray-200');
    content = content.replace(/border-blue-800\/50/g, 'border-[#1f2937]');
    
    // Header
    content = content.replace(/bg-blue-900\/40 border-blue-700\/50/g, 'bg-[#0a0a0a] border-[#1f2937]');
    content = content.replace(/text-blue-100/g, 'text-gray-300');
    
    // Active/Hover States
    content = content.replace(/"bg-emerald-600\/80 text-white shadow-lg"/g, '"bg-emerald-600 text-white shadow-[0_0_10px_rgba(5,150,105,0.4)]"');
    content = content.replace(/"bg-blue-700\/70"/g, '"bg-[#1f2937]"');
    content = content.replace(/"hover:bg-blue-700\/60"/g, '"hover:bg-[#111111]"');
    
    // Icons/Text in items
    content = content.replace(/text-blue-100 group-hover:text-emerald-300/g, 'text-gray-400 group-hover:text-emerald-400');
    content = content.replace(/text-blue-300 hover:text-white/g, 'text-gray-400 hover:text-white');
    content = content.replace(/hover:bg-blue-600\/50/g, 'hover:bg-[#1f2937]');
    content = content.replace(/text-blue-100 hover:text-emerald-300/g, 'text-gray-400 hover:text-emerald-400');
    
    // Footer
    content = content.replace(/text-blue-200\/60 border-t border-blue-700\/50 bg-blue-900\/20/g, 'text-gray-500 border-t border-[#1f2937] bg-[#0a0a0a]');
    content = content.replace(/text-blue-200\/80/g, 'text-gray-400');
    content = content.replace(/bg-blue-800\/50 hover:bg-blue-700\/70/g, 'bg-[#111111] hover:bg-[#1f2937]');
    content = content.replace(/text-blue-200/g, 'text-gray-300'); // General fallback

    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated Sidebar: ${file}`);
  });
}

function processNavbars() {
  navbarFiles.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (!fs.existsSync(fullPath)) {
      console.log(`Skipping ${file}`);
      return;
    }
    let content = fs.readFileSync(fullPath, 'utf8');

    // Navbar Container
    content = content.replace(/bg-blue-800/g, 'bg-[#000000] border-b border-[#1f2937]');
    content = content.replace(/shadow-md/g, ''); // Remove shadow as we use border now
    content = content.replace(/text-white/g, 'text-gray-200');
    
    // Title Badge
    content = content.replace(/bg-blue-700/g, 'bg-[#111111] border border-[#1f2937] text-emerald-400');
    
    // Menu Button & Notifications Hover
    content = content.replace(/hover:bg-blue-700/g, 'hover:bg-[#111111] hover:text-emerald-400');
    
    // Quick action buttons in Navbar (Leave, Perm)
    content = content.replace(/bg-blue-600 hover:bg-blue-500/g, 'bg-emerald-600 hover:bg-emerald-500 text-white border-none');
    content = content.replace(/bg-indigo-500 hover:bg-indigo-400/g, 'bg-indigo-600 hover:bg-indigo-500 text-white border-none');
    
    // Fix any text-blue-800 that might have been added
    content = content.replace(/text-blue-800/g, 'text-gray-200');

    // Active Tab (if any)
    content = content.replace(/"bg-\[\#0a0a0a\] text-gray-200 font-semibold"/g, '"bg-emerald-600 text-white shadow-[0_0_10px_rgba(5,150,105,0.4)] border-none"');
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated Navbar: ${file}`);
  });
}

processSidebars();
processNavbars();
