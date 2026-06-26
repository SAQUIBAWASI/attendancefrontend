const fs = require('fs');
const filePath = 'c:/Timely-health-projects/Project/attendancefrontend/src/Pages/AttendanceSummary.js';
let content = fs.readFileSync(filePath, 'utf8');

// Normalize line endings
content = content.replace(/\r\n/g, '\n');

const endIndex = content.indexOf('export default AttendanceSummary;');
if (endIndex !== -1) {
  content = content.substring(0, endIndex + 'export default AttendanceSummary;'.length);
}

// Uncomment all lines
content = content.replace(/^\/\/\s?/gm, '');

fs.writeFileSync(filePath, content);
console.log('AttendanceSummary.js recovered successfully!');
