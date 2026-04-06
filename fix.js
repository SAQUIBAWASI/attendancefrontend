const fs = require('fs');
const file = 'c:/Users/DELL/Desktop/Saquiba/TM/attendancefrontend/attendancefrontend/src/Pages/EmployeeLeaves.js';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split(/\r?\n/);
const idx = lines.findIndex(l => l.startsWith('import axios'));
if (idx > -1) {
    fs.writeFileSync(file, lines.slice(idx).join('\n'));
    console.log('Fixed! Removed ' + idx + ' lines of garbage at top.');
} else {
    console.log('Could not find import axios');
}
