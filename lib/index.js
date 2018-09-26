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
    if (!this._conf.needParseExts || !Array.isArray(this._conf.needParseExts)) {
      utils.log.err(`Config needParseExts should be an Array!`);
      process.exit(1);
    }
    if (!this._conf.needCopyExts || !Array.isArray(this._conf.needCopyExts)) {
      utils.log.err('Config needCopyExts should be an Array!');
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

  parse() {
    const { parseFiles, copyFiles } = utils.getDirFiles(this._conf.from, this._conf.needParseExts, this._conf.needCopyExts);

    utils.log.normal(`- Parsing files "${this._conf.needParseExts.join(',')}"`);
    if (parseFiles && parseFiles.length) {
      for (let file of parseFiles) {
        this.parseFile(file);
      }
    } else {
      utils.log.warn(`Files "${this._conf.needParseExts.join(',')}" has 0 file that needs parsing.`);
    }

    utils.log.normal(`- Copy files "${this._conf.needCopyExts.join(',')}"`);
    if (copyFiles && copyFiles.length) {
      for (let file of copyFiles) {
        this.copyFile(file);
      }
    } else {
      utils.log.warn(`Files "${this._conf.needCopyExts.join(',')}" has 0 file that needs copying.`);
    }
  }

  parseFile(file) {
    utils.log.normal(`- Parsing file`);
    if (!file) {
      utils.log.err('parseFile needs a path.');
      return false;
    }
    const relativePath = path.relative(this._conf.from, file);
    utils.createFile(path.join(this._conf.to, relativePath), utils.parseFile(file), this._conf.outputExts);
  }

  copyFile(file) {
    utils.log.normal(`- Copy file`);
    if (!file) {
      utils.log.err('copyFile needs a path.');
      return false;
    }
    const relativePath = path.relative(this._conf.from, file);
    if (/\/\.[\w\W]+/.test(relativePath)) {
      return false;
    }
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
    utils.removeFile(outPath, this._conf.outputExts);
  }

  splitFile(file) {
    if (utils.checkExt(file, this._conf.needParseExts)) {
      this.parseFile(file);
    } else if (utils.checkExt(file, this._conf.needCopyExts)) {
      this.copyFile(file);
    }
  }

  watch() {
    utils.log.normal(`- Watching dir "${this._conf.from}"`);
    utils.watch(this._conf.from)
      .on('add', path => utils.handlePath(path, this.splitFile.bind(this)))
      .on('change', path => utils.handlePath(path, this.splitFile.bind(this)))
      .on('unlink', path => utils.handlePath(path, this.deleteFile.bind(this)));
  }
}

module.exports = MpParser;
