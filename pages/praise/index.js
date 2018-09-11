const { invitationLike, addOrderLike, getRandomLive } = require('../../utils/interface/praise')
const { eellyReqPromise } = require('../../utils/eellyReq')
const { getAccessToken, eellyLoginBtn } = getApp()
import { subtract } from '../../utils/floatNumber'
const api = require('../../utils/interface/home')
import {getTitleArea} from '../../utils/interface/live'
const { sendFromId } = require('../../utils/formId')
const App = getApp()
Page({
  data: {
    indicatorDots: false,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    imgUrls: [],
    current: 1,
    extendClass: {
      height: 'itemHeight_praise',
      bgcolor: 'itembg_praise'
    },
    hh: 0,
    mm: 0,
    ss: 0,
    modal: false,
    data: {},
    uid: 1,
    expired: false,
    orderId: 156,
    navAnimation: 'fadeIn',
    savePrice: 0, // 节省了多少钱
    needLikesCount: 0, // 差几个赞
    randomLive:{},
    title:[],
    formId: ''
  },
  onLoad (parameter) {
    let {orderId = 1} = parameter
    let {referrerInfo} = getApp()
    if (referrerInfo && !orderId) {
      let {extraData} = referrerInfo
      orderId = extraData.orderId    
    }
    this.setData({
      orderId: orderId
    })
    wx.getStorage({
      key: 'user',
      success: (res) => {
        this.setData({
          uid: res.data.uid
        })
      }
    })
    getAccessToken().then(res => {
      this.getTitle()
      this.getLiveData().then(res=>{
        this.processLiveData(res)
      }).catch(err=>{

      })
      this.getInitData()
    }).catch(err => {
      wx.showToast({
        title: err.info || '网络异常',
        icon: 'none'
      })
    })
  },
  getRandomLive(arr){
    let len = arr.length;
    let index = Math.floor(len*Math.random())
    if(len === 0) return
    this.setData({
      randomLive:arr[index]
    })
  },
  swiperChange (e) {
    this.setData({
      current: e.detail.current + 1
    })
  },
  /**
   * 倒计时
   */
  onTimer (s) {
    let hh = ('0' + Math.floor(s / 3600)).slice(-2)
    let mm = ('0' + (Math.floor(s / 60) - hh * 60)).slice(-2)
    let ss = ('0' + (s - hh * 3600 - mm * 60)).slice(-2)
    this.setData({
      hh,
      mm,
      ss
    })
    setTimeout(() => {
      this.onTimer(--s)
    }, 1000)
  },
  openModal () {
    this.setData({
      modal: true
    })
  },
  getInitData (isLoading = true, callback) {
    isLoading && wx.showLoading({ title: '加载中...' })

    eellyReqPromise({
      service: invitationLike,
      args: {
        orderId: this.data.orderId
      }
    }).then(res => {
      let { data } = res.data.retval
      if (res.data.status == 200) {
        let time = +data.orderPayTime + 24 * 60 * 60 - Math.floor((new Date(res.header.Date).getTime()) / 1000)
        let savePrice = subtract(data.specialGoodsInfo.originalPrice, data.specialGoodsInfo.specialPrice, 2)
        let { needLikesCount, orderRequireLikes } = data

        this.setData({
          orderRequireLikes,
          data,
          savePrice,
          expired: time > 0 ? false : true,
          needLikesCount: ~~needLikesCount
        })
        wx.stopPullDownRefresh()
        // console.log(time)
        if (time > 0) {
          this.onTimer(time)
        }
        callback && callback()
        wx.hideLoading()
        this.setData({
          navAnimation: 'fadeIn'
        })
      } else {
        wx.showToast({
          title: res.data.info || '网络异常',
          icon: 'none'
        })
      }
    }).catch(err => {
      wx.showToast({
        title: err.info,
        icon: 'none'
      })
      wx.stopPullDownRefresh()
      this.setData({
        navAnimation: 'fadeIn'
      })
    })
  },
  /*点赞请求*/
  addLikeAjax () {
    let { data } = this
    let { orderId, uid, data: { specialGoodsInfo: { goodsId } } } = data
    return eellyReqPromise({
      login: true,
      service: addOrderLike,
      args: {
        data: {
          orderId: orderId,
          userId: uid,
          goodsId: goodsId
        }
      }
    }).then(res => {
      if (res.data.status == 200) {
        // 给服务端发formId
        sendFromId(this.data.formId)
        this.getInitData(false, () => {
          wx.hideLoading()
          this.setData({
            modal: true
          })
        })
      } else {
        wx.showToast({
          title: res.data.info || '网络异常',
          icon: 'none'
        })
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/home/index'
          })
        }, 2000)
      }
    }).catch(err => {
      wx.showToast({
        title: err.info,
        icon: 'none'
      })
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/home/index'
        })
      }, 2000)
    })
  },
  onClose () {
    setTimeout(() => {
      wx.switchTab({
        url: '/pages/home/index'
      })
    }, 1000)
  },
  /**
   * 点赞
   */
  addLike (e) {

    wx.showLoading({ title: '加载中...' })

    let uid = ''
    // 判断是否登录
    if (wx.getStorageSync('tokenKey')) {
      uid = wx.getStorageSync('user').uid
      this.addLikeAjax() //发起点赞请求
    } else {
      eellyLoginBtn(e.detail).then(res => {
        uid = res.user.uid
        this.setData({
          uid
        })
        this.addLikeAjax() //发起点赞请求
      }).catch(err => {
        wx.showToast({
          title: err.info || '登录失败',
          icon: 'none'
        })
      })
    }

  },
  /**
   * 下拉刷新
   */
  onPullDownRefresh () {
    this.setData({
      navAnimation: 'fadeOut'
    })
    this.getInitData(false)
  },
  onShareAppMessage (res) {
    let { data } = this.data
    App.addBarrage(8)
    return {
      title: `我想要这个!麻烦大家帮我点个赞吧!我就能省${this.data.savePrice || 0}元呢!`,
      path: 'pages/praise/index?orderId=' + this.data.orderId,
      imageUrl: data.defaultImg,
      success (res) {
        // 转发成功
      },
      fail (res) {
        // 转发失败
      }
    }
  },
  // 处理"直播中"列表数据
  processLiveData (list = []) {
    let newList = []
    let advanceListToday = []
    for (let i = list.length - 1; i >= 0; i--) {
      let item = list[ i ]
      // 取出今日“即将开播”
      if (item.status == 0) {
        advanceListToday.unshift(item)
        // 取出今日开播
      } else {
        newList.unshift(item)
      }
    }
    // 添加属性different，用于判断每隔两个就以不同样式显示
    for (let i = 0; i < newList.length; i++) {
      if ((i + 1) % 4 == 0 && i >= 3) {
        newList[ i ].different = true
        newList[ i - 1 ].different = true
      }
    }
    this.getRandomLive(newList)
    this.setData({
      advanceListToday,
      liveDataToday: {
        loading: false,
        end: true,
        list: newList
      }
    })
  },
  // 取直播数据
  getLiveData (type = 1) {
    return new Promise((resolve, reject) => {
      type *= 1
      eellyReqPromise({
        service: api.getAppLetLiveList,
        login: !!wx.getStorageSync('user'),
        args: {
          type,
          page: 1
        }
      })
        .then((res) => {
          let { status, info = '网络异常', retval } = res.data
          if (status == 200) {
            let list = retval.data.items
            resolve(list)
          } else {
            reject({
              type: 'getLiveData',
              info
            })
          }
        })
        .catch((error) => {
          reject(error)
        })
    })
  },
  /**
   * 获取直播标题
   */
  getTitle(){
    eellyReqPromise({
      service: getTitleArea,
    })
      .then((res) => {
        let { status, info = '网络异常', retval } = res.data
        if (status == 200) {
          this.setData({
            title: retval.data[1]
          })
        }
      })
      .catch((error) => {
        wx.showToast({
          title: error.info || '网络异常',
          icon: 'none'
        })
      })
  },
  bindsubmit(e){
    this.setData({
      formId: e.detail.formId
    })
  }
})
