const fs = require('fs');
const results = JSON.parse(fs.readFileSync('eslint_out.json', 'utf16le'));
const errors = results.filter(r => r.errorCount > 0);
if (errors.length === 0) { console.log("No syntax errors found."); }
errors.forEach(e => {
    console.log(e.filePath);
    e.messages.filter(m => m.severity === 2).forEach(m => console.log('  ', m.line, m.column, m.message));
});
