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