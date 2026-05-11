const fs = require('fs');
const path = require('path');

const srcDirs = [
  path.join(__dirname, 'src', 'Pages'),
  path.join(__dirname, 'src', 'Components')
];

const revertReplacements = [
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
  { regex: /bg-black\/50/g, replace: 'bg-gray-50/50' }
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  revertReplacements.forEach(r => {
    content = content.replace(r.regex, r.replace);
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Reverted: ${filePath}`);
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
console.log('Reverted to light theme!');