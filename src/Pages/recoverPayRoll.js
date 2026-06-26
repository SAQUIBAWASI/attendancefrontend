const fs = require('fs');
const filePath = 'c:/Timely-health-projects/Project/attendancefrontend/src/Pages/PayRoll.js';
let content = fs.readFileSync(filePath, 'utf8');

// Normalize line endings
content = content.replace(/\r\n/g, '\n');

const endIndex = content.indexOf('export default PayRoll;');
if (endIndex !== -1) {
  content = content.substring(0, endIndex + 'export default PayRoll;'.length);
}

// Uncomment all lines
content = content.replace(/^\/\/\s?/gm, '');

fs.writeFileSync(filePath, content);
console.log('PayRoll.js recovered successfully!');
