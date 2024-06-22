const fs = require('fs');
const path = require('path');

const dir = 'dist';
// path.resolve(path.join(__dirname, 'dist'));

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

// OR
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, {
    mode: 0o744, // Not supported on Windows. Default: 0o777
  });
}