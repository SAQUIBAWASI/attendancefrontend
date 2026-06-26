const fs = require('fs');
const filePath = 'c:/Timely-health-projects/Project/attendancefrontend/src/Pages/AttendanceSummary.js';
let content = fs.readFileSync(filePath, 'utf8');

// Normalize line endings
content = content.replace(/\r\n/g, '\n');

// Find the first occurrence of "export default function AttendanceSummary" and keep everything until the next import or end
const firstExportIndex = content.indexOf('export default function AttendanceSummary');
if (firstExportIndex !== -1) {
  // Find the closing brace of the first component
  let braceCount = 0;
  let startIndex = firstExportIndex;
  let endIndex = -1;
  
  for (let i = startIndex; i < content.length; i++) {
    if (content[i] === '{') braceCount++;
    if (content[i] === '}') braceCount--;
    if (braceCount === 0 && i > startIndex) {
      endIndex = i + 1;
      break;
    }
  }
  
  if (endIndex !== -1) {
    // Keep only the first component
    content = content.substring(0, endIndex);
  }
}

fs.writeFileSync(filePath, content);
console.log('AttendanceSummary.js cleaned successfully!');
