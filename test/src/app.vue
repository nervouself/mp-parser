<config>
  {
    pages: [
      'pages/index',
    ],
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#fff',
      navigationBarTitleText: '起点读书',
      navigationBarTextStyle: 'black',
    },
    tabBar: {
      selectedColor: '#FF0000',
      backgroundColor: '#fff',
      list: [{
        pagePath: 'pages/index/main',
        text: '推荐',
        iconPath: '/static/images/common/recommend-black.png',
        selectedIconPath: '/static/images/common/recommend-red.png',
      },
      {
        pagePath: 'pages/shelf/main',
        text: '书架',
        iconPath: '/static/images/common/shelf-black.png',
        selectedIconPath: '/static/images/common/shelf-red.png',
      }],
    },
  }
</config>

<script>
App({
  onLaunch: function(options) {
    // Do something initial when launch.
  },
  onShow: function(options) {
      // Do something when show.
  },
  onHide: function() {
      // Do something when hide.
  },
  onError: function(msg) {
    console.log(msg)
  },
  globalData: {
    a: 'I am global data'
  }
})
</script>

<style lang="scss">
$mmt: #225;

.container {
  display: flex;
  color: $mmt;
}
</style>