const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'src', 'Pages'));
let count = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  // Replace missing text colors with text-white
  content = content.replace(/<FaCalendarAlt className=\"([^\"]*)\"/g, (match, p1) => {
    if (!p1.includes('text-')) {
      return `<FaCalendarAlt className="${p1} text-white"`;
    }
    if (p1.includes('text-gray-400') || p1.includes('text-gray-500')) {
      return `<FaCalendarAlt className="${p1.replace(/text-gray-[45]00/g, 'text-white')}"`;
    }
    return match;
  });

  // Also replace FiCalendar and other calendar icons just in case
  content = content.replace(/<FiCalendar className=\"([^\"]*)\"/g, (match, p1) => {
    if (!p1.includes('text-')) {
      return `<FiCalendar className="${p1} text-white"`;
    }
    if (p1.includes('text-gray-400') || p1.includes('text-gray-500')) {
      return `<FiCalendar className="${p1.replace(/text-gray-[45]00/g, 'text-white')}"`;
    }
    return match;
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    count++;
    console.log('Fixed calendar icons in ' + file);
  }
});

console.log('Total files fixed: ' + count);
