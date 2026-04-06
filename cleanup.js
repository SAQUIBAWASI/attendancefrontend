const fs = require('fs');
const filePath = 'c:/Users/DELL/Desktop/Saquiba/TM/attendancefrontend/attendancefrontend/src/Pages/EmployeeLeaves.js';

try {
  let content = fs.readFileSync(filePath, 'utf8');
  let lines = content.split('\n');
  
  // Find the exact line where uncommented import begins
  let startIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import axios from "axios";')) {
      startIndex = i;
      break;
    }
  }

  if (startIndex === -1) {
    console.log("Could not find the 'import axios' statement.");
  } else {
    // Keep only from the actual import and onwards
    let newLines = lines.slice(startIndex);
    fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
    console.log("File successfully cleaned!");
  }
} catch (error) {
  console.error("Error modifying file:", error);
}
