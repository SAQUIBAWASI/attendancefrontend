const fs = require('fs');
const content = fs.readFileSync('src/Pages/EmployeeLeaves.js', 'utf8');
const idx = content.indexOf('import axios from "axios";');
if (idx > -1) {
  fs.writeFileSync('src/Pages/EmployeeLeaves.js', content.slice(idx));
  console.log('Fixed file successfully!');
} else {
  console.log('Not found');
}
