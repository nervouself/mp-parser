global.Promise = require('bluebird');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const sass = require('node-sass');
const { parseComponent } = require('vue-template-compiler');

const log = {
  suc: str => console.log(' ', chalk.green(str)),
  err: str => console.log(' ', chalk.red(str)),
  warn: str => console.log(' ', chalk.yellow(str)),
  normal: str => console.log(chalk.blue('[mp-parser]'), str),
};

const jsonfy = str => JSON.stringify(eval('(' + str + ')'), null, 2);

const getFilePath = (filepath) => {
  const patharr = filepath.split('/');
  const filename = patharr.pop().replace(/\.vue$/i, '');
  const dirname = patharr.join('/');

  return {
    dirname,
    filename,
  };
};

const createFile = (filepath, parsed, exts) => {
  const { dirname, filename } = getFilePath(filepath);

  if (!fs.existsSync(dirname)) {
    try {
      fs.mkdirpSync(dirname);
    } catch (err) {
      log.err(`↓ "${dirname}": mkdir error`);
      log.err(err.message);
      return;
    }
  }

  for (let file of Object.keys(parsed)) {
    const output = path.join(dirname, `${filename}.${exts[file]}`);
    try {
      fs.writeFileSync(output, parsed[file]);
      log.suc(output);
    } catch (err) {
      log.err(`↓ "${output}": write file error`);
      log.err(err.message);
    }
  }
};

const renderSass = (data, file) => {
  let result;
  try {
    result = sass.renderSync({ data, file });
  } catch (err) {
    log.err(`↓ "${file}": Sass render error`);
    log.err(err.message);
  }
  return result;
};

const parseFile = (filepath) => {
  let parts = {};
  try {
    parts = parseComponent(fs.readFileSync(filepath, 'utf8'));
  } catch (err) {
    log.err(`↓ "${filepath}": parse file error`);
    log.err(err.message);
  }

  const output = Object.create(null);

  if (parts.template && parts.template.content && parts.template.content.trim()) {
    output.template = parts.template.content.trim();
  }
    
  if (parts.script && parts.script.content && parts.script.content.trim()) {
    output.script = parts.script.content.trim();
  }

  if (parts.styles && parts.styles.length && parts.styles[0] && parts.styles[0].content && parts.styles[0].content.trim()) {
    if (parts.styles[0].lang === 'scss' || parts.styles[0].lang === 'sass') {
      const result = renderSass(parts.styles[0].content.trim(), filepath);
      if (result && result.css) output.style = result.css;
    } else {
      output.style = parts.styles[0].content.trim();
    }
  }

  if (parts.customBlocks && parts.customBlocks.length) {
    const config = parts.customBlocks.find(b => b.type === 'config');
    if (config && config.content && config.content.trim()) {
      try {
        output.config = jsonfy(config.content.trim());
      } catch (err) {
        log.err(`↓ "${filepath}": config parse error`);
        log.err(err.message);
      }
    }
  }

  return output;
};

const getDirFiles = (dir) => {
  if (!fs.existsSync(dir)) {
    log.err(`"${this._conf.from}" is not exist.`);
    return false;
  }

  let result = [];

  let files = [];
  try {
    files = fs.readdirSync(dir);
  } catch (err) {
    log.err(`↓ "${dir}": walk dir error`);
    log.err(err.message);
  }
  for (let file of files) {
    const p = path.join(dir, file);
    if (p.endsWith('.vue') && fs.statSync(p).isFile()) {
      result.push(p);
    } else if (fs.statSync(p).isDirectory()) {
      result = result.concat(getDirFiles(p));
    }
  }

  return result;
};

const defaultConfig = {
  root: process.cwd(),

  src: 'src',
  dist: 'dist',

  app: 'app.vue',
  needParseDirs: ['pages', 'components'],
  needCopyDirs: ['images'],

  exts: {
    template: 'wxml',
    style: 'wxss',
    script: 'js',
    config: 'json',
  },
};

class MpParser {
  constructor(conf = {}) {
    this._conf = Object.assign({}, defaultConfig, conf);

    this._conf.from = path.join(this._conf.root, this._conf.src);
    this._conf.to = path.join(this._conf.root, this._conf.dist);

    log.normal('- Init');
    if (!fs.existsSync(this._conf.from)) {
      log.err(`"${this._conf.from}" is not exist.`);
      process.exit(1);
    }
    if (fs.existsSync(this._conf.to)) {
      try {
        fs.emptyDirSync(this._conf.to);
        log.suc(`Clean "${this._conf.to}" success.`);
      } catch (err) {
        log.err(`↓ "${this._conf.to}": clean failed`);
        log.err(err.message);
      }
    }
  }

  parseApp() {
    const inpath = path.join(this._conf.from, this._conf.app);
    const outPath = path.join(this._conf.to, 'app');
    log.normal('- Parsing app');
    if (!fs.existsSync(inpath)) {
      log.err(`"${inpath}" is not exist.`);
      return;
    }

    createFile(outPath, parseFile(inpath), this._conf.exts);
  }

  parseDirs() {
    if (!this._conf.needParseDirs || !Array.isArray(this._conf.needParseDirs)) {
      log.err(`Config needParseDirs should be an Array!`);
      return false;
    }
    for (let dir of this._conf.needParseDirs) {
      const inpath = path.join(this._conf.from, dir);
      const outPath = path.join(this._conf.to, dir);
      log.normal(`- Parsing dir "${dir}"`);
      if (!fs.existsSync(inpath)) {
        log.err(`"${inpath}" is not exist.`);
        return;
      }

      const files = getDirFiles(inpath);
      if (files && files.length) {
        for (let file of files) {
          const relativePath = path.relative(inpath, file);
          createFile(path.join(outPath, relativePath), parseFile(file), this._conf.exts);
        }
      } else {
        log.warn(`Dir "${dir}" has 0 file that needs parsing.`);
      }
    }
  }

  parseFile(file) {
    log.normal(`- Parsing file`);
    if (!file) {
      log.err('parseFile needs a path.');
      return false;
    }
    const relativePath = path.relative(this._conf.from, file);
    createFile(path.join(this._conf.to, relativePath), parseFile(file), this._conf.exts);
  }

  copyDirs() {
    if (!this._conf.needCopyDirs || !Array.isArray(this._conf.needCopyDirs)) {
      log.err('Config needCopyDirs should be an Array!');
      return false;
    }
    for (let dir of this._conf.needCopyDirs) {
      log.normal(`- Copy dir "${dir}"`);
      const inpath = path.join(this._conf.from, dir);
      const outPath = path.join(this._conf.to, dir);
      try {
        fs.copySync(inpath, outPath);
        log.suc(outPath);
      } catch (err) {
        log.err(`↓ "${outPath}": copy error`);
        log.err(err.message);
      }
    }
  }

  copyFile(file) {
    log.normal(`- Copy file`);
    if (!file) {
      log.err('copyFile needs a path.');
      return false;
    }
    const relativePath = path.relative(this._conf.from, file);
    const outPath = path.join(this._conf.to, relativePath);
    try {
      fs.copySync(file, outPath);
      log.suc(outPath);
    } catch (err) {
      log.err(`↓ "${outPath}": copy error`);
      log.err(err.message);
    }
  }
}

// const M = new MpParser();

// M.parseApp();
// M.parseDirs();
// M.parseFile('/Users/shilei/test/mp-parser/src/app.vue');

// M.copyDirs();
// M.copyFile('/Users/shilei/test/mp-parser/src/app.vue');

module.exports = MpParser;
