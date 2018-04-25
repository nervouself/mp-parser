module.exports = {
  // 项目根路径
  root: process.cwd(),

  // 源代码目录
  src: 'src',
  // 解析输出目录
  dist: 'dist',

  // 源代码目录中的入口 app 文件名
  app: 'app.vue',
  // 需要解析的文件夹
  needParseDirs: ['pages', 'components'],
  // 需要直接复制的文件夹
  needCopyDirs: ['images'],

  // 各标签块对应生成的扩展名
  exts: {
    template: 'wxml',
    style: 'wxss',
    script: 'js',
    config: 'json',
  },
};