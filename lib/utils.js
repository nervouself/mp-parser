const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const sass = require('node-sass');
const { parseComponent } = require('vue-template-compiler');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const chokidar = require('chokidar');

const jsonfy = str => JSON.stringify(eval('(' + str + ')'), null, 2);

const log = {
  suc: str => console.log(' ', chalk.green(str)),
  err: str => console.log(' ', chalk.red(str)),
  warn: str => console.log(' ', chalk.yellow(str)),
  normal: str => console.log(chalk.blue('[mp-parser]'), str),
};

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

const addPrefix = (data, browsers) => {
  let result = data;
  try {
    result = postcss([ autoprefixer({ browsers }) ]).process(data).css;
  } catch (err) {
    log.err(`↓ "${file}": autoprefix error`);
    log.err(err.message);
  }
  return result;
};

const parseFile = (filepath, browsers) => {
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
      if (result && result.css) output.style = addPrefix(result.css, browsers);
    } else {
      output.style = addPrefix(parts.styles[0].content.trim(), browsers);
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

const watch = (location) => {
  return chokidar.watch(location, {
    ignored: /(^|[\/\\])\../
  });
};

const removeFile = (filepath, exts) => {
  const { dirname, filename } = getFilePath(filepath);
  try {
    if (fs.existsSync(filepath)) {
      fs.removeSync(filepath);
      log.suc(filepath);
    }
    for (let ext of Object.keys(exts)) {
      const typePath = path.join(dirname, `${filename}.${exts[ext]}`);
      if (fs.existsSync(typePath)) {
        fs.removeSync(typePath);
        log.suc(typePath);
      }
    }
  } catch (err) {
    log.err(`↓ "${dir}": delete error`);
    log.err(err.message);
  }
};

const handlePath = (paths, handler) => {
  if (Array.isArray(paths)) {
    for (let p of paths) {
      handler(paths);
    }
  } else {
    handler(paths);
  }
};

module.exports = {
  log,
  createFile,
  parseFile,
  getDirFiles,
  watch,
  removeFile,
  handlePath,
};