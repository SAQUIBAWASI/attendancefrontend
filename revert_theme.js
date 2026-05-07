const fs = require('fs');
const path = require('path');

const srcDirs = [
  path.join(__dirname, 'src', 'Pages'),
  path.join(__dirname, 'src', 'Components')
];

const replacements = [
  { regex: /bg-\[\#0a0a0a\]/g, replace: 'bg-white' },
  { regex: /bg-\[\#000000\]/g, replace: 'bg-gray-50' },
  { regex: /bg-\[\#111111\]/g, replace: 'bg-gray-100' },
  { regex: /bg-\[\#1f2937\]/g, replace: 'bg-gray-200' },
  
  { regex: /text-gray-200/g, replace: 'text-gray-900' },
  { regex: /text-gray-300/g, replace: 'text-gray-700' },
  { regex: /text-gray-400/g, replace: 'text-gray-500' },
  
  { regex: /text-slate-200/g, replace: 'text-slate-900' },
  { regex: /text-slate-300/g, replace: 'text-slate-700' },
  { regex: /text-slate-400/g, replace: 'text-slate-500' },

  { regex: /border-\[\#1f2937\]/g, replace: 'border-gray-200' },
  { regex: /border-\[\#374151\]/g, replace: 'border-gray-300' },
  { regex: /divide-\[\#1f2937\]/g, replace: 'divide-gray-200' },
  
  { regex: /from-\[\#000000\]/g, replace: 'from-blue-50' },
  { regex: /to-\[\#0a0a0a\]/g, replace: 'to-indigo-100' },
  { regex: /bg-black\/90/g, replace: 'bg-white/90' },
  { regex: /bg-black\/80/g, replace: 'bg-white/80' },
  { regex: /bg-black\/50/g, replace: 'bg-gray-50/50' },

  // Undo dark theme emerald accents -> blue accents
  { regex: /text-emerald-400/g, replace: 'text-blue-600' },
  { regex: /text-emerald-300/g, replace: 'text-blue-500' },
  { regex: /bg-emerald-600/g, replace: 'bg-blue-600' }
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  replacements.forEach(r => {
    content = content.replace(r.regex, r.replace);
  });

  const isNavOrSide = filePath.toLowerCase().includes('navbar') || filePath.toLowerCase().includes('sidebar');
  if (isNavOrSide) {
    // Specifically for Navbars and Sidebars, the user wants blue background.
    // They are currently mapped to white/gray-50 from #0a0a0a/#000000. 
    // We map these light backgrounds to blue for Nav/Side.
    content = content.replace(/bg-gray-50/g, 'bg-blue-600');
    content = content.replace(/bg-white/g, 'bg-blue-700');
    content = content.replace(/bg-gray-100/g, 'bg-blue-500');
    content = content.replace(/bg-\[\#1E40AF\]/gi, 'bg-blue-600');
    
    // Ensure text is white
    content = content.replace(/text-gray-900/g, 'text-white');
    content = content.replace(/text-gray-700/g, 'text-gray-100');
    content = content.replace(/text-gray-500/g, 'text-gray-200');
    content = content.replace(/text-blue-600/g, 'text-white');
  }

  // Revert calendar icons text-white -> text-gray-500
  content = content.replace(/<FaCalendarAlt className="([^"]*) text-white"/g, '<FaCalendarAlt className="$1 text-gray-500"');
  content = content.replace(/<FiCalendar className="([^"]*) text-white"/g, '<FiCalendar className="$1 text-gray-500"');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
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

srcDirs.forEach(dir => traverseDirectory(dir));
console.log('Revert done!');
