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
const Promise = require('./npm/promise-polyfill/index.js');
const mta = require('./npm/mta-analysis/index.js');

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
    mta,
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