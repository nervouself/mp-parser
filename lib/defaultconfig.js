module.exports = {
  // 项目根路径
  root: process.cwd(),

  // 源代码目录
  src: 'src',
  // 解析输出目录
  dist: 'dist',

  // 需要解析的文件拓展名
  needParseExts: ['vue'],
  // 需要复制的文件拓展名
  needCopyExts: ['js', 'jpg', 'jpeg', 'png', 'svg', 'gif'],

  // 各标签块对应生成的扩展名
  outputExts: {
    template: 'wxml',
    style: 'wxss',
    script: 'js',
    config: 'json',
  },
};