const fs = require('fs');
const path = require('path');

const srcDirs = [
  path.join(__dirname, 'src', 'Pages'),
  path.join(__dirname, 'src', 'Components')
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace bg-[#111] with bg-white
  content = content.replace(/bg-\[\#111\]/g, 'bg-white');

  // Replace hover:bg-gray-800/50 and hover:bg-gray-800 with nothing or hover:bg-gray-50
  // Actually, better to remove them if they are on table rows, or replace with hover:bg-gray-50
  content = content.replace(/hover:bg-gray-800\/50/g, 'hover:bg-gray-50');
  content = content.replace(/hover:bg-gray-800/g, 'hover:bg-gray-100');

  // There are some bg-gray-900 elements that should be bg-white (like select dropdowns)
  // Let's specifically look for them in AttendanceSummary.js
  if (filePath.includes('AttendanceSummary')) {
    content = content.replace(/bg-gray-900 text-gray-700/g, 'bg-white text-gray-900');
    content = content.replace(/bg-gray-900 border border-gray-300/g, 'bg-white border border-gray-300');
  }

  // Also replace some stray text-white that are inside Dashboard tooltips
  if (filePath.includes('Dashboard')) {
    content = content.replace(/<p className="font-semibold text-white">/g, '<p className="font-semibold text-gray-900">');
    content = content.replace(/<p className="font-bold text-white/g, '<p className="font-bold text-gray-900');
  }

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
console.log('Done cleaning dark leftovers.');
