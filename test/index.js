const path = require('path');

const MpParser = require('../lib/index.js');

const M = new MpParser();

M.parseApp();
M.parseDirs();
M.parseFile(path.join(__dirname, 'src/app.vue'));

M.copyDirs();
M.copyFile(path.join(__dirname, 'src/app.vue'));