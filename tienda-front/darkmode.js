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

// Map of light classes to dark equivalent classes for the rebranding
const replacements = [
  { regex: /bg-white/g, replacement: "bg-[#1a1d24]" },
  { regex: /bg-gray-1/g, replacement: "bg-[#111318]" },
  { regex: /bg-gray-2/g, replacement: "bg-[#222630]" },
  { regex: /bg-gray-3/g, replacement: "bg-[#2a2d36]" },
  
  // Text colors
  { regex: /text-dark-3/g, replacement: "text-gray-300" },
  { regex: /text-dark-4/g, replacement: "text-gray-400" },
  { regex: /text-dark-5/g, replacement: "text-gray-500" },
  { regex: /text-dark-2/g, replacement: "text-gray-200" },
  // Be careful with text-dark, ensure it only matches text-dark not text-dark-x
  { regex: /text-dark(?![-\w])/g, replacement: "text-white" },
  
  // Borders
  { regex: /border-gray-3/g, replacement: "border-white/10" },
  { regex: /border-gray-2/g, replacement: "border-white/5" },
  { regex: /border-gray-4/g, replacement: "border-white/20" },
  
  // Placeholders
  { regex: /placeholder:text-dark-5/g, replacement: "placeholder:text-gray-500" },
  { regex: /placeholder:text-dark-4/g, replacement: "placeholder:text-gray-400" },
  
  // Blood moon red gradients to tap trade red
  { regex: /bg-\[#800D0D\]/g, replacement: "bg-red" },
  { regex: /text-\[#800D0D\]/g, replacement: "text-red" },
  { regex: /border-\[#800D0D\]/g, replacement: "border-red" },
];

function processFile(filePath) {
  // Don't modify the new marketing page
  if (filePath.includes('(marketing)')) return;
  // Or the CSS, since we already did it manually
  if (filePath.includes('store-style.css')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  for (let rule of replacements) {
    content = content.replace(rule.regex, rule.replacement);
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Darkmoded: ${filePath}`);
  }
}

walkDir(srcDir, processFile);
console.log("DarkMode script complete.");
