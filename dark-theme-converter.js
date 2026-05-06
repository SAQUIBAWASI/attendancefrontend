const fs = require('fs');
const path = require('path');

const srcDirs = [
  path.join(__dirname, 'src', 'Pages'),
  path.join(__dirname, 'src', 'Components')
];

// Mapping of light classes to dark classes
const replacements = [
  { regex: /\bbg-white\b/g, replace: 'bg-[#0a0a0a]' },
  { regex: /\bbg-gray-50\b/g, replace: 'bg-[#000000]' },
  { regex: /\bbg-gray-100\b/g, replace: 'bg-[#111111]' },
  { regex: /\bbg-gray-200\b/g, replace: 'bg-[#1f2937]' },
  { regex: /\bbg-slate-50\b/g, replace: 'bg-[#000000]' },
  { regex: /\bbg-slate-100\b/g, replace: 'bg-[#111111]' },
  { regex: /\bbg-slate-200\b/g, replace: 'bg-[#1f2937]' },
  
  { regex: /\bbg-\[\#F8FAFC\]\b/g, replace: 'bg-[#000000]' },
  { regex: /\bbg-\[\#ffffff\]\b/g, replace: 'bg-[#0a0a0a]' },
  { regex: /\bbg-\[\#fff\]\b/g, replace: 'bg-[#0a0a0a]' },

  { regex: /\btext-gray-900\b/g, replace: 'text-gray-200' },
  { regex: /\btext-gray-800\b/g, replace: 'text-gray-300' },
  { regex: /\btext-gray-700\b/g, replace: 'text-gray-300' },
  { regex: /\btext-gray-600\b/g, replace: 'text-gray-400' },
  
  { regex: /\btext-slate-900\b/g, replace: 'text-slate-200' },
  { regex: /\btext-slate-800\b/g, replace: 'text-slate-300' },
  { regex: /\btext-slate-700\b/g, replace: 'text-slate-300' },
  { regex: /\btext-slate-600\b/g, replace: 'text-slate-400' },
  
  { regex: /\btext-black\b/g, replace: 'text-white' },

  { regex: /\bborder-gray-100\b/g, replace: 'border-[#1f2937]' },
  { regex: /\bborder-gray-200\b/g, replace: 'border-[#1f2937]' },
  { regex: /\bborder-gray-300\b/g, replace: 'border-[#374151]' },
  { regex: /\bborder-slate-100\b/g, replace: 'border-[#1f2937]' },
  { regex: /\bborder-slate-200\b/g, replace: 'border-[#1f2937]' },

  { regex: /\bdivide-gray-200\b/g, replace: 'divide-[#1f2937]' },
  { regex: /\bdivide-gray-100\b/g, replace: 'divide-[#1f2937]' },
  
  // Specific tweaks
  { regex: /\bfrom-blue-50\b/g, replace: 'from-[#000000]' },
  { regex: /\bto-indigo-100\b/g, replace: 'to-[#0a0a0a]' },
  { regex: /\bbg-white\/90\b/g, replace: 'bg-black/90' },
  { regex: /\bbg-white\/80\b/g, replace: 'bg-black/80' },
  { regex: /\bbg-gray-50\/50\b/g, replace: 'bg-black/50' }
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  replacements.forEach(r => {
    content = content.replace(r.regex, r.replace);
  });

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

srcDirs.forEach(dir => {
  console.log(`Scanning ${dir}...`);
  traverseDirectory(dir);
});

console.log('Done!');
