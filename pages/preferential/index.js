const App = getApp()
const { getAccessToken, eellyLoginBtn } = App
const { eellyReq } = require('../..//utils/eellyReq.js')
const { getCoupon } = require('../../utils/getCoupon')
import { getMinRedPackage, getAppletUserCouponList, getCouponSummaryData } from '../../utils/interface/preferential'
import { eellyReqPromise } from '../../utils/eellyReq'
const api = require('../../utils/interface/home')
const {
  format
} = require('../../utils/util')
Page({
  data: {
    couponInfo: {
      couponNum: 0,
      totalPrice: 0,
    },
    navAnimation: "fadeIn",
    limit: 10,
    totalPage: 2,
    allCoupon: [],
    allTimerState: [],
    allTimer: [],
    couponSummaryData: {},
    loginStatus: false,
    animationData: null,
    currentStore: null,
    openwin: false, // 优惠券窗口打开状态
    loading: false,
    storeCoupon: [],
    page: 1,
    btnText: '签到',
    shareInfo: {}
  },
  onLoad () {
    let hasUser = !!wx.getStorageSync('user')
    this.setData({
      loginStatus: hasUser // 第一次进来时的登录状态
    })
    this.animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease'
    })
    // 未登录状态返回基本信息
    hasUser || this.getCouponSummaryData(false)
    this.getShareInfo()
  },
  animation:null,
  /**
   * 倒计时处理函数
   */
  hander (now, end) {
    let s = Math.floor((end * 1000 - now) / 1000);
    let dd = Math.floor(s / 86400)
    let hh = ('0' + (Math.floor(s / 3600) - dd * 24)).slice(-2)
    let mm = ('0' + (Math.floor(s / 60) - dd * 24 * 60 - hh * 60)).slice(-2)
    let ss = ('0' + (s % 60)).slice(-2)
    if (dd === '00' && hh === '00' && mm === '00' && ss === '00') return;
    if (dd.length < 2) {
      dd = ~~('0' + dd)
    }
    return dd > 0 ? '' : `${hh}小时${mm}分${ss}秒`;

  },
  onLookMany(e){
    let { openwin, currentStore } = this.data
    let { index, length } = e.currentTarget.dataset
      this.setData({
        openwin: !openwin,
        currentStore: index
      })
    this.animation.height(openwin && currentStore === index ? '660rpx' : 224 * length + 'rpx').step()
      this.setData({
        animationData: this.animation.export()
      })
      // setTimeout(_=>{
      //   this.setData({
      //     reset:'puck-up'
      //   })
      // },1000)
  },
  /**
   * 下拉刷新
   */
  onPullDownRefresh () {
    let { loginStatus } = this.data
    let hasUser = loginStatus || !!wx.getStorageSync('user')
    this.setData({
      page: 1
    })
    if (hasUser) {
      this.getAppletUserCouponList('init') // 优惠券列表
      this.getCouponSummaryData(true) // 用户优惠信息
    }
  },

  onHide () {

  },
  onShow () {
    let hasUser = !!wx.getStorageSync('user')
    let { loginStatus } = this.data
    if (hasUser && loginStatus === false) {
      // 如果第一次没有登录，后来在其他页面登录了
      this.getAppletUserCouponList() // 优惠券列表
      this.getCouponSummaryData(true) // 用户优惠信息
    } else if (hasUser && loginStatus) {
      // 本来就登录了
      this.getAppletUserCouponList() // 优惠券列表
      this.getCouponSummaryData(true) // 用户优惠信息
      this.setData({
        loginStatus: null // 下次进来不要再请求了，只能下拉刷新请求
      })
    }
  },
  /**
   * 倒计时
   */
  timer: null,
  getTimerState (data) {
    let timeout = [],timeoutIndex = [],currentTime = ~~(new Date().getTime()/1000)
      clearInterval(this.timer)
      // 获取快过期的优惠券
    for(let i = 0; i < data.length; i++){
      let store = data[i].list
          for(let j = 0; j < store.length; j++){
            let item = store[j]
            let diff = item['endTime'] - currentTime
            if(diff < 86400) {
              timeoutIndex[`[${i}].list[${j}]`] = diff
            }
          }

    }
    // this.setData({
    //   'storeCoupon[0].list[0].goodsId' : 0
    // })
    if(Object.keys(timeoutIndex).length){
      this.timer = setInterval(_=>{
         for(let k in timeoutIndex){
           let key_hh = `storeCoupon${k}.hh`
           let key_mm = `storeCoupon${k}.mm`
           let key_ss = `storeCoupon${k}.ss`
           let t = timeoutIndex[k]--
           let hh = ~~(t / 3600)
           let mm = ~~(t / 60) - hh * 60
           let ss = ~~(t % 60)
           this.setData({
              [key_hh]: hh,
              [key_mm]: mm,
              [key_ss]: ss
            })
         }
      },1000)
    }

  },
  onReachBottom () {
    let {loginStatus, page} = this.data
    if(loginStatus !== false){
      this.setData({
        loading: true,
        page: ++page
      })
      this.getAppletUserCouponList()
    }
  },
  closeRedbag (e) {
    this.setData({
      redbag: false,
      openBag: false
    })
  },
  getShareInfo(){
    eellyReqPromise({
      service: api.getShareTemplate,
      args: {
        condition:{ type: 15 }
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
  /**
   * 用户点击分享
   */
  onShareAppMessage () {
    let { shareInfo } = this.data
    return {
      title: shareInfo.content,
      path: '/pages/home/index?type=share',
      imageUrl: shareInfo.image,
      success (res) {
        // 转发成功
        wx.showToast({
          title: '分享成功',
          icon: 'none'
        })
      },
      fail (res) {
        // 转发失败
        wx.showToast({
          title: '分享失败',
          icon: 'none'
        })
      }
    }
  },
  /**
   * 签到
   */
  getRedBag (e) {
    wx.showLoading({
      mask: true,
      title: '正在签到...'
    });
    eellyLoginBtn(e.detail).then(res => {

      eellyReqPromise({
        service: getMinRedPackage,
        login: true
      }).then(res => {
        let { code, msg, money } = res.data.retval.data
        if (code == 200) {
          this.getCouponSummaryData()
          this.getAppletUserCouponList()
        }else {
          this.setData({
            nonebag: true
          })
        }
        this.setData({
          btnText: '已签到',
        })
        this.setData({
          redbag: true,
          redbagMsg: msg
        })
      })
      wx.hideLoading()
    }).catch(err => {
      wx.hideLoading()
    })
  },
  /**
   * 获取优惠券列表
   */
  getAppletUserCouponList (init) {
    let { storeCoupon, page } = this.data
    eellyReqPromise({
      service: getAppletUserCouponList,
      login: true,
      args: {
        page,
        limit: 10
      }
    }).then(res => {
      let { data } = res.data.retval, allData = []
      for(let couponItem of data){
        couponItem.list.map(item=>{
          item.fstartTime = format(new Date(item.startTime*1000), 'yyyy-MM-dd')
          item.fendTime = format(new Date(item.endTime*1000), 'yyyy-MM-dd')
        })
      }
      allData = init ? data : [...storeCoupon, ...data]
      this.setData({
        loading: false,
        storeCoupon: allData
      })

      this.getTimerState(allData)
    }).catch(err=>{

      this.setData({
        loading: false
      })
    })
  },
  /**
   * 获取优惠券张数，金额。。。
   */
  getCouponSummaryData (loginStatus) {
    eellyReqPromise({
      service: getCouponSummaryData,
      login: loginStatus,
      args: {}
    }).then(res => {
      let { data } = res.data.retval
      this.setData({

        couponSummaryData: data
      })
    }).catch(err => {
      wx.showToast({
        title: err.info || '数据获取失败',
        icon: 'none'
      })
    })
  }
})