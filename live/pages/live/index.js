const { getProgressList, getPendingList } = require("../../../utils/interface/live")
const { addSubscribe } = require('../../../utils/interface/live')

const { eellyReqPromise } = require("../../../utils/eellyReq")
const App = getApp()
const { getAccessToken, eellyLogin, store } = App

Page({
    /**
     * 页面的初始数据
     */
    data: {
        animationName: '',
        // 页面距滚动到底部多少时加载数据
        lowerThreshold: 320,
        // 列表是否最后一页
        progressListEnd: false,
        pendingListEnd: false,
        // 列表数据
        progressList: [],
        pendingList: [],
        // 列表当前页码
        progressPage: 0,
        pendingPage: 0,
        // 列表请求中
        progressLoading: false,
        pendingLoading: false
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        let that = this
        // 取视口高度
        this.getWondowHeight()

        this._init()
        
        store.on('live_init', this, function(liveId) {
            this._init() // 重新最列表数据以防"订阅"过的直播按钮还是'未订阅'状态
        })
        
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {
        store.remove('live_init')
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {
        this.setData({
            animationName: 'fadeOut'
        })
        // 有token后请求“直播中”和“直播预告”列表数据
        getAccessToken()
            .then(() => {
                Promise.all([this.getProgressListFun(true), this.getPendingListFun(true)])
                    .then(([resProgressData, resPendingData]) => {
                        wx.stopPullDownRefresh()
                        this.setData({
                            animationName: 'fadeIn'
                        })
                        wx.hideLoading()
                    }, ({ type, info }) => {
                        if (type == 'error') {
                            wx.stopPullDownRefresh()
                            this.setData({
                                animationName: 'fadeIn'
                            })
                            wx.showToast({
                                title: info || '网络异常',
                                icon: 'none'
                            })
                        }
                    })
            })
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    },
    pageScrollBottom: null,
    /**
     * 页面
     */
    onPageScroll({ scrollTop }) {
        let that = this
        clearTimeout(this.pageScrollBottom)
        this.pageScrollBottom = setTimeout(() => {
            wx.createSelectorQuery().select('#j-body').boundingClientRect(function (rect) {
                rect.height  // 节点的高度
            }).exec(function (res) {
                let bodyHeight = res[0].height
                let { windowHeight, lowerThreshold } = that.data

                if (scrollTop >= bodyHeight - windowHeight - lowerThreshold) {
                    that.addMore()
                }
            })
        }, 50)
    },
    /**
     * 直播中列表
     * @param  {boolean} reset [默认为false，为true时请求第一页并重置数据到一页]
     * @return {[type]}        [description]
     */
    getProgressListFun(reset = false) {
        return new Promise((resolve, reject) => {
            let that = this
            let { progressPage, progressListEnd, progressList, progressLoading } = this.data

            if (progressListEnd && !reset) {
                reject({ type: 'end', info: '没有了' })
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
                        let { status, info, retval } = res.data
                        if (status == 200) {
                            let { page: { totalPages }, items: listData } = retval.data

                            if (totalPages == progressPage || listData.length == 0) {
                                that.setData({
                                    progressListEnd: true
                                })
                            }
                            let newProgressList = reset ? listData : [...progressList, ...listData]
                            that.setData({
                                progressPage: progressPage,
                                progressList: newProgressList,
                            })
                            resolve(listData)
                        } else {
                            reject({ type: 'error', info })
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
            let { pendingPage, pendingListEnd, pendingList, pendingLoading } = this.data
            
            if (pendingListEnd && !reset) {
                reject({ type: 'end', info: '没有了' })
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
                        let { status, info, retval } = res.data
                        if (status == 200) {
                            let { page: { totalPages }, items: listData } = retval.data
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
                            reject({ type: 'error', info })
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
    _init(){
        wx.showLoading({
            mask: true,
            title: '加载中'
        })
        // 请求“直播中”和“直播预告”列表数据
        getAccessToken()
            .then(() => {
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
            .catch((error) => {
                let { info } = error
                wx.showToast({
                    title: info || '网络异常',
                    icon: 'none'
                })
            })
    },
    addMore() {
        let { progressListEnd, pendingListEnd } = this.data
        if (!progressListEnd) {
            this.getProgressListFun()
        } else if (!pendingListEnd) {
            this.getPendingListFun()
        }
    },
    // 读取视口高度，用于页面滚到底部加载新数据
    getWondowHeight() {
        let res = wx.getSystemInfoSync()
        this.setData({
            windowHeight: res.windowHeight
        })
    },    
    /**
     * [addSubscribe 订阅]
     * @param {[type]} liveId [description]
     */
    addSubscribe(liveId){
        wx.showLoading({
            mask: true,
            title: '加载中……'
        })
        eellyReqPromise({
            service: addSubscribe,
            args: { 'liveId': liveId },
            login: true
        })
            .then((res) => {
                wx.hideLoading()
                let { status, info, retval } = res.data
                if (status == 200 && retval) {                    
                    wx.showToast({
                        title: '订阅成功',
                        icon: 'success',
                        duration: 2500
                    })
                } else {
                    wx.showToast({
                        title: info,
                        icon: 'none',
                        duration: 2500
                    })
                }
            })
            .catch((error) => {
                wx.hideLoading()
                wx.showToast({
                    title: '网络异常',
                    icon: 'none',
                    duration: 2500
                })
            })
    }    
})