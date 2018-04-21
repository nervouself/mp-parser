<config>
  {
    a: 'a'
  }
</config>

<template>
  <view> {{ message }} </view>
</template>

<script>
Page({
  data: {
    message: 'Hello MINA!',
    array: ['a', 'b']
  },
  methods: {
    adsda: () => {
      for (let g of this.array) {
        this.setData({
          message: g,
        })
      }
    }
  }
})
</script>

<style>

.middle-p {
  padding:15px;
}
</style>