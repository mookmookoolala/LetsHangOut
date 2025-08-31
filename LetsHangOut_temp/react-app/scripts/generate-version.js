const fs = require('fs');
const path = require('path');
const pkg = require('../package.json');
const version = pkg.version || 'dev';
const buildTime = new Date().toISOString();
const out = { version, buildTime };
const outPath = path.join(__dirname, '../public/version.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log('Generated version.json:', out); 