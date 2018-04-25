global.Promise = require('bluebird');
const fs = require('fs-extra');
const path = require('path');

const defaultConfig = require('./defaultconfig.js');
const utils = require('./utils.js');

class MpParser {
  constructor(conf = {}) {
    this._conf = Object.assign({}, defaultConfig, conf);

    this._conf.from = path.join(this._conf.root, this._conf.src);
    this._conf.to = path.join(this._conf.root, this._conf.dist);

    utils.log.normal('- Init');
    if (!fs.existsSync(this._conf.from)) {
      utils.log.err(`"${this._conf.from}" is not exist.`);
      process.exit(1);
    }
    if (fs.existsSync(this._conf.to)) {
      try {
        fs.emptyDirSync(this._conf.to);
        utils.log.suc(`Clean "${this._conf.to}" success.`);
      } catch (err) {
        utils.log.err(`↓ "${this._conf.to}": clean failed`);
        utils.log.err(err.message);
      }
    }
  }

  parseApp() {
    const inpath = path.join(this._conf.from, this._conf.app);
    const outPath = path.join(this._conf.to, 'app');
    utils.log.normal('- Parsing app');
    if (!fs.existsSync(inpath)) {
      utils.log.err(`"${inpath}" is not exist.`);
      return;
    }

    utils.createFile(outPath, utils.parseFile(inpath), this._conf.exts);
  }

  parseDirs() {
    if (!this._conf.needParseDirs || !Array.isArray(this._conf.needParseDirs)) {
      utils.log.err(`Config needParseDirs should be an Array!`);
      return false;
    }
    for (let dir of this._conf.needParseDirs) {
      const inpath = path.join(this._conf.from, dir);
      const outPath = path.join(this._conf.to, dir);
      utils.log.normal(`- Parsing dir "${dir}"`);
      if (!fs.existsSync(inpath)) {
        utils.log.err(`"${inpath}" is not exist.`);
        return;
      }

      const files = utils.getDirFiles(inpath);
      if (files && files.length) {
        for (let file of files) {
          const relativePath = path.relative(inpath, file);
          utils.createFile(path.join(outPath, relativePath), utils.parseFile(file), this._conf.exts);
        }
      } else {
        utils.log.warn(`Dir "${dir}" has 0 file that needs parsing.`);
      }
    }
  }

  parseFile(file) {
    utils.log.normal(`- Parsing file`);
    if (!file) {
      utils.log.err('parseFile needs a path.');
      return false;
    }
    const relativePath = path.relative(this._conf.from, file);
    utils.createFile(path.join(this._conf.to, relativePath), utils.parseFile(file), this._conf.exts);
  }

  copyDirs() {
    if (!this._conf.needCopyDirs || !Array.isArray(this._conf.needCopyDirs)) {
      utils.log.err('Config needCopyDirs should be an Array!');
      return false;
    }
    for (let dir of this._conf.needCopyDirs) {
      utils.log.normal(`- Copy dir "${dir}"`);
      const inpath = path.join(this._conf.from, dir);
      const outPath = path.join(this._conf.to, dir);
      try {
        fs.copySync(inpath, outPath);
        utils.log.suc(outPath);
      } catch (err) {
        utils.log.err(`↓ "${outPath}": copy error`);
        utils.log.err(err.message);
      }
    }
  }

  copyFile(file) {
    utils.log.normal(`- Copy file`);
    if (!file) {
      utils.log.err('copyFile needs a path.');
      return false;
    }
    const relativePath = path.relative(this._conf.from, file);
    const outPath = path.join(this._conf.to, relativePath);
    try {
      fs.copySync(file, outPath);
      utils.log.suc(outPath);
    } catch (err) {
      utils.log.err(`↓ "${outPath}": copy error`);
      utils.log.err(err.message);
    }
  }

  deleteFile(file) {
    utils.log.normal(`- Delete file`);
    if (!file) {
      utils.log.err('deleteFile needs a path.');
      return false;
    }
    const relativePath = path.relative(this._conf.from, file);
    const outPath = path.join(this._conf.to, relativePath);
    utils.removeFile(outPath, this._conf.exts);
  }

  watch() {
    utils.log.normal('- Watching app');
    const appPath = path.join(this._conf.from, this._conf.app);
    utils.watch(appPath).on('change', path => this.parseFile(path));

    if (this._conf.needParseDirs && Array.isArray(this._conf.needParseDirs)) {
      for (let dir of this._conf.needParseDirs) {
        utils.log.normal(`- Watching dir "${dir}"`);
        const inpath = path.join(this._conf.from, dir);
        utils.watch(inpath)
          .on('change', path => utils.handlePath(path, this.parseFile.bind(this)))
          .on('unlink', path => utils.handlePath(path, this.deleteFile.bind(this)));
      }
    }

    if (this._conf.needCopyDirs && Array.isArray(this._conf.needCopyDirs)) {
      for (let dir of this._conf.needCopyDirs) {
        utils.log.normal(`- Watching dir "${dir}"`);
        const inpath = path.join(this._conf.from, dir);
        utils.watch(inpath)
          .on('change', path => utils.handlePath(path, this.copyFile.bind(this)))
          .on('unlink', path => utils.handlePath(path, this.deleteFile.bind(this))); 
      }
    }
  }
}

module.exports = MpParser;
