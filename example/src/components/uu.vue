<config>
  {
    a: 'a'
  }
</config>

<template>
  <view> {{ message }} </view>
</template>

<script>
Component({

  behaviors: [],

  properties: {
    myProperty: {
      type: String,
      value: '',
      observer: function(newVal, oldVal){}
    },
    myProperty2: String
  },
  data: {
    message: '1'
  },


  attached: function(){},
  moved: function(){},
  detached: function(){},

  methods: {
    onMyButtonTap: function(){
      this.setData({
        
      })
    },
    _myPrivateMethod: function(){
      
      this.replaceDataOnPath(['A', 0, 'B'], 'myPrivateData')
      this.applyDataUpdates()
    },
    _propertyChange: function(newVal, oldVal) {
    }
  }

})
</script>

<style>

.middle-p {
  padding:15px;
}
</style>