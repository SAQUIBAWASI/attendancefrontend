const fs = require('fs');
const path = require('path');

const publicFiles = [
  'src/Pages/HomePage.js',
  'src/Pages/AboutPage.js',
  'src/Pages/ContactPage.js',
  'src/Pages/ServicesPage.js',
  'src/Pages/WhoWeServePage.js',
  'src/Pages/LandingPage.js',
  'src/Pages/PrivacyPolicyPage.js',
  'src/Pages/PrivacyPolicyForm.js',
  'src/Components/TimelyNavbar.js',
  'src/Components/TimelyFooter.js',
  'src/Pages/TimelyFooter.js'
];

const reverseReplacements = [
  { regex: /bg-\[\#0a0a0a\]/g, replace: 'bg-white' },
  { regex: /bg-\[\#000000\]/g, replace: 'bg-gray-50' },
  { regex: /bg-\[\#111111\]/g, replace: 'bg-gray-100' },
  { regex: /bg-\[\#1f2937\]/g, replace: 'bg-gray-200' },
  
  { regex: /text-gray-200/g, replace: 'text-gray-900' },
  { regex: /text-gray-300/g, replace: 'text-gray-700' },
  { regex: /text-gray-400/g, replace: 'text-gray-500' },
  
  { regex: /text-slate-200/g, replace: 'text-slate-900' },
  { regex: /text-slate-300/g, replace: 'text-slate-700' },
  { regex: /text-slate-400/g, replace: 'text-slate-500' },

  { regex: /border-\[\#1f2937\]/g, replace: 'border-gray-200' },
  { regex: /border-\[\#374151\]/g, replace: 'border-gray-300' },
  { regex: /divide-\[\#1f2937\]/g, replace: 'divide-gray-200' }
];

publicFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    let original = content;

    reverseReplacements.forEach(r => {
      content = content.replace(r.regex, r.replace);
    });

    if (content !== original) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`Reverted dark theme on: ${file}`);
    }
  }
});

console.log('Revert done!');
