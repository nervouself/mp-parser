global.Promise = require('bluebird');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const sass = require('node-sass');
const { parseComponent } = require('vue-template-compiler');
const mkdirp = Promise.promisify(require('mkdirp'));

const log = {
  suc: str => console.log(chalk.green(str)),
  err: str => console.log(chalk.red(str)),
  warn: str => console.log(chalk.yellow(str)),
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
    (async () => {
      await mkdirp(dirname);
    })();
  }

  for (let file of Object.keys(parsed)) {
    const output = path.join(dirname, `${filename}.${exts[file]}`);
    try {
      fs.writeFileSync(output, parsed[file]);
      log.suc(output);
    } catch (err) {
      log.err(err.message);
    }
  }
};

const renderSass = (data, file) => {
  let result;
  try {
    result = sass.renderSync({ data, file });
  } catch (err) {
    log.err(`↓ "${file}": Sass render error`)
    log.err(err.message);
  }
  return result;
};

const parseFile = (filepath) => {
  let parts = {};
  try {
    parts = parseComponent(fs.readFileSync(filepath, 'utf8'));
  } catch (err) {
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
      output.config = jsonfy(config.content.trim());
    }
  }

  return output;
};

const getDirFiles = (dir) => {
  if (!fs.existsSync(dir)) {
    log.err(`"${this._conf.from}" is not exist.`);
    return false;
  }

  const result = [];
  const files = fs.readdirSync(dir);
  for (let file of files) {
    if 
  }
};

const defaultConfig = {
  root: process.cwd(),

  src: 'src',
  dist: 'dist',

  app: 'app.vue',
  pages: 'pages',
  components: 'components',

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
  }

  parseApp() {
    const inpath = path.join(this._conf.from, 'app.vue');
    const outPath = path.join(this._conf.to, 'app.vue');
    log.normal('- Parsing app');
    if (!fs.existsSync(inpath)) {
      log.err(`"${inpath}" is not exist.`);
      return;
    }

    createFile(outPath, parseFile(inpath), this._conf.exts);
  }

  parsePages() {
    const inpath = path.join(this._conf.from, this._conf.pages);
    const outPath = path.join(this._conf.to, this._conf.pages);
    log.normal('- Parsing pages');
    if (!fs.existsSync(inpath)) {
      log.err(`"${inpath}" is not exist.`);
      return;
    }

    const files = getDirFiles(inpath);
    if (files && files.length) {

      createFile(outPath, parseFile(inpath), this._conf.exts);
    }
  }

  parseComponents() {
    const inpath = path.join(this._conf.from, this._conf.components);
    const outPath = path.join(this._conf.to, this._conf.components);
    log.normal('- Parsing components');
    if (!fs.existsSync(inpath)) {
      log.err(`"${inpath}" is not exist.`);
      return;
    }

    createFile(outPath, parseFile(inpath), this._conf.exts);
  }
}

const M = new MpParser();

M.parsePages();

module.exports = MpParser;
