const api = require('../../utils/interface/home')
const { appGetGoodsDetail} = require('../../utils/interface/detail')
const { getProgressList, getPendingList } = require("../../utils/interface/live")
const { eellyReqPromise, eellyReq } = require('../../utils/eellyReq')
const { getCoupon } = require('../../utils/getCoupon')
const {adDataMap} = require('../../utils/adDataMap')
const { getAuth } = require("../../utils/auth")
const { getQRcodeScene } = require("../../utils/util")
const {getAd} = require('../../utils/interface/ad')
const App = getApp()
const { getAccessToken, eellyLoginBtn } = App
Page({
  data: {
    redbag: false, // 领取红包显示
    redbagMsg: '', // 红包显示的文案
    basicInfo: {}, // 直播内容.拼货商品.等等
    userInfo: {},//用户信息
    openBag: false,//分享红包显示
    isShow: false,//模块隐藏显示
    adList: [], //幻灯广告
    adListIndex: 1, //当前幻灯广告
    adListTitle: '',  //当前幻灯广告标题
    navAnimation: 'fadeOut',//导航动画    
    titleArea: {}, // “视频商品”和“直播”区域的标题    
    videoShow: false,
    currentVideo: '',
    /*swipperRuning: false,
    adimgs: [1,2,3],
    swipperMove:0,*/
    modelHidden: true,
    // 直播列表页面距滚动到底部多少时加载数据
    lowerThreshold: 320,
    // 直播列表是否最后一页
    progressListEnd: false,
    pendingListEnd: false,
    // 直播列表数据
    progressList: [],
    pendingList: [],
    // 直播列表当前页码
    progressPage: 0,
    pendingPage: 0,
    // 直播列表请求中
    progressLoading: false,
    pendingLoading: false,
    redbag: false,
    openBag: false
  },
  onReady () {
    // console.log(thisPage)
  },
  onLoad (parameter) {
    // 取视口高度
    this.getWondowHeight()
    // 通过二维码进来的有scene，
    let {scene} = parameter
    if (scene) {
      let tgfrom = getQRcodeScene(scene, 'tgFrom')
      if (wx.reportAnalytics && tgfrom) {
        // 首页统计入口
        wx.reportAnalytics('tg_source', {
          tgfrom
        })
      }
    }
    App.aldstat.sendEvent('访问首页',{
      'time' : 123123
    });
    let user = wx.getStorageSync('user')
    this.setData({
      userInfo: user
    })
    /* homeLoading: true*/
    wx.showLoading({
      title: '加载中…',
      icon: 'loading'
    })
    /*先获取tooken*/
    getAccessToken()
      .then(() => {
        this.getAdData() //取广告数据
        if (parameter.type == 'share') {
          this.setData({
            openBag: true
          })
        }else if(parameter.calculator == '1'){
          this.onCouter()
        }
        // switchTab无法带参，所以用缓存判断
        let that = this
        wx.getStorage({
          key: 'homeAdUrl',
          success: function(res) {
            switch(res.data){
              case '/pages/home/index?type=share':
                that.setData({
                  openBag: true
                })
                break;
              case '/pages/home/index?calculator=1':
                that.onCouter()
                break;
              default:
            }
            wx.removeStorage({key: 'homeAdUrl'})
          }  
        })
        // 初始化页面，链式调用ajax方法
        this._init()
        // 更新优惠券信息
        getCoupon(eellyReq, (e) => {
          this.setData({
            couponPrice: e.totalPrice || 0
          })
        })
      })
      .catch((error) => {
        wx.showToast({
          title: error.info || '网络异常',
          icon: 'none'
        })
      })
      
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload () {

  },
  /**
   * [_init 初始化页面方法，在拿到AccessToken]
   *
   */
  _init () {
    // 清空数据
    
    this.getHomeData()
      .then(() => {
        // let { liveCountList } = this.data
        // 取直播数据
        Promise.all([this.getProgressListFun(true), this.getPendingListFun(true)])
            .then(([resProgressData, resPendingData]) => {
                wx.hideLoading()
            }, ({ type, info }) => {
                if (type == 'error') {
                    wx.showToast({
                        title: info || '网络异常',
                        icon: 'none'
                    })
                }
            })
      })
  },
  /**
   * [getHomeData 取首页数据]
   */
  getHomeData () {
    return new Promise((resolve, reject) => {
      let { userInfo } = this.data
      Promise.all([
        // 取基本信息
        eellyReqPromise({
          service: api.getGoodsTitle
        }),
        // 判断是否显示直播列表，新包过审时使用
        getAuth()
      ])
        .then(([ homeData, authData ]) => {
          let { status, info = '网络异常', retval } = homeData.data
          if (status == 200) {
            let { data } = retval
            let { liveCountList = [] } = data
            delete data.liveCountList
            let navigateIcon = adDataMap(data.navigateIcon) //简化接口返回的数据（顶部icon）
            if (navigateIcon.length > 5) {
              navigateIcon.length = 5
            }
            delete data.navigateIcon
            this.setData({
              basicInfo: data,
              isShow: authData,
              navigateIcon
            })
            resolve()
          } else {
            reject({
              type: 'getHomeData',
              info
            })
          }
        })
        .catch((error) => {
          reject(error)
        })
    })
  },
  // 读取视口高度，用于页面滚到底部加载新数据
  getWondowHeight() {
    let res = wx.getSystemInfoSync()
    this.setData({
      windowHeight: res.windowHeight
    })
  },  
  closeRedbag (e) {
    this.setData({
      redbag: false,
      openBag: false
    })
  },
  /**
   * 登录
   */
  onLogin (e, callback) {
    /*请求登录*/
    !callback && wx.showLoading({ title: '正在登录...' })
    eellyLoginBtn(e.detail).then(res => {
      this.setData({
        userInfo: wx.getStorageSync('user')
      })
      wx.hideLoading()
      !callback && this.getRedBag(e)
      // if(this.data.basicInfo['couponPrice']){
      //     // 为了更新“优惠券余额” 重新调接口
      //     this.getHomeData()
      // }
      callback && callback()
    }).catch(err => {
      wx.showToast({
        title: '登录失败',
        icon: 'none'
      })
    })
  },
  /**
   * 获取商品列表高度
   */
  queryNodes (className, callback) {
    let query = wx.createSelectorQuery()
    query.select(className).boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(res => {
      if (!res[ 0 ]) return;
      callback && callback(res)
    })
  },
  // 用于事件节流
  pageScrollBottom: null,
  /**
   * 滚动触发加载事件，
   */
  onPageScroll ({ scrollTop }) {
    clearTimeout(this.pageScrollBottom)
    
    this.pageScrollBottom = setTimeout(() => {
      this.changePageTitleClass(scrollTop)
      let that = this
      wx.createSelectorQuery().select('#j-body').boundingClientRect(function (rect) {
          rect.height  // 节点的高度
      }).exec(function (res) {
          let bodyHeight = res[0].height
          let { windowHeight, lowerThreshold } = that.data
          if (scrollTop >= bodyHeight - windowHeight - lowerThreshold) {
            that.addMore() //加载更多直播视频 
          }
      })
    }, 50)

  },
  // 改变页面标题栏样式
  changePageTitleClass (scrollTop) {
    let { navAnimation } = this.data
    if (scrollTop < 200) {
      if (navAnimation == 'fadeOut') return
      this.setData({
        navAnimation: 'fadeOut'
      })
    } else {
      if (navAnimation == 'fadeIn') return
      this.setData({
        navAnimation: 'fadeIn'
      })
    }
  },
  /**
   * [changeTabClass 改变选项卡]
   */
  changeTabClass (scrollTop) {
    let { currentTabFixed } = this.data
    this.queryNodes('#j-tab', (res) => {
      let isFixed = (res[ 0 ].top <= 70)
      if (isFixed != currentTabFixed) {
        this.setData({
          currentTabFixed: isFixed
        })
      }
    })
  },
  //领取红包成功，发送公众号消息
    sendReceiveRedPackage(){
        eellyReqPromise({
            service:api.sendReceiveRedPackage,
            args:{
              userId: this.data.userInfo.uid
            },
            login: true
        }).then(res=>{

        }).catch(err=>{

        })
    },
  /**
   * 领取红包
   */
  getRedBag (e) {
    wx.showLoading()
    this.onLogin(e, () => {
      eellyReqPromise({
        service: api.getMinRedPackage,
        login: true
      }).then(res => {
        let { code, msg, money } = res.data.retval.data
        if (code == 400) {
          this.setData({
            redbag: true,
            redbagMsg: msg
          })
          wx.hideLoading()
        } else if (code == 200) {
          if (money == 0) {
            // wx.showToast({
            //   title: msg,
            //   icon: 'none'
            // })
          } else {
            wx.hideLoading()
            this.setData({
              redbag: true,
              redbagMsg: msg
            })
            let data = {}
            data[ 'price' ] = this.data.basicInfo.receiveCouponPrice
            App.addBarrage(5, data)
            this.sendReceiveRedPackage()
          }
        }
        getCoupon(eellyReq, (e) => {
          this.setData({
            couponPrice: e.totalPrice
          })
        })
      }).catch(err => {
        // if(!isToast) return;
        wx.showToast({
          title: err.info,
          icon: 'none'
        })
      })
    })

  },
  /**
   * 打开人家分享的红包
   */
  onOpenRedBag (e) {
    wx.showLoading()
    this.onLogin(e, () => {
      this.setData({
        openBag: false
      })
      this.getRedBag(e)
    })
  },
  /**
   * 分享红包
   * @param res
   * @returns {{title: string, path: string, imageUrl: string, success(*): void, fail(*): void}}
   */
  onShareAppMessage (res) {
    let { basicInfo, userInfo } = this.data
    let that = this
    // if(!userInfo.uid){
    //     wx.navigateTo({
    //         url: '/pages/login/index'
    //     })
    // }
    App.addBarrage(2)
    return {
      title: basicInfo.shareInfo.title,
      path: '/pages/home/index?type=share',
      imageUrl: basicInfo.shareInfo.img,
      success (res) {
        // 转发成功
        that.setData({
          redbag: false
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
   * 上拉触发页面加载
   */
  onReachBottom () {

  },
  enterDetail (e) {
    let { basicInfo } = this.data,
      { url, index } = e.currentTarget.dataset
    let item = basicInfo[ 'activityGoods' ][ index ]
    eellyReqPromise({
      service: appGetGoodsDetail,
      args: {
        goodsId: item.goodsId
      }
    }).then(res => {
      wx.setStorageSync('this_goods', res)
    }).catch(err => {
      wx.showToast({
        title: err.info,
        icon: 'none'
      })
    })
    wx.setStorageSync('tmp_goods', item)
    wx.navigateTo({
      url: url + '&isPreload=true'
    })

  },
  /**
   * 下拉刷新
   */
  onPullDownRefresh () {
    // wx.showLoading({
    //     title: '加载中……',
    //     icon: 'loading',
    //     mask: true
    // })
    this._init()
      .then(() => {
        wx.stopPullDownRefresh()
        wx.hideLoading()
      })
      .catch((error) => {
        wx.stopPullDownRefresh()
        wx.showToast({
          title: error.info,
          icon: 'none'
        })
      })
  },

  onShow () {
    /**
     * 如果从其他页面登录再回到首而的，拿本地信息
     */
    let couponInfo = wx.getStorageSync('couponInfo')
    let user = wx.getStorageSync('user')
      this.setData({
        userInfo: user || {},
        couponPrice: couponInfo.totalPrice || 0
      })
  },

  videoPlay (e) {
    let { src, originalprice, specialprice, goodsid } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/other/pages/video/index?src=${src}&originalPrice=${originalprice}&specialPrice=${specialprice}&goodsId=${goodsid}&btn=true`
    })
  },  
  onCouter(e){
      this.setData({
        modelHidden: false
      })
  },
  closeModel(e){
    this.setData({
      modelHidden: true
    })
  },
  // 取广告数据
  getAdData() {
    eellyReqPromise({
        service: getAd,
        args: {
          condition: {
            position: 1
          }
        }
      })
      .then((res) => {
        let {
          status,
          info,
          retval
        } = res.data
        if (status == 200) {
          let newAdList = adDataMap(retval.data) // 广告数据简化
          let adListIndex = 1
          let adListTitle = ''
          if (newAdList.length > 0) {
            adListTitle = newAdList[0].title
          }
          this.setData({
            adList: newAdList,
            adListTitle
          })
        }
      })
      .catch(({
        info
      }) => {
        wx.showToast({
          title: info,
          icon: 'none'
        })
      })
  },
  // 幻灯广告滑动
  adSwiperChange(event){
    let {current} = event.detail    
    let {adList} = this.data
    this.setData({
      adListTitle: adList[current].title,
      adListIndex: current + 1
    })
  },
  /**
   * 直播中列表
   * @param  {boolean} reset [默认为false，为true时请求第一页并重置数据到一页]
   * @return {[type]}        [description]
   */
  getProgressListFun(reset = false) {
    return new Promise((resolve, reject) => {
      let that = this
      let {
        progressPage,
        progressListEnd,
        progressList,
        progressLoading
      } = this.data

      if (progressListEnd && !reset) {
        reject({
          type: 'end',
          info: '没有了'
        })
      } else if (!progressLoading) {
        that.setData({
          progressLoading: true
        })
        progressPage = reset ? 1 : progressPage + 1

        eellyReqPromise({
            service: getProgressList,
            args: {
              page: progressPage,
              platform: 'APPLET'
            }
          })
          .then((res) => {
            that.setData({
              progressLoading: false
            })
            let {
              status,
              info,
              retval
            } = res.data
            if (status == 200) {
              let {
                page: {
                  totalPages
                },
                items: listData
              } = retval.data

              if (totalPages == progressPage || listData.length == 0) {
                that.setData({
                  progressListEnd: true
                })
              }
              let newProgressList = reset ? listData : [...progressList, ...listData]
              // 添加属性different，用于判断每隔两个就以不同样式显示
              for (let i = 0; i < newProgressList.length; i++) {
                if ((i + 1) % 4 == 0 && i >= 3) {
                  newProgressList[ i ].different = true
                  newProgressList[ i - 1 ].different = true
                }
              }                
              that.setData({
                progressPage: progressPage,
                progressList: newProgressList,
              })
              resolve(listData)
            } else {
              reject({
                type: 'error',
                info
              })
            }
          })
          .catch((error) => {
            that.setData({
              progressLoading: false
            })
            reject(error)
          })
      }
    })
  },
  /**
   * [getPendingListFun 直播预告列表]
   * @param  {boolean} reset [默认为false，为true时请求第一页并重置数据到一页]
   * @return {[type]}            [description]
   */
  getPendingListFun(reset = false) {
    return new Promise((resolve, reject) => {
      let that = this
      let {
        pendingPage,
        pendingListEnd,
        pendingList,
        pendingLoading
      } = this.data

      if (pendingListEnd && !reset) {
        reject({
          type: 'end',
          info: '没有了'
        })
      } else if (!pendingLoading) {
        that.setData({
          pendingLoading: true
        })
        pendingPage = reset ? 1 : pendingPage + 1
        let login = wx.getStorageSync('tokenKey') ? true : false
        eellyReqPromise({
            service: getPendingList,
            args: {
              page: pendingPage,
              platform: 'APPLET'
            },
            login
          })
          .then((res) => {
            that.setData({
              pendingLoading: false
            })
            let {
              status,
              info,
              retval
            } = res.data
            if (status == 200) {
              let {
                page: {
                  totalPages
                },
                items: listData
              } = retval.data
              if (totalPages == pendingPage || listData.length == 0) {
                that.setData({
                  pendingListEnd: true
                })
              }
              let newPendingList = reset ? listData : [...pendingList, ...listData]
              that.setData({
                pendingPage: pendingPage,
                pendingList: newPendingList,
              })
              resolve(listData)
            } else {
              reject({
                type: 'error',
                info
              })
            }
          })
          .catch((error) => {
            that.setData({
              pendingLoading: false
            })
            reject(error)
          })
      }
    })
  },
  addMore() {
    let {
      progressListEnd,
      pendingListEnd
    } = this.data
    if (!progressListEnd) {
      this.getProgressListFun()
    } else if (!pendingListEnd) {
      this.getPendingListFun()
    }
  },
  /**
   * [toCalculator 取用户信息后跳到“计算器”页面]
   */
  toCalculator(event){
    let {userInfo = {}} = event.detail
    let {
      nickName = '',
      avatarUrl = '',
      province = ''
    } = userInfo
    wx.setStorage({
      key: 'userInfoCalculator',
      data: {
        nickName,
        avatarUrl,
        province
      },
      complete(){
        wx.navigateTo({
          url: '/calculator/pages/home/index'
        })
      }
    })
  }
})