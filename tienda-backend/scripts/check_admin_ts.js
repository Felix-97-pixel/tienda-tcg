const ts = require('typescript');
const path = require('path');
const fs = require('fs');

const configPath = path.resolve(__dirname, '../../tienda-front/tsconfig.json');
const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
const parsedConfig = ts.parseJsonConfigFileContent(
  configFile.config,
  ts.sys,
  path.dirname(configPath)
);

// Filter files to only those in src/app/admin
const adminFiles = parsedConfig.fileNames.filter(f => f.includes('src/app/admin') || f.includes('src\\app\\admin'));

console.log(`Checking ${adminFiles.length} files in src/app/admin...`);

const program = ts.createProgram(parsedConfig.fileNames, parsedConfig.options);
const diagnostics = ts.getPreEmitDiagnostics(program);

let adminDiags = [];
for (const diag of diagnostics) {
  if (diag.file && (diag.file.fileName.includes('src/app/admin') || diag.file.fileName.includes('src\\app\\admin'))) {
    const { line, character } = diag.file.getLineAndCharacterOfPosition(diag.start);
    const message = ts.flattenDiagnosticMessageText(diag.messageText, '\n');
    adminDiags.push({
      file: path.relative(path.resolve(__dirname, '../../tienda-front'), diag.file.fileName),
      line: line + 1,
      col: character + 1,
      message,
    });
  }
}

console.log(`Found ${adminDiags.length} diagnostic error(s) in src/app/admin:`);
for (const d of adminDiags) {
  console.log(`- ${d.file}:${d.line}:${d.col} -> ${d.message}`);
}

