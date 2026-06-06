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
      if (dirPath.endsWith('.tsx') || dirPath.endsWith('.ts') || dirPath.endsWith('.css')) {
        callback(dirPath);
      }
    }
  });
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Rebranding Replacements
  content = content.replace(/Blood Moon Games/gi, "TapTrade");
  content = content.replace(/Bloodmoon Games/gi, "TapTrade");
  content = content.replace(/Blood Moon/gi, "TapTrade");
  content = content.replace(/Bloodmoon/gi, "TapTrade");
  content = content.replace(/tiendabloodmoon@gmail\.com/gi, "contacto@taptrade.cl");
  content = content.replace(/www\.bloodmoongames\.cl/gi, "www.taptrade.cl");

  // Logo references
  // We'll replace the image logo tag with a text logo for now where it says "TapTrade Logo"
  content = content.replace(/src="\/images\/logo\/bloodmoon-logo\.png"/g, 'src="/images/logo/logo.svg"'); 
  // Wait, actually I will manually change Header and Footer logo sections because they need specific styling to match the Landing Page gradient.
  // So I won't do the complex logo logic in this script, I'll just change the name text.

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Rebranded: ${filePath}`);
  }
}

walkDir(srcDir, processFile);
console.log("Rebranding script complete.");
