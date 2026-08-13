const fs = require('fs');
const { execSync } = require('child_process');

const meta = fs.readFileSync('meta.template', 'utf8').trim();

execSync('bocchi build', { 
  stdio: 'inherit' 
});

execSync('npx terser dist/index.user.js -o dist/index.user.js --compress --mangle', { 
  stdio: 'inherit' 
});

const code = fs.readFileSync('dist/index.user.js', 'utf8');
const result = meta + '\n' + code;
fs.writeFileSync('dist/index.user.js', result);
console.log('build done. output: dist/index.user.js');