const app = getApp();
const { sellerBusinessInfo,
  getMiniProgramStoreGoodsList,
  storeIndexView,
  getUserDynamicList,
  getLiveData,
  getCreateAppletBQrCode
} = require('../../utils/interface/store');
const { eellyReqPromise } = require('../../utils/eellyReq');
const { createdTime, createdTimeRight } = require('../../utils/util');
const { getQRcodeScene } = require("../../utils/util");
const api = require('../../utils/interface/home')
Page({
  data: {
    shareTar: false,
    navTitle: '',
    storeMsg: null,                                //头部信息
    isMore: true,
    store_true: '',                            //显示店铺首页或店铺朋友圈
    active_tip: 'goodsCount',                    //判断导航栏 goodsCount:全部 newMothGoodsCount:新品 hotMothGoodsCount:爆款
    tip_left: 0,                                 //导航栏下边横杆位置
    friendLength: 0,
    goodsList: [],                               //商品信息
    friend_msg: {},                              //店铺首页朋友圈数据
    friend_list: {},                             //朋友圈列表页数据
    all_img: [],                                 //店铺首页朋友圈图片合并数据
    storeId: '',                                 //店铺id
    navAnimation: '',
    /* 普通 0  ， 白银 1 ，  白金 2  ， 黄金 3 ， 砖石 4 */
    vipIco: [ { pic: '', color: '', text: '', type: '' }, {
      pic: '/images/store/by.png',
      color: '#F1F1F1',
      text: '白银VIP',
      type: 'by'
    }, {
      pic: '/images/store/bj.png',
      color: '#09AEEA', text: '白金VIP', type: 'bj'
    }, { pic: '/images/store/hj.png', color: '#F1C40F', text: '皇冠VIP', type: 'hj' }, {
      pic: '/images/store/zs.png',
      color: '#CE46E3',
      text: '钻石VIP',
      type: 'zs'
    } ],
    shareInfo: {}
  },
  /*TODO 初始化店铺数据*/
  initStoreData (storeId) {
    let { store_true } = this.data;
    wx.showLoading({
      title: '加载中...',
    });
    if (store_true !== 'friend') {
      return Promise.all([ this.getStoreInfo(storeId), this.getFriendMsg(storeId), this.getStoreGoodsList(storeId) ]).then(res => {
        wx.hideLoading();
        this.setData({
          navTitle: res[ 0 ].title,
          storeMsg: res[ 0 ], // 店铺信息
          friend_msg: res[ 1 ], // 朋友圈信息
          goodsList: res[ 2 ].list, // 商品列表
          goodsListLength: res[ 2 ].list.length,
        })
      }).catch((err) => {
        wx.showToast({
          title: '请求数据失败',
          icon: 'none'
        })
      })
    } else {
      let friendListData = {
        dataTime: '',
        userId: storeId,
        role: 2
      };
      return Promise.all([ this.getStoreInfo(storeId), this.getFriendistList(friendListData) ]).then(res => {
        wx.hideLoading();
        this.setData({
          navTitle: res[ 0 ].title,
          storeMsg: res[ 0 ], // 店铺信息
          friend_list: res[ 1 ], // 朋友圈信息
          friendLength: res[ 1 ].circle_list.length
        })
      }).catch(err => {
        wx.showToast({
          title: '请求数据失败',
          icon: 'none'
        })
      })
    }
  },
  /*TODO 获取店铺信息*/
  getStoreInfo (storeId) {
    return new Promise((resolve, reject) => {
      eellyReqPromise({
        service: sellerBusinessInfo,
        args: {
          userId: storeId
        }
      }).then(res => {
        let { status, retval } = res.data;
        if (status === 200) {
          let storeInfoData = retval.data;
          if (storeInfoData.sale_goods_count > 9999) {
            storeInfoData.sale_goods_count = `${(storeInfoData.sale_goods_count / 10000).toFixed(2)}万`;
          } else if (storeInfoData.visit_count > 9999) {
            storeInfoData.visit_count = `${(storeInfoData.visit_count / 10000).toFixed(2) }万`;
          }
          resolve(storeInfoData)
        } else {
          reject()
        }
      })
    })
  },
  /*TODO 获取店铺商品*/
  getStoreGoodsList (storeId, sort, page = 1) {
    return new Promise((resolve, reject) => {
      eellyReqPromise({
        service: getMiniProgramStoreGoodsList,
        args: {
          data: {
            storeId,
            pagerParams: {
              page,
              sort: sort || '',
              limit: 20
            }
          }
        }
      }).then(res => {
        wx.hideLoading();
        let { status, retval } = res.data;
        if (status === 200) {
          retval.data.list.forEach(item => {
            item.time = createdTime(item.addGoodsTime)
          })
          resolve(retval.data)
        } else {
          reject()
        }
      })
    })
  },
  /*TODO 首页展示朋友圈数据*/
  getFriendMsg (storeId) {
    return new Promise((resolve, reject) => {
      eellyReqPromise({
        service: storeIndexView,
        args: { storeId }
      }).then(res => {
        let { status, retval } = res.data;
        if (status === 200) {
          let { circle_list } = retval.data, { all_img } = this.data;
          circle_list.forEach(item => {
            all_img = [ ...all_img, ...item.image_list ]
          });
          this.setData({
            all_img
          });
          resolve(retval.data)
        } else {
          reject()
        }
      })
    })
  },
  /*TODO 获取处理生意圈数据*/
  getFriendistList (friendListData) {
    return new Promise((resolve, reject) => {
      eellyReqPromise({
        service: getUserDynamicList,
        args: friendListData
      }).then(res => {
        let { status, retval } = res.data;
        let friend_list = retval.data;
        if (status === 200) {
          //判断是否第一页数据
          friend_list.circle_list.forEach(item => {
            item.month = new Date(item.created_time * 1000).getMonth() + 1;
            item.day = new Date(item.created_time * 1000).getDate();
            item.before = (createdTime(item.created_time));
            item.createdtimeright = (createdTimeRight(item.created_time));
            item.readMore = item.content.length > 105
          });
          resolve(friend_list)
        } else {
          reject()
        }
      })
    })
  },
  onLoad (options) {
    let { id, storeId, scene } = options;
    // 扫码进来的
    if (scene) {
      let sceneStoreId = getQRcodeScene(scene, 'storeId')
      if (!storeId && sceneStoreId) {
        storeId = sceneStoreId
      }

    }
    this.setData({
      storeId,
      store_true: id ? id : true
    }, () => {
      this.initStoreData(storeId);
      this.isLiving().then(res=>{
          let { starting } = res
          if(starting){
            wx.redirectTo({
              url: '/pages/liveDetails/index?liveId=' + starting.liveId
            })
          }
      }).catch(err=>{
        wx.showToast({
          title: err || '网络异常',
          icon: 'none'
        })
      })
    });
    this.getShareInfo()
  },
  /*TODO  导航切换*/
  changeList (event) {  //切换导航栏
    let { offsetLeft } = event.currentTarget, { tip } = event.currentTarget.dataset, { storeId } = this.data;
    let sort = '';
    this.page = 1;
    this.setData({
      tip_left: offsetLeft,
      active_tip: tip,
      isMore: true,

    });
    wx.showLoading({
      title: '加载中...',
    });
    switch (tip) {
      case 'goodsCount':
        sort = '';
        break;
      case  'newMothGoodsCount' :
        sort = 'time';
        break;
      case  'hotMothGoodsCount':
        sort = 'sales';
        break;
    }
    this.getStoreGoodsList(storeId, sort).then(res => {
      this.setData({
        goodsListLength: res.list.length,
        goodsList: res.list
      })
    });
  },
  /*TODO  预览图片*/
  showImage (event) {   //预览朋友圈的图片
    wx.previewImage({
      current: event.currentTarget.dataset.img, // 当前显示图片的http链接
      urls: this.data.all_img // 需要预览的图片http链接列表
    })
  },
  showImageFriend (event) {   //预览朋友圈列表的图片
    let { circle_list } = this.data.friend_list;
    let { itmeindex, imgindex } = event.currentTarget.dataset;
    let media_list = circle_list[ itmeindex ].media_list;
    let srcUrl = circle_list[ itmeindex ].media_list[ imgindex ].url;
    let mediaArry = [];
    for (var i in media_list) {
      mediaArry = mediaArry.concat(media_list[ i ].url_cover)
    }
    if (srcUrl === '') {
      wx.previewImage({
        current: event.currentTarget.dataset.img,
        urls: mediaArry
      })
    }
  },

  readMore (event) {   //文本张开与收起
    let { circle_list } = this.data.circle_list;
    let { index } = event.currentTarget.dataset;
    circle_list[ index ].readMore = !circle_list[ index ].readMore;
    this.setData({
      friend_list: circle_list
    })
  },
  page: 1,
  /*TODO 下拉加载更多*/
  onReachBottom () {      //显示下一页商品信息
    let { storeId, active_tip, store_true, goodsList, count, friend_list, friendLength, goodsListLength } = this.data;
    if (store_true !== 'friend') {
      this.page++;
      if (!goodsListLength) {
        this.setData({
          isMore: false
        })
      } else {
        wx.showLoading({
          title: '加载中...'
        });
        this.getStoreGoodsList(storeId, active_tip, this.page).then(res => {
          wx.hideLoading();
          this.setData({
            goodsListLength: res.list.length,
            goodsList: [ ...goodsList, ...res.list ]
          })
        });
      }
    } else {
      wx.showLoading({
        title: '加载中...'
      });
      let friendListData = {
        dataTime: friend_list.circle_list[ friend_list.circle_list.length - 1 ].created_time,
        userId: storeId,
        role: 2
      };
      this.getFriendistList(friendListData).then(res => {
        wx.hideLoading();
        if (res.circle_list.length) {
          friend_list.circle_list = friend_list.circle_list.concat(res.circle_list);
          this.setData({
            friend_list,
            friendLength: res.circle_list.length
          })
        } else {
          this.setData({
            isMore: false

          })
        }

      })

    }
  },
  navigateTo (event) {
    let { url } = event.currentTarget.dataset;
    wx.navigateTo({ url })
  },
  navigateBack () {
    wx.navigateBack({
      data: 1
    })
  },
  goChat (e) {
    let { userid } = e.currentTarget.dataset;
    if (wx.getStorageSync('tokenKey')) {
      wx.navigateTo({
        url: `/imPartials/pages/chating/chating?chatTo=seller_00000${userid}`
      })
    } else {
      wx.showLoading({
        title: '加载中...'
      });
      app.eellyLoginBtn(e.detail)
        .then(() => {
          wx.navigateTo({
            url: `/imPartials/pages/chating/chating?chatTo=seller_00000${userid}`
          })
        }).catch(() => {
        wx.showToast({
          title: '你已拒绝授权',
          icon: 'none'
        })
      })
    }
  },
  onPageScroll (e) {
    let { navAnimation } = this.data
    if (e.scrollTop > 200) {
      this.setData({
        navAnimation: 'fadeIn'
      })
    } else {
      this.setData({
        navAnimation: 'fadeOut'
      })
    }

  },
  getShareInfo(){
      eellyReqPromise({
        service: api.getShareTemplate,
        args: {
          condition:{ type: 13 }
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
   * 该店铺是否正在直播
   */
  isLiving () {
    let { storeId } = this.data
    return new Promise((resolve,reject)=>{
      eellyReqPromise({
        service: getLiveData,
        args: {
          storeId: storeId
        }
      }).then(res=>{
        let { status, retval, info } = res.data
        if(status === 200) {
          return resolve(retval)
        } else {
          return reject(info)
        }
      })
    })
  },
  /**
   * 用户点击分享
   */
  onShareAppMessage () {
    let { storeId, shareInfo } = this.data
    this.shareCancel()
    return {
      // title: `${activePrice}元${goods_name}`,
      title: shareInfo.content,
      path: '/store/index/index?storeId=' + storeId,
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
   * 打开分享弹窗
   */
  openShare () {
    this.setData({
      shareTar: true
    })
  },
  /**
   *  取消分享
   */
  shareCancel () {
    this.setData({
      shareTar: false
    })
  },
  getCanvasPhoto(filepath){
    const ctx = wx.createCanvasContext('scan') //上下文
    let w = 405, h = 548
    wx.getImageInfo({
      src: filepath,
      success:(res)=>{
        console.log(res)
      }
    })
    //白色背景
    ctx.setFillStyle('#ffffff')
    ctx.fillRect(0, 0, w, h,)

    ctx.drawImage('/images/store/shareBg.png', 0, 0, w, h )

    ctx.setTextAlign('center')
    ctx.font = 'bold'
    ctx.setFontSize(16)
    ctx.fillText(this.data.navTitle+'的直播间', w / 2, 490)


    //把图片放进去
    ctx.drawImage(filepath, (w -225) / 2, 210, 225, 225 )

    //绘画
    ctx.draw(false, () => {
      //生成图片路径
      wx.canvasToTempFilePath({
        canvasId: 'scan',
        width:w,
        height:h,
        quality:1,
        destWidth: w,
        destHeight: h,
        success:(res)=> {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success(res) {
              wx.showToast({
                title: '保存成功',
                icon: 'none'
              })
            },
            fail(err){
              wx.showToast({
                title: '保存失败',
                icon: 'none'
              })
            }
          })
        },
        //生成失败
        fail:(err)=>{
          wx.showToast({
            title: '保存失败',
            icon: 'none'
          })
        }
      },this)
    })
  },
  /**
   * 保存二维码
   */
  onSaveScan () {
    let { storeId } = this.data
    this.shareCancel()
    wx.showLoading({
      mask: true,
      title: '正在保存...'
    });
    eellyReqPromise({
      service: getCreateAppletBQrCode,
      args: {
        data: {
          prefixType: 'store',
          page: 'store/index/index',
          scene: '?storeId='+storeId,
          id: storeId
        }
      }
    }).then(res=>{
      let { status, retval } = res.data
      if(status === 200) {
        wx.downloadFile({
          url: retval.data.imageUrl,
          success:(res)=> {
            if (res.statusCode === 200) {
              this.getCanvasPhoto(res.tempFilePath)

            }
          }
        })
      } else {

      }
    }).catch(err=>{
      wx.showToast({
        title: err.info || '保存失败',
        icon: 'none'
      })
    })
  }
});