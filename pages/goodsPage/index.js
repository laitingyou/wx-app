const {eellyReqPromise, eellyReq} = require("../../utils/eellyReq")
const {getTokenKey} = require("../../utils/eellyGetTokenKey")
const App = getApp()
const {adDataMap} = require('../../utils/adDataMap')
const {eellyLogin, getAccessToken, eellyLoginBtn} = App
const {getAuth} = require("../../utils/auth")
import {getAppletChildCate, getAppletActivityStoreGoods, getAdvertising} from '../../utils/interface/goodsPage'

Page({
    data: {
        navName: '',
        wHeight: 0,
        msgShow: false,
        scrollable: true,
        goodLists: [[], [], [], []],
        basicInfo: [],
        ispadding: false,
        currentsPage: 0,
        currentsPageHeight: 400,
        type: 0,
        isShow: false,
        activityStoreGood: [],
        storeGoodsPage: 1,
        currents: 0,
        tabItem: [
            {
                title: '全部'
            },
            {
                title: '连衣裙'
            },
            {
                title: '牛仔短裤'
            },
            {
                title: '拖鞋'
            }
        ],
        topBtn: false,
        tabsWidth: 0,
        windowWidth: 0,
        scrollLeft: 0,
        imgUrls: [],
        navhidden: false,
        odst:0
    },
    onReady() {

    },

    getAdImages() {
        eellyReqPromise({
            service: getAdvertising,
            args: {
                condition: {
                    position: 2
                }
            }
        }).then(res => {
            let {status, retval} = res.data
            if (status === 200) {
                this.setData({
                    imgUrls:adDataMap(retval.data)
                })
            }
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
        this.getAdImages()
        this.setData({
            navName: parameter.cateName,
            odst: parameter.odst
        })
        // wx.showLoading({
        //   title: '加载中……'
        // })
        /*先获取tooken*/
        getAccessToken().then(res => {
            this.getBasicInfo(parameter.category || 289)

            // getAuth().then(_res=>{
            //   this.setData({
            //     isShow:_res
            //   })
            // }).catch(err=>{
            //
            // })
            /*获取商品分类*/
        }).catch(err => {
        })
    },
    onShow(parameter) {

    },

    /**
     * 滚动触发加载事件，
     * @param e
     */
    onPageScroll(e) {
        if (e.scrollTop > 700 * 2) {
            this.setData({
                topBtn: true
            })
        } else {
            this.setData({
                topBtn: false
            })
        }
    },
    /**
     * 滚到顶部
     */
    scrollToTop() {
        wx.pageScrollTo({
            scrollTop: 0,
            duration: 300
        })
    },


    /*点击商品分类*/
    getGoods(e) {
        let {offsetLeft} = e.currentTarget
        let {currents, id} = e.target.dataset
        let {tabsWidth, windowWidth} = this.data
        let offset = 0
        if (currents === this.data.currents) return
        this.setData({
            currents: currents,
            currentsPage: 0
        })
        this.scrollToTop()
        this.getPriceAreaActivityStoreGoods(id, 1, 'click')
        if (tabsWidth > windowWidth) {
            switch (true) {
                case offsetLeft > windowWidth / 2:
                    offset = offsetLeft - windowWidth / 2 + 30
                    break
                default:
                    offset = 0
            }
            this.setData({
                scrollLeft: offset
            })
        }
    },
    queryMultipleNodes() {
        let systemInfo = wx.getSystemInfoSync()
        let query = wx.createSelectorQuery()
        query.select('#tabs').boundingClientRect()
        query.selectViewport().scrollOffset()
        query.exec((res) => {
            this.setData({
                tabsWidth: res[0].width,
                windowWidth: systemInfo.windowWidth
            })
        })
    },
    /**
     * 获取子分类数据
     */
    getBasicInfo(category) {
        eellyReqPromise({
            service: getAppletChildCate,
            args: {
                category
            }
        }).then(res => {
            let {data} = res.data.retval
            this.setData({
                basicInfo: data
            })
            let {currentsPage, navhidden} = this.data
            let {listCat} = data
            if (listCat.length > 0) {
                this.getPriceAreaActivityStoreGoods(listCat[currentsPage].cateId)
                if(listCat.length>1){
                  this.queryMultipleNodes()
                }
            } else {
                wx.hideLoading()
            }
        }).catch(err => {
            wx.showToast({
                title: err.info,
                icon: 'none'
            })
            wx.hideLoading()
        })
    },


    /**
     * 上拉触发页面加载
     */
    onReachBottom() {
        let {currentsPage, storeGoodsPage, basicInfo, currents} = this.data;
        this.getPriceAreaActivityStoreGoods(basicInfo.listCat[currents].cateId, ++storeGoodsPage)
        this.setData({
            storeGoodsPage
        })
    },
    /**
     * 下拉刷新
     */
    onPullDownRefresh() {
        // let p=c=>new Promise((resolve,reject)=>{c.call(this,resolve,reject)})
        // this.setData({
        //   activityStoreGood:[]
        // })
        // Promise.all([p(this.getBasicInfo)]).then(res=>{
        //   wx.stopPullDownRefresh()
        // }).catch(err=>{
        //   wx.stopPullDownRefresh()
        // })
    },

    /**
     * @Method getPriceAreaActivityStoreGoods
     * @param
     * @Description
     * @return
     * @author laitingyou
     * @CreateDate 2018/6/14 9:53
     */
    getPriceAreaActivityStoreGoods(id, storeGoodsPage = 1, from) {
        wx.showLoading({
            title: '加载中……'
        })
        let {activityStoreGood, odst} = this.data
        eellyReqPromise({
            service: getAppletActivityStoreGoods,
            args: {

                searchParams: {
                    category: id,
                    odst
                },
                page: storeGoodsPage,
                limit: 20
            }
        }).then(res => {
            let {data} = res.data.retval
            this.setData({
                activityStoreGood: from === 'click' ? data : [...activityStoreGood, ...data]
            })
            wx.hideLoading()
            if (!data[0]) {
                wx.showToast({
                    title: '没有更多数据',
                    icon: 'none'
                })
            }
        }).catch(err => {
            wx.showToast({
                title: err.info,
                icon: 'none'
            })
        })
    }
})