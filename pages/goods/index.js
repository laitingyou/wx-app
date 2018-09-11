const {
  appGetGoodsDetail,
  receiveCoupon,
  getSellerCouponList,
  goodsDetail,
  sendBarrage
} = require('../../utils/interface/detail')
const {
  getLiveData
} = require('../../utils/interface/store');
const {
  urlTo, format
} = require('../../utils/util')
const App = getApp()
const { getAuth } = require("../../utils/auth");
const { getAccessToken, eellyLogin } = App
const { eellyReqPromise, eellyReq } = require("../../utils/eellyReq")
const { getCoupon } = require('../../utils/getCoupon')
const api = require('../../utils/interface/home')
import {getProgressList} from '../../utils/interface/live'
Page({
  data: {
    current: 1,
    popShow: false,
    hh: 0,
    mm: 0,
    ss: 0,
    msgShow: false,
    discountPop: false,
    timer: null,
    isPreview: false,
    goodsId: 0,
    detailInfo: {},
    titleInfo: {},
    images: [],
    praiseMsg: {},
    storedData: {},
    tabBarInfo: {},//底部内容
    goods_details: [],//详情介绍
    goodPrice: {},//
    couponList: [],
    store_id: 0,//商铺id
    goods_id: 0,
    goods_images: [],//详情图片
    goods_images_html: '',//详情html
    praiseInfo: {},//点赞信息
    isExpired: false, //是否过期
    isSpelling: false,//是否是拼货商品
    colors: '',  //颜色
    sizes: '',   //尺寸
    attestation: [],// 店内推荐商品
    store: {},// 店铺数据
    recommendGoods: [], // 店内推荐商品
    info: null,//普通商品info
    showPop_attestation: false,
    showPop_allAttribute: false,
    goodsDetails: [], //商品规格（属性）
    liveId: null,
    detailImgPreview: false,
    detailImgCurrent: 0,
    shareImg: '',
    video: {},
    videoShow: false,
    currentVideo: '',
    autoShow: '',
    isShareHide: false,
    type: null, //进入模式
    pageStatus: 'show', // 当前页面是显示还是隐藏
    liveData:{},
    liveDataToday:[], // 正在直播
    shareInfo: {}
  },
  onReady () {

  },
  onLoad (res) {
    let { goodsId, liveId = null, type = null } = res
    this.setData({
      goodsId: goodsId,
      liveId: liveId,
      type
    })
    let tmp_goods = wx.getStorageSync('tmp_goods') || {}

    this.setData({
      images: [ tmp_goods.goodsImg ],
      video: { video_url: tmp_goods.videoUrl }
    })
    if (res.isPreload) {
      wx.showLoading({
        title: '加载中……',
        icon: 'loading'
      })
      this.sleep(res => {
        this.handleData(res)
        wx.removeStorage({ key: 'this_goods' });
      })
    } else {
      wx.removeStorage({ key: 'this_goods' });
      /*请求*/
      getAccessToken().then(res => {
        this.getGoodsData(goodsId)

      }).catch(err => {
        wx.showToast({
          title: err.info || '网络异常',
          icon: 'none'
        })
      })
    }
    this.getLiveData()
    wx.removeStorage({ key: 'tmp_goods' });

    getAuth().then(res => {
      this.getShareInfo()
      this.setData({
        isShareHide: res
      })
    }).catch(err => {

    })
  },
  onShow () {
    this.setData({
      pageStatus: 'show'
    })
  },
  onHide(){
    this.setData({
      pageStatus: 'hide'
    })
  },
  onUnload () {

  },
  sleep (callback) {
    setTimeout(() => {
      let this_goods = wx.getStorageSync('this_goods')
      if (!this_goods) {
        this.sleep(callback)
      } else {
        callback & callback(this_goods)
      }
    }, 10)
  },
  /**
   * [getAttestation 传入对象取认证情况]
   * @param  {Object} obj [传入对象]
   * @return {Array} [返回数组]
   */
  getAttestation (obj) {
    let newArr = [ {
      className: 'gIcon48h',
      text: '包退包换',
      info: '因商品质量问题在签收后48小时内可以申请退还货服务'
    } ]
    let arr2 = [
      {
        name: 'is_time_shipping',
        className: 'is_time_shipping',
        text: '准时发货',
        info: '买家下单付款后，卖家最迟将在48小时内发送买家所购商品的服务'
      }, {
        name: 'is_integrity',
        className: "is_integrity",
        text: '诚信保障',
        info: '诚信保障旨在优先保障买家的权益，为买家营造放心的购物环境'
      }, {
        name: 'is_behalfof',
        className: "is_behalfof",
        text: '一件代发',
        info: '你需要通过电脑访问店铺，申请成为本店代理，通过后可享受一件代发服务和代发价格'
      }
    ]
    for (let i = arr2.length - 1; i >= 0; i--) {
      let item = arr2[ i ], itemName = item.name;
      if (itemName in obj && obj[ itemName ] * 1 > 0) {
        newArr.push({
          className: item.className,
          text: item.text,
          info: item.info
        });
      }
    }
    return newArr
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom () {
    this.getGoodsDetail()
  },
  /**
   * 分享图片
   * @param goods 商品信息
   */
  drawImage (goods) {
    this.setData({
      shareImg: goods.default_image
    })
  },
  onPlayer () {
    let { video, isSpelling } = this.data
    let { sourcePrice, activePrice, goods_id } = this.data.tabBarInfo
    wx.navigateTo({
      url: `/other/pages/video/index?src=${video.video_url}&originalPrice=${sourcePrice}&specialPrice=${activePrice}&goodsId=${goods_id}&btn=${!!isSpelling}`
    })
  },
  /**
   * 获取商品所有信息
   */
  getGoodsData (goodsId) {
    let { user, type } = this.data
    wx.showLoading({
      title: '加载中……',
      icon: 'loading'
    })
    eellyReqPromise({
      service: appGetGoodsDetail,
      args: {
        goodsId
      }
    }).then(res => {
      if (res.data.status == 200) {
        this.handleData(res)
      } else {
        wx.showToast({
          title: res.data.info || '网络异常',
          icon: 'none'
        })
      }
    }).catch(err => {
      wx.hideLoading()
      // console.log(err)
      wx.showToast({
        title: err.info,
        icon: 'none'
      })
    })
  },

  handleData (res) {
    let { user, type } = this.data
    let { goods, spellingDetails, store_data } = res.data.retval.data;
    this.setData({
      isSpelling: !!spellingDetails,
      images: goods.images,
      goods_images_html: goods.picDescription,
      store_id: store_data.store_id,
      video: goods.video || {}
    })

    /*拼货活动到期时间*/
    // if(~~goods.priceData.price_detail.expire_time<1){
    //     wx.hideLoading()
    //     this.setData({
    //         isExpired:true
    //     })
    //
    //     return false;
    // }

    if (!this.data.isSpelling) {
      //用于组装服务的数据
      let attestation = this.getAttestation(store_data.auth_all)
      this.setData({
        attestation,
        colors: goods.colors.join(),  //颜色
        sizes: goods.sizes.join(),    //尺寸
        store: {
          storeId: goods.store_id,
          mixWholesale: store_data.mixWholesale
        },
        recommendGoods: goods.recommendGoodsData,
        goodsDetails: goods.goods_details,
        titleInfo: {
          type: 0,
          goods_name: goods.goods_name,
          ifShow: goods.if_show,
          priceData: goods.priceData,
          closed: goods.closed,
          storeId: goods.store_id,
          isSupplier: store_data.is_supplier,
          unit: goods.unit
        },
        tabBarInfo: {
          closed: goods.closed,
          type: 0,
          cate_id: goods.cate_id,
          specs: goods.specs,
          stock: goods.stock,
          show: goods.if_show,
          default_image: goods.default_image,
          colors: goods.colors,
          sizes: goods.sizes,
          goods_id: goods.goods_id,
          activePrice: 0,
          priceRange: goods.priceData.priceRange,
          sourcePrice: goods.priceData.priceRange[ 0 ].price
        },
      })
    } else {
      this.setData({

        titleInfo: {
          type: 1,
          goods_name: goods.goods_name,
          like: spellingDetails.likeCount,
          goodsOrderCount: spellingDetails.goodsOrderCount
        },
        praiseMsg: spellingDetails.likeInfo,

        storedData: {
          goodsOrderCount: spellingDetails.goodsOrderCount,
          goods_count: store_data.goods_count,
          goodsList: goods.recommendGoodsData,
          store_logo: store_data.store_logo,
          store_name: store_data.store_name,
          store_id: store_data.store_id
        },
        store_id: store_data.store_id,
        goods_id: goods.goods_id,
        goods_details: goods.goods_details,
        goodPrice: {
          activePrice: Number(goods.priceData.price_detail.price).toFixed(2),
          expire_time: goods.priceData.price_detail.expire_time,
          sourcePrice: goods.priceData.priceRange[ 0 ].price
        },
        // isExpired:nowDate,
        tabBarInfo: {
          closed: goods.closed,
          type: 1,
          show: goods.if_show,
          specs: goods.specs,
          stock: goods.stock,
          default_image: goods.default_image,
          colors: goods.colors,
          sizes: goods.sizes,
          goods_id: goods.goods_id,
          upperPrice: Number(goods.priceData.price_detail.upperPrice).toFixed(2),
          activePrice: Number(goods.priceData.price_detail.price).toFixed(2),
          sourcePrice: goods.priceData.priceRange[ 0 ].price,
          limitNum: spellingDetails.likeInfo.goodsLikeSetting.limitNum,
          requireLikes: spellingDetails.likeInfo.goodsLikeSetting.requireLikes
        },
        reviews: goods.goods_evaluation,

        praiseInfo: {
          activePrice: Number(goods.priceData.price_detail.price).toFixed(2),
          goods_id: goods.goods_id,
          goods_name: goods.goods_name,

        }

      })
      // this.isLiving(store_data.store_id)
      this.drawImage(goods);//如果是拼货就生成分享图
      this.setData({
        autoShow: type
      })

    }
    this.getCouponList(store_data.store_id)
    wx.hideLoading()
  },
  /**
   * ；领取优惠券
   */
  getCoupon (e) {
    App.store.remove('goods_getCoupon', this)
    App.store.on('goods_getCoupon', this, () => {
      wx.showLoading()
      eellyReqPromise({
        service: receiveCoupon,
        login: true,
        args: {
          keycode: e.currentTarget.dataset.keycode,
          userId: wx.getStorageSync('user').uid
        }
      }).then(res => {
        let {status, retval, info} = res.data
        if (status == 200) {
          wx.showToast({
            title: retval.data.msg,
            icon: 'none'
          })
          this.setData({
            discountPop: false
          })
          getCoupon(eellyReq)
        } else {
          wx.showToast({
            title: info || '网络异常',
            icon: 'none'
          })
        }
      }).catch(err => {
        wx.showToast({
          title: err.info || '网络异常',
          icon: 'none'
        })
      })
    })

    App.eellyLogin('goods_getCoupon')

  },
  /**
   * 打开优惠券弹窗
   */
  onShowCoupon () {
    this.setData({
      discountPop: true
    })
  },
  /**
   * 获取优惠券列表
   */
  getCouponList (storeId) {
    if (!wx.getStorageSync('tokenKey')) {
      return false
    }
    eellyReqPromise({
      service: getSellerCouponList,
      login: true,
      args: {
        type: 'starting',
        page: 1,
        limit: 10,
        storeId
      }
    }).then(res => {
      let {retval, status, info} = res.data
      if (status == 200) {
        let { items } = retval.data
        for (let item of items) {
          item.timeSlot = `${format(new Date(+item.startTime * 1000), 'yyyy.MM.dd')}-${format(new Date(+item.endTime * 1000), 'yyyy.MM.dd')}`
        }
        this.setData({
          couponList: items
        })
      } else {
        wx.showToast({
          title: info || '网络异常',
          icon: 'none'
        })
      }
    }).catch(res => {
      wx.showToast({
        mask: true,
        title: res.info || '网络异常',
        icon: 'none',
        duration: 3000
      })
    })
  },
  // 显示规格（商品属性）的弹框，如颜色、尺码
  showAllAttribute () {
    this.setData({
      showPop_allAttribute: true
    })
  },
  // 显示证明的弹框，如“一件代发”、“包退包换”等
  showAttestation () {
    this.setData({
      showPop_attestation: true
    })
  },
  /**
   * 轮播图的切换事件
   * @param e
   */
  swiperChange (e) {
    this.setData({
      current: e.detail.current + 1
    })
  },

  /**
   * 页面卸载的时候把定时器清了
   */
  onUnload () {

    clearTimeout(this.data.timer)
  },
  onPreview (e) {
    let {images} = this.data,{url} = e.currentTarget.dataset
    wx.previewImage({
      current: url,
      urls: images
    })
  },
  detailImgPreview (e) {
    let {goods_images} = this.data,{url} = e.currentTarget.dataset
    wx.previewImage({
      current: url,
      urls: goods_images
    })
  },
  /**
   * 下单
   * @param data 商品颜色.尺码.数量...
   */
  onOrder (data) {
    App.store.remove('goods_onOrder', this)
    App.store.on('goods_onOrder', this, () => {
      let { liveId } = this.data
      if (liveId) {
        this.addCar()
      }
      wx.setStorage({
        key: 'payGoods',
        data: data.detail,
        success () {
          // console.log(urlTo)
          wx.navigateTo({
            url: '/money/pages/pay/index?goodsId=' + data.detail.goodsId + '&liveId=' + liveId
          })
        },
        fail () {
          wx.showToast({
            title: '下单失败',
            icon: 'none'
          })
        }
      })
    })
    App.eellyLogin('goods_onOrder')
  },
  /*上拉加载详情*/
  /**
   * 上拉的时候，把详情的html里的图片扣出来
   */
  onReachBottom () {
    let { goods_id, goods_images, goods_images_html } = this.data

    if (goods_images.length > 0) return
    let html = goods_images_html, _tmp = [];
    while (/<img.*?src=['"](.*?)['"].*?>/g.test(html)) {
      _tmp.push(/<img.*?src=['"](.*?)['"].*?>/.exec(html)[ 1 ])
      html = html.replace(/<img.*?src=['"](.*?)['"].*?>/, '');
    }
    this.setData({
      goods_images: _tmp
    })

  },
  /**
   * 正在拿货
   */
  addCar () {
    let { liveId } = this.data
    eellyReqPromise({
      service: sendBarrage,
      login: true,
      args: {
        fromUserId: wx.getStorageSync('user').uid,
        liveId: liveId,
        type: 1
      }
    }).then(res => {
    }).catch(res => {
      // console.log(res)
    })
  },
  getShareInfo(){
    eellyReqPromise({
      service: api.getShareTemplate,
      args: {
        condition:{ type: 14 }
      }
    }).then(res => {
      let {status, info, retval: {data}} = res.data
      if (status == 200) {
        this.setData({
          shareInfo: data[0] || {}
        })
      }
    }).catch(err=>{
    })

  },
  onShareAppMessage (res) {
    let { goods_id, default_image } = this.data.tabBarInfo
    let {images, shareImg, shareInfo } = this.data
    App.addBarrage(8)
    return {
      // title: `${activePrice}元${goods_name}`,
      title: shareInfo.content,
      path: 'pages/goods/index?goodsId=' + goods_id,
      imageUrl: shareInfo.image || images[0],
      success (res) {
        // 转发成功
        wx.showToast({
          title: '转发成功',
          icon: 'none'
        })
      },
      fail (res) {
        // 转发失败
        wx.showToast({
          title: '转发失败',
          icon: 'none'
        })
      }
    }
  },

  // 取直播数据
  getLiveData (type = 1) {
    
      eellyReqPromise({
        service: getProgressList,
        args: {
          page: 1,
          limit: 100
        }
      })
        .then((res) => {
          let { status, info = '网络异常', retval } = res.data
          if (status == 200) {
            let list = retval.data.items
            this.setData({
              liveDataToday: list
            })
          } else {

          }
        })

  },


})