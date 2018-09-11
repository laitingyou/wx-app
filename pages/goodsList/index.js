const api = require('../../utils/interface/home.js')
import {getAdvertising} from '../../utils/interface/goodsPage'
// const {getActivityArea} = require('../../utils/interface/home.js')
const {eellyReqPromise, eellyReq} = require("../../utils/eellyReq")
const {getTokenKey} = require("../../utils/eellyGetTokenKey")
const {getCoupon} = require('../../utils/getCoupon')
const { subtract } = require("../../utils/floatNumber")
const { fillZero } = require("../../utils/util")
const App = getApp()
const {adDataMap} = require('../../utils/adDataMap')
const {eellyLogin, getAccessToken, eellyLoginBtn} = App
const {getAuth} = require("../../utils/auth")
Page({
    data: {

        wHeight: 0,
        msgShow: false,
        current: 'nav-0',
        scrollable: true,
        goodLists: [[], [], [], []],
        basicInfo: [],
        ispadding: false,
        currentPage: 0,
        currentPageHeight: 400,
        type: 0,
        isShow: false,
        activityStoreGood: [],
        storeGoodsPage: 1,
        isloading: false,
        //[289, 292, 293, 344, 343, 342, 345]; //女装、男装、童装、内衣、箱包、鞋靴、衣饰
        currents: 0,
        adTabList: [{name: '女装', category: 289}, {name: '男装', category: 292}, {name: '童装', category: 293}, {
            name: '内衣',
            category: 344
        }, {name: '箱包', category: 343}, {name: '鞋靴', category: 342}, {name: '衣饰', category: 342}],

        adData: null,
        isSwiperLoading: ''

    },
    onReady() {

    },

    switchTab(e) {
        let {currents, catid} = e.currentTarget.dataset;
        this.setData({
            currents,
            adData: null,
        }, () => {
            this.getAdList(catid)
        });
    },
    getAdList(category) {
        this.setData({
            isSwiperLoading: '正在加载...'
        });
        eellyReqPromise({
            service: getAdvertising,
            args: {
                condition: {
                    category,
                    type: 1
                }
            }
        }).then(res => {
            this.setData({
                isSwiperLoading: ''
            })
            let {status, retval} = res.data;
            if (status === 200) {
                let {data} = retval;
                if (data.length) {
                    data.forEach((item, index, arr) => {
                        arr[index] = adDataMap(item);
                    });
                    this.setData({
                        adData: data
                    })
                } else {
                    this.setData({
                        adData: data,
                        isSwiperLoading: '暂无数据'
                    })
                }
            } else {
                this.setData({
                    isSwiperLoading: '加载失败...'
                })
            }
            wx.hideLoading()
        }).catch(err=>{
          wx.showToast({
            title: err.info || '网络异常',
            icon: 'none'
          })
        })
    },
    adToHome(event){
        let {url} = event.currentTarget.dataset;
        if (/^\/pages\/home\/index/.test(url)) {
            wx.setStorage({
                key: "homeAdUrl",
                data: url
            })
        }
    },
    onLoad(parameter) {
        wx.showLoading({
            title: '加载中……'
        })
        this.getAdList(289)

        /*先获取tooken*/
        getAccessToken().then(res => {
            this.getBasicInfo()

            getAuth().then(_res => {
                this.setData({
                    isShow: _res
                })
            }).catch(err => {

            })
            /*获取商品分类*/
        }).catch(err => {
        })
    },
    onShow(parameter) {
        // let tarIndex= App.globalData.tarIndex || 0
        // if(this.data.currentPage === tarIndex) return;
        // wx.pageScrollTo({
        //     scrollTop: 0,
        //     duration: 300
        // })
        // this.setData({
        //     current:'nav-'+tarIndex,
        //     currentPage:tarIndex,
        //     activityStoreGood:[],
        //     storeGoodsPage:1
        // })
        // let {basicInfo}=this.data
        // if(basicInfo.length>0){
        //     let {type} = basicInfo[tarIndex]
        //     console.log(basicInfo[tarIndex])
        //         this.getgoodsList(type)
        //         this.setData({
        //             type
        //         })
        // }
    },

    /**
     * 滚动触发加载事件，
     * @param e
     */
    onPageScroll(e) {


    },


    /*点击商品分类*/
    getGoods(e) {
        if (e.target.dataset.index === this.data.currentPage) return
        // wx.showLoading({
        //     title: '加载中……'
        // })
        App.globalData.tarIndex = e.target.dataset.index
        this.setData({
            current: e.target.dataset.id,
            currentPage: e.target.dataset.index,
            prc: e.target.dataset.prc,
            type: e.target.dataset.type,
            activityStoreGood: [],
            storeGoodsPage: 1
        })
        this.getgoodsList(e.target.dataset.prc, 'click')

    },
    /**
     * 获取基本信息
     */
    getBasicInfo(resolve, reject, type = false) {

        eellyReqPromise({
            // service: api.getGoodsTitle
            service: api.getActivityArea
        }).then(res => {
            if (res.data.status == 200) {
                let {data} = res.data.retval
                this.setData({
                    basicInfo: data

                })
                let {currentPage} = this.data
                if (data.length > 0) {
                    let {prc, type} = data[currentPage]
                    this.getgoodsList(prc, 'click')
                    this.setData({
                        prc, type
                    })
                }else {
                  wx.hideLoading()
                }

                resolve && resolve('getBasicInfo')
            } else {
                wx.hideLoading()
                wx.showToast({
                    title: res.data.info || '网络异常',
                    icon: 'none'
                })
            }
        }).catch(err => {
            wx.hideLoading()
            reject && reject(err)
        })
    },
    /**
     * 获取商品分类
     * @param type
     */
    getgoodsList(prc, from = '') {
        let {goodLists, currentPage, storeGoodsPage} = this.data;
        let currentPageHeight = 0

        this.setData({
            ispadding: true
        })
        if (from === 'bottom') {
            this.setData({
                isloading: true
            })
        }

        eellyReqPromise({
            service: api.getGoodsList,
            method: 'post',
            args: {
                searchParams: {prc},
                page: storeGoodsPage
            },

        }).then(res => {
            if (res.data.status == 200) {
                let resData = res.data.retval.data 
                if (resData.length > 0) {
                    resData.map(function(item) {
                        let {originalPrice, specialPrice} = item
                        let sparePrice = subtract(originalPrice, specialPrice)  
                        item.sparePrice = fillZero(sparePrice) 
                        return item;
                    })
                }
                if (from === 'click') {
                    goodLists[currentPage] = resData;
                } else if (from === 'bottom') {
                    if (from === 'bottom') {
                        this.setData({
                            isloading: false
                        })
                    }
                    goodLists[currentPage] = [...goodLists[currentPage], ...resData];
                } else {
                    goodLists[currentPage] = [...goodLists[currentPage], ...resData];
                }

                wx.hideLoading()
                this.setData({
                    goodLists: goodLists,
                    ispadding: false,
                    currentPageHeight
                })

                // resolve&&resolve()
            } else {
                wx.showToast({
                    title: res.data.info || '网络异常',
                    icon: 'none'
                })
            }
        }).catch(err => {
          wx.hideLoading()
        })
        // this.getPriceAreaActivityStoreGoods(type)
    },

    /**
     * 上拉触发页面加载
     */
    onReachBottom() {
        let {type, storeGoodsPage, prc} = this.data;
        this.setData({
            storeGoodsPage: ++storeGoodsPage
        })
        this.getgoodsList(prc, 'bottom')

    },
    /**
     * 下拉刷新
     */
    onPullDownRefresh() {
        let p = c => new Promise((resolve, reject) => {
            c.call(this, resolve, reject)
        })
        this.setData({
            storeGoodsPage: 1,
            isRefresh: true
        })
        Promise.all([p(this.getBasicInfo)]).then(res => {
            wx.stopPullDownRefresh()
            this.setData({
              isRefresh: false
            })
        }).catch(err => {
            wx.stopPullDownRefresh()
          this.setData({
            isRefresh: false
          })
        })
    },

    /**
     * @Method getPriceAreaActivityStoreGoods
     * @param
     * @Description
     * @return
     * @author laitingyou
     * @CreateDate 2018/6/14 9:53
     */
    getPriceAreaActivityStoreGoods(type, storeGoodsPage = 1) {
        let {activityStoreGood} = this.data
        eellyReqPromise({
            service: api.getPriceAreaActivityStoreGoods,
            args: {
                type,
                page: storeGoodsPage,
                limit: 10
            }
        }).then(res => {
            if (res.data.status == 200) {
                this.setData({
                    activityStoreGood: [...activityStoreGood, ...res.data.retval.data]
                })
            } else {
                wx.showToast({
                    title: res.data.info || '网络异常',
                    icon: 'none'
                })
            }
        }).catch(err => {
            wx.showToast({
                title: err.info || '网络异常',
                icon: 'none'
            })
        })
    }
})