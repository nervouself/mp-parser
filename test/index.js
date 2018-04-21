const MpParser = require('../lib/index.js');

const M = new MpParser();

M.parseApp();
M.parseDirs();
M.parseFile('/Users/shilei/test/mp-parser/test/src/app.vue');

M.copyDirs();
M.copyFile('/Users/shilei/test/mp-parser/test/src/app.vue');