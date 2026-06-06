const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      if (dirPath.endsWith('.tsx') || dirPath.endsWith('.ts')) {
        callback(dirPath);
      }
    }
  });
}

const replacements = [
  { regex: /text-gray-100/g, replacement: "text-gray-1" },
  { regex: /text-gray-200/g, replacement: "text-gray-2" },
  { regex: /text-gray-300/g, replacement: "text-gray-3" },
  { regex: /text-gray-400/g, replacement: "text-gray-4" },
  { regex: /text-gray-500/g, replacement: "text-gray-5" },
];

function processFile(filePath) {
  if (filePath.includes('(marketing)')) return;
  if (filePath.includes('store-style.css')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  for (let rule of replacements) {
    content = content.replace(rule.regex, rule.replacement);
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
  }
}

walkDir(srcDir, processFile);
console.log("DarkMode Fix script complete.");
