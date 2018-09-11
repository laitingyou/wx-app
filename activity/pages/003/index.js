const { getAppletRecommendData, getOneyuanData, addSubscribe } = require('../../../utils/interface/activity')
const api = require('../../../utils/interface/home')
const { eellyReqPromise } = require("../../../utils/eellyReq")
import { routerTo } from '../../../utils/util'
import { getTitleArea } from '../../../utils/interface/live'
const App = getApp()

const { getAccessToken, eellyLogin, eellyLoginBtn } = App

Page({
  /**
   * 页面的初始数据
   */
  data: {
    noLogin: true,
    user: {},
    title: [],
    recommendData: {},
    activeNav: 'currentNav',
    goodsList: [],
    animationData: {},
    timerRun: true , // 定时器运行
    modelHidden: true
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    getAccessToken().then(res=>{
      this.getLiveData().then(res => {
        this.processLiveData(res)
      }).catch(err => {

      })
      this.getTitle()
      this.getAppletRecommendData()
      this.getOneyuanData(1)
      this.animation = wx.createAnimation({
        duration: 1000,
        timingFunction: 'ease',
      })
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow () {
    this.setData({
      timerRun: true
    })
    // this._init()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide () {
    this.setData({
      timerRun: false
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload () {
    // store.remove('my_init', this)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh () {
    this._init()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage () {
    return {
      title: '百里挑衣 1元领衣服',
      path: '/activity/pages/003/index',
      imageUrl: '',
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
          title: '分享失败',
          icon: 'none'
        })
      }
    }
  },
  animation: '',
  onClickNav (e) {
    let { dataset } = e.currentTarget
    this.setData({
      activeNav: dataset.class
    })
    this.getOneyuanData(dataset.class === 'currentNav' ? 1 : 0)
  },
  _init () {
    this.getUserData()
      .then(() => {
        // 取订单数
        wx.stopPullDownRefresh() //取消下拉刷新
        wx.hideLoading()
      })
      .catch((error) => {
        wx.stopPullDownRefresh() //取消下拉刷新
        let { type, info } = error
        if (type != 'getUserStorage') {
          wx.showToast({
            title: info,
            icon: 'none',
            duration: 2500
          })
        }
        wx.hideLoading()
        // if (this.data.hotGood.length < 1) {
        // }
      })
  },
  timer: 0,
  getAppletRecommendData () {
    eellyReqPromise({
      service: getAppletRecommendData,
      args: {}
    })
      .then((res) => {
        let { status, info = '网络异常', retval } = res.data
        let { orderLikeSuccessList } = retval.data, count = 0
        if (status == 200) {
          this.setData({
            recommendData: retval.data
          })
          if(orderLikeSuccessList.length === 0) return
          this.timer=setInterval(_=>{
            if(orderLikeSuccessList[count+1] ){
              if(!this.data.timerRun) return
              this.animation.translateY((-100 * ++count) + '%' ).step()
              this.setData({
                animationData: this.animation.export()
              })
            }else {
              clearInterval(this.timer)
              this.getAppletRecommendData()
            }
          },4000)
        } else {

        }
      })
      .catch((error) => {
      })
  },
  routerTo,
  getOneyuanData (status) {
    let user = wx.getStorageSync('user') || {}
    eellyReqPromise({
      service: getOneyuanData,
      args: {
        userId: user.uid || 0,
        status: status,
        page: 1,
        limit: 10
      }
    })
      .then((res) => {
        let { status, info = '网络异常', retval } = res.data
        if (status == 200) {
          this.setData({
            goodsList: retval.data
          })
        } else {

        }
      })
      .catch((error) => {
        wx.showToast({
          title: error.info || '网络异常',
          icon: 'none'
        })
      })
  },
  addSubscribe(e){
    let {index, id} = e.currentTarget.dataset
    wx.showLoading({ title: '正在订阅...' })
    eellyLoginBtn(e.detail).then(res => {
      eellyReqPromise({
        service: addSubscribe,
        login:true,
        args: {
          gliId: id
        }
      })
        .then((res) => {
          let { status, info = '网络异常', retval } = res.data
          let {goodsList} = this.data
          let datakey = `goodsList[${index}].isSubscribe`
          if (status == 200) {
              this.setData({
                [datakey]:true
              })
            wx.hideLoading()
          } else {
            wx.showToast({
              title: info,
              icon: 'none'
            })
          }
        })
        .catch((error) => {
          let {activeNav} = this.data
          wx.showToast({
            title: error.info || '网络异常',
            icon: 'none'
          })
          this.getOneyuanData(activeNav === 'currentNav' ? 1 : 0)
        })
    }).catch(res => {
      wx.showToast({
        title: '登录失败',
        icon: 'none'
      })
    })
  },
  getUserData () {
    return getAccessToken()
      .then(() => {
        // 从缓存中取用户信息
        return this.getUserStorage()
      })
  },
  /**
   * [getUserStorage 在缓存中找用户信息]
   */
  getUserStorage () {
    let that = this
    return new Promise((reslove, reject) => {
      wx.getStorage({
        key: 'user',
        success (res) {
          let { data } = res
          that.setData({
            noLogin: false,
            user: res.data
          })
          reslove('取得')
        },
        fail () {
          reject({
            type: 'getUserStorage',
            info: '获取缓存信息失败'
          })
        }
      })
    })
  },
  login (e) {
    wx.showLoading({ title: '正在登录...' })
    eellyLoginBtn(e.detail).then(res => {
      this._init()
    }).catch(res => {
      wx.showToast({
        title: '登录失败',
        icon: 'none'
      })
    })
  },
  openRule(){
    this.setData({
      modelHidden:false
    })
  },
  closeModel(){
      this.setData({
        modelHidden:true
      })
  },
  onPreview(){
      return
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
  getTitle () {
    eellyReqPromise({
      service: getTitleArea,
    })
      .then((res) => {
        let { status, info = '网络异常', retval } = res.data
        if (status == 200) {
          this.setData({
            title: retval.data[ 1 ]
          })
        }
      })
      .catch((error) => {
        wx.showToast({
          title: error.info || '网络异常',
          icon: 'none'
        })
      })
  }
})
