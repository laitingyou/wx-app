var app = getApp()
const { eellyLoginBtn } = app
Component({

  properties: {
    msgShow: {
      type: Boolean,
      value: false
    },
    info: {
      type: Object,
      value: {},
      observer (n, o) {
        if(Object.keys(n).length > 0 && !wx.getStorageSync('hidden_goods_live')) {
          this.animation.opacity(1).width('100%').step()
          setTimeout(_=>{
            this.setData({
              animationData:this.animation.export()
            })
          },500)
        }
      }
    },
    storeid: {
      type: String,
      value: '',
      observer (newVal, oldVal) {
        if (newVal !== oldVal) {
          let newStoreId = 'seller_'
          let storeId = this.properties.storeid
          if (typeof storeId != 'string') {
            storeId = storeId.toString()
          }
          let zeroLeg = 12 - storeId.length
          for (let i = zeroLeg - 1; i >= 0; i--) {
            newStoreId += '0'
          }
          this.setData({
            storeId: newStoreId + storeId
          })
        }
      }
    },
    autoShow: {
      type: String,
      value: '',
      observer (n, o) {
        let e = { currentTarget: {} }
        if (n === 'original') {
          e.currentTarget.id = 'single'
        } else if(n === 'upper') {
          e.currentTarget.id = 'upper'
        }else {
          e.currentTarget.id = 'group'
        }
        this.onPopShow(e)
      }
    },
    liveData:{
      type:Array,
      value:[],
      observer (n, o) {
        if(n.length>0){
            this.getRandomLive(n)
        }
      }
    }
  },
  options: {
    multipleSlots: true
  },

  data: {
    currentSize: null,
    currentColor: null,
    buttonType: {
      color: 'currentColor',
      size: 'currentSize'
    },
    random: 0,
    currentPriceType: 'group',
    num: 1,
    allPrice: 0,
    unitPrice: 0,
    quantity: 0,
    specId: 0,
    disabled: {
      color: [],
      size: []
    },
    popShow: false,
    currentStock: null,
    storeId: '',
    enabled: true,
    animationData:null,
    liveIndex:1
  },
  attached(){
    this.animation = wx.createAnimation({
      delay:500,
      duration: 1000,
      timingFunction: 'ease',
    })


  },
  methods: {
    onPopShow (e) {
      let { sourcePrice, activePrice, upperPrice } = this.data.info
      let unitPrice = sourcePrice,{ id } = e.currentTarget
      let num = 1
      switch (id){
        case 'single':
          unitPrice = sourcePrice
          break
        case 'group':
          unitPrice = activePrice
          break
        default :
          unitPrice = upperPrice
          num = 3
      }
      if (!unitPrice) return
      this.setData({
        enabled: true,
        num: num,
        unitPrice,
        allPrice: (+unitPrice * 1000000 * num) / 1000000,
        popShow: true,
        currentPriceType: id
      })

    },
    btnClick (e) {
      let target = e.currentTarget.dataset, { buttonType } = this.data;
      if (target.key == this.data[ buttonType[ target.type ] ]) return
      this.setData({
        [ buttonType[ target.type ] ]: target.key,
        random: Math.random()
      })
      this.checkGoods(target.type, target.key)

    },
    /**
     * 检查库存
     * @param type
     * @param index
     */
    checkGoods (type, index) {
      let { info, currentSize, currentColor, disabled } = this.data;
      let { specs } = info;
      let specsObj = JSON.parse(specs);
      let currentStock = 0
      if (type == 'color') {
        disabled[ 'size' ] = []
        this.setData({
          disabled
        })
        let j = 0;
        for (let i in specsObj[ index + 1 ]) {
          let item = specsObj[ index + 1 ][ i ]
          if (~~item[ item.length - 1 ] < 1) {
            disabled[ 'size' ][ j ] = true
            this.setData({
              disabled
            })
          }
          j++;
        }

      } else {
        disabled[ 'color' ] = []
        this.setData({
          disabled
        })
        info.colors.map((_item, _index) => {
          for (let i in specsObj[ _index + 1 ]) {
            let item = specsObj[ _index + 1 ][ i ]
            if (~~item[ item.length - 1 ] < 1 && item[ 0 ] == info.sizes[ index ]) {
              disabled[ 'color' ][ _index ] = true
              this.setData({
                disabled
              })
            }
          }
        })

      }
      if (currentSize !== null && currentColor !== null) {
        for (let i in specsObj[ currentColor + 1 ]) {
          if (specsObj[ currentColor + 1 ][ i ].includes(info.sizes[ currentSize ])) {
            let tmp = specsObj[ currentColor + 1 ][ i ]
            this.setData({
              currentStock: tmp[ tmp.length - 1 ]
            })
            return;
          }
        }
      }
    },
    onOrder (event) {
      let { info, currentSize, currentColor, num, currentPriceType, allPrice, unitPrice } = this.data;
      let { specs } = info;
      let specsObj = JSON.parse(specs);
      let spelling = 0
      if(currentPriceType === 'upper'){
        if(num<3){
          wx.showToast({
            title: `批发必须3件起`,
            icon: 'none'
          })
          return
        }
      }else {
        if(info.priceRange){
          let lower = info.priceRange[0].lower
          if(num<lower){
            wx.showToast({
              title: `${lower}件起批`,
              icon: 'none'
            })
            return
          }
        }
      }
      for (let i in specsObj[ currentColor + 1 ]) {
        let item = specsObj[ currentColor + 1 ][ i ]
        if (item.includes(info.sizes[ currentSize ])) {
          this.setData({
            specId: i
          })
        }
      }
      this.setData({
        popShow: false
      })
        !wx.getStorageSync('user') && wx.showLoading({
          mask: true,
          title: '正在登录'
        })
        switch (currentPriceType){
          case 'single':
            spelling = 0
            break
          case 'group':
            spelling = 1
            break
          default :
            spelling = 2
        }
      eellyLoginBtn(event.detail).then(res=>{
        this.triggerEvent('onOrder', {
          goodsId: info.goods_id,
          quantity: num,
          spelling: spelling,
          specId: this.data.specId
        })
        wx.hideLoading()
      }).catch(err=>{
        wx.showToast({
          title: err.info || '登录失败',
          icon: 'none'
        })
      })

    },
    orderAmount (e) {
      let {info, currentPriceType} = this.data
      this.setData({
        num: e.detail,
        allPrice: (+this.data.unitPrice * 1000000 * e.detail) / 1000000
      })
      if(currentPriceType !== 'upper'){
        if(info.limitNum && info.limitNum>0){
          if (e.detail > info.limitNum) {
            wx.showToast({
              title: `每单限购${info.limitNum}件`,
              icon: 'none'
            })
            this.setData({
              enabled: false
            })
          } else {
            this.setData({
              enabled:true
            })
          }
        }
      }else if(currentPriceType === 'upper'){
        if(e.detail < 3){
          wx.showToast({
            title: '批发必须3件起',
            icon: 'none'
          })
          this.setData({
            enabled:false
          })
        }else {
          this.setData({
            enabled:true
          })
        }

      }

    },
    /**
     * [goToIm 去掉聊天页面前先登录]
     * @param  {[type]} event [description]
     * @return {[type]}       [description]
     */
    goToIm (event) {
      // /imPartials/pages/chating/chating?chatTo={{storeId}}
      let imStoreId = this.data.storeId
      let url = '/imPartials/pages/chating/chating?chatTo=' + imStoreId
      // 告知服务器，标记会话已读

      if (wx.getStorageSync('neteaseIm')) {
        wx.navigateTo({
          url
        })
      } else {
        wx.showLoading({
          mask: true,
          title: '正在登录'
        })
        eellyLoginBtn(event.detail)
          .then((res) => {
            /*setTimeout(()=>{

            },1000) */
            wx.hideLoading()
            var app = getApp()
            // 告知服务器，标记会话已读
            // app.globalData.nim.resetSessionUnread(`p2p-${imStoreId}`)
            wx.navigateTo({
              url
            })

          })
          .catch((err) => {
            wx.showToast({
              title: err.info || '登录失败',
              icon: 'none',
              duration: 3000
            })
          })
      }
    },
    onLiveclose(){
      this.animation.width(0).opacity(0).step()
      this.setData({
        animationData:this.animation.export()
      })
      clearTimeout(this.timer)
      wx.setStorageSync('hidden_goods_live',true)
    },
    timer: null,
    getRandomLive(arr,liveIndex=1){
      clearTimeout(this.timer)
      if(arr.length === 0) return
      this.timer=setTimeout(_=>{
        if(arr.length === liveIndex){
          liveIndex = 0
        }
        this.animation.translateY('-100'*liveIndex+'%').step()
        // liveIndex +=liveIndex
        this.setData({
          animationData:this.animation.export()
        })
        this.getRandomLive(arr,++liveIndex)
      },8000)
    },
  }
})
