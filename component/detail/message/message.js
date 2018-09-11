const { eellyReqPromise, eellyReq } = require("../../../utils/eellyReq")
const detail = require('../../../utils/interface/detail')
import { addOrderCount } from '../../../utils/interface/order'

Component({

  properties: {
    info: {
      type: Object,
      value: {},
      observer (n, o) {

      }
    },
    goodsId: {
      type: [ String, Number ],
      value: 0,
      observer (n, o) {
        this.getList(n)
      }
    },
    pageStatus: {
      type: String,
      value: 'show',
      observer (n, o) {
          if (n === 'show'){
            this.getList(this.data.goodsId)
          }
      }
    }
  },
  options: {
    multipleSlots: true
  },

  data: {
    data: [],
    animationData: {},
    animation: {},
    index: 1,
    itemHeight: 60
  },
  attached () {
    this.setData({
      animation: wx.createAnimation({
        duration: 1000,
        timingFunction: 'ease'
      })
    })
  },

  methods: {
    /**
     * 获取点赞列表
     * @param goodsId
     */
    getList (goodsId, stop) {
      let that = this
      if (this.data.pageStatus === 'hide') return
      eellyReq({
        service: detail.getGoodsLikeInfo,
        args: {
          goodsId
        },
        success (res) {
          let tmp = res.data.retval.data
          if (tmp.length > 0) {
            tmp.map((item, index) => {
              item.userName = item.userName.replace(/(^\S).*?(\S$)/, '$1***$2')
            })
            that.setData({
              data: tmp
            })
            if (stop) return
            that.getItemHeight(() => {
              that.playing(tmp)
            })
          }
        }
      })
    },
    /**
     * 消息轮播
     * @param list 点赞列表
     */
    playing () {
      let list = this.data.data
      if (list.length > 2) {
        let { animation, goodsId, itemHeight } = this.data
        let times = Math.ceil(list.length / 2), index = 0

        function next () {
          setTimeout(() => {
            if (list.length % 2 === 1 && times === 1) {
              animation.translateY(itemHeight - itemHeight * 2 * index++).step()
            } else {
              animation.translateY(-itemHeight * 2 * index++).step()
            }
            this.setData({
              animationData: animation.export()
            })
            if (times-- > 1) {
              next.call(this)
            } else {
              this.getList(goodsId)
            }

          }, 5000)
        }

        next.call(this)

      }
    },
    /**
     * 获取列表行高
     */
    getItemHeight (callback) {
      let query = wx.createSelectorQuery().in(this)
      query.select('.message-content').boundingClientRect()
      query.exec(res => {
        this.setData({
          itemHeight: res[ 0 ].height
        })
        callback && callback()
      })
    },

        /**
         * 帮人点赞
         * @param e
         */
        onNavigate(e){
            let {orderid,type} = e.currentTarget.dataset
            // if(type==1) return
            eellyReqPromise({
                service: addOrderCount,
                args: {
                    orderId: orderid
                }
            }).then(res => {
                if (res.data.status === 200) {
                    wx.navigateTo({
                        url: `/pages/praise/index?orderId=${orderid}`
                    })
                }
            }).catch(e => {
                wx.showToast({
                    title: e.info,
                    icon: 'none'
                })
            })

        }
    }
})
