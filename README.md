# mp-parser

小程序单文件开发工具

## 使用方法

```bash
# 第一步，安装 mp-parser
npm install -g mp-parser

# 第二步，参考 example 文件夹自己新建目录结构

# 第三步，在项目目录下运行
mp-parser
```
执行 `mp-parser --help` 查看帮助。

## 配置文件

默认配置如下，如有需求可以通过修改项目下的 mpp.config.js 来进行覆盖。

```js
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
```

## 功能特性

- 支持单文件化开发原生小程序，默认以 .vue 扩展名结尾
- 支持 sass/scss 编译

示例：

```html
<config>
{
  window: {
    navigationBarTitleText: 'mp-parser'
  }
}
</config>

<template>
  <view class="red"> {{ message }} </view>
</template>

<script>
Page({
  data: {
    message: 'Hello mp-parser!'
  }
})
</script>

<style lang="scss">
$red: red;

.red {
  color: $red;
}
</style>
```

## 项目由来

在使用了 wepy 和 mpvue 之后，发现这些开源项目在引入一些便捷的同时也引入了另一些问题，这些问题有的可以通过难看的 hack 去解决，有的就只能盼着源代码修复，给我们造成了另外的负担。

wepy：

- 组件数据共享（1.7.2 以后可以通过引入原生组件解决，但语法不同）
- 只能响应单层数据绑定
- repeat 不能为两层子组件传入 props
- 组件生命周期缺失

mpvue：

- 监听频繁触发类事件会导致性能表现暴跌
- 串行渲染组件，导致渲染时间成倍增加
- 动态绑定初始值导致组件 bug
- 页面数据缓存
- 全部页面都在源码层面设置了可分享（已在 pr 中）
- 图片必须使用绝对路径

这些问题收集于四五月份，有小概率可能会被解决。

已经因为这些运行时框架最终还是依赖于原生能力的，原生有的问题这些框架一定会有，所以我们想能不能直接用单文件开发的形式去写原生小程序？这也算是“渐进式”的开发了，于是就产生了这个工具，不做运行时的事，只做预处理，将问题最简单化。

## 特殊考虑

除了希望能利用单文件的开发方式来开发小程序，其他工具多多少少有些其他功能，例如自带 js 转码压缩、引入 npm 包之类的。

加入 js 转码压缩主要是为了使用高级特性，例如 async，但我在 issue 中看到使用 async 函数会导致 ios 崩溃的问题，并且目前还不了解现在是否解决；而 es6 转 es5 和代码压缩使用开发工具自带的即可。

引入 npm 包可以说是比较需要的功能，但实际我们在开发中只使用到了一小部分包，并且一些库使用了小程序不具备的环境变量，所以在引入前应该手动确认或修改；直接拷贝 npm 包可能会造成 dist 包过大，影响最终打包体积，使用 webpack 解决依赖又会引入额外的运行时代码；还好现在官方已经在开发中了。

其实本工具并不复杂，主要就是解决了很小的一点不便，让我们更舒服的用原生而已。
