const fs = require('fs');
const content = fs.readFileSync('C:/Users/DELL/.gemini/antigravity/brain/3eb42bc9-611a-4cb8-8260-0533a67c65f3/.system_generated/logs/overview.txt', 'utf8');

const pIdx = content.indexOf('// import axios');

if (pIdx !== -1) {
  let codeStr = content.substring(pIdx, pIdx + 110000); 
  
  const endIdx = codeStr.indexOf('"}],"status"'); 
  if (endIdx !== -1) codeStr = codeStr.substring(0, endIdx);

  try {
    let unescaped = codeStr.replace(/\\n/g, '\n').replace(/\\"/g, '"');
    
    let lines = unescaped.split('\n');
    let out = [];
    for(let line of lines) {
      if(line.startsWith('// ')) out.push(line.substring(3));
      else if(line.startsWith('//')) out.push(line.substring(2));
      else out.push(line);
    }
    
    fs.writeFileSync('C:/Users/DELL/Desktop/Saquiba/TM/attendancefrontend/attendancefrontend/src/Pages/PayRoll_Recovered.js', out.join('\n'));
    console.log('Recovered!', out.length, 'lines');
  } catch (e) {
    console.log(e);
  }
}
