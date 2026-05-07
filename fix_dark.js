const fs = require('fs');
const path = require('path');

const srcDirs = [
  path.join(__dirname, 'src', 'Pages')
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace bg-black that are not modals
  // We can do this by splitting on 'bg-opacity-' or replacing everything and then putting modal back?
  // Better: regex to replace bg-black when it's NOT followed by bg-opacity
  // Easiest is to replace all `bg-black` with `bg-white`, and then replace `bg-white bg-opacity-50` back to `bg-black bg-opacity-50`
  content = content.replace(/\bbg-black\b/g, 'bg-white');
  content = content.replace(/\bbg-white bg-opacity-/g, 'bg-black bg-opacity-');
  content = content.replace(/\bbg-white\/[0-9]+\b/g, (match) => match.replace('bg-white', 'bg-black')); // e.g. bg-black/50

  content = content.replace(/\bbg-\[\#111\]\b/g, 'bg-white');
  
  content = content.replace(/\bborder-gray-800\b/g, 'border-gray-200');
  content = content.replace(/\bborder-gray-700\b/g, 'border-gray-300');

  // Replace text-white in Dashboard and AttendanceSummary specifically for tooltips and text that shouldn't be white
  if (filePath.includes('Dashboard') || filePath.includes('AttendanceSummary') || filePath.includes('AttendanceCapture')) {
    // Specifically target text-white when combined with bg-white (which was just replaced)
    content = content.replace(/text-white/g, 'text-gray-900');
    // But table headers and buttons might get broken?
    // Let's restore text-white for table headers and specific buttons.
    content = content.replace(/<th([^>]*)text-gray-900/g, '<th$1text-white');
    content = content.replace(/bg-blue-600 text-gray-900/g, 'bg-blue-600 text-white');
    content = content.replace(/bg-emerald-600 text-gray-900/g, 'bg-emerald-600 text-white');
    content = content.replace(/bg-gray-900 text-gray-900/g, 'bg-gray-900 text-white');
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
console.log('Done fixing dark leftovers.');
