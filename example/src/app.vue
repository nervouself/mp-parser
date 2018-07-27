<config>
  {
    pages: [
      'pages/index',
    ],
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#fff',
      navigationBarTitleText: '{{name}}',
      navigationBarTextStyle: 'black',
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