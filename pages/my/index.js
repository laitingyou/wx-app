const {
    getOrderAmount
} = require('../../utils/interface/order')
const {
    getHotSeller
} = require('../../utils/interface/my')
const api = require('../../utils/interface/home')
const { eellyReqPromise } = require("../../utils/eellyReq")
import { routerTo } from '../../utils/util'
import { getTitleArea } from '../../utils/interface/live'

const {getChanceStat} = require('../../utils/interface/getChance')
const {getAd} = require('../../utils/interface/ad')
const {adDataMap} = require('../../utils/adDataMap')

const App = getApp()
const { store } = App

const {
    getAccessToken,
    eellyLogin,
    eellyLoginBtn
} = App

Page({
    /**
     * 页面的初始数据
     */
    data: {
        // 没有登录时为true,用于判断显示头像和用户名
        noLogin: true,
        // 用户信息
        user: {},
        chanceStatData: null,
        // 订单数量，取得数据后变成一个对象
        orderAmount: null,
        // 按钮
        btn: [{
            icon: 'icon-zhibo1',
            url: '/pages/liveAd/index',
            text: '我要直播'
        }, {
            icon: 'icon-pintuan',
            url: '/pages/unitary/index',
            text: '一元福利'
        }, {
            icon: 'icon-service',
            text: '官方客服',
            type: 'contact'
        }, {
            icon: 'icon-dizhi1',
            url: '/other/pages/address/index',
            text: '收货地址'
        }],
        title: [],
        // 幻灯 
        adList: []
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        getAccessToken()
            .then((res)=>{
                this.getLiveData().then(res => {
                    this.processLiveData(res)
                })
                this.getTitle()
                this.getAdData()  //广告
            })
            .catch((error) => {
                let {info} = error
                wx.showToast({
                    title: info || '网络异常',
                    icon: 'none'
                })
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
        if (wx.getStorageSync('tokenKey')) {
            this._init()
        }
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
        
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {
        this._init()
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
    _init() {
        this.getUserData()
            .then(() => {
                // 取订单数
                this.getOrder()
                // 取领取数量
                this.getStatData()
                wx.stopPullDownRefresh() //取消下拉刷新
                wx.hideLoading()
            })
            .catch((error) => {
                wx.stopPullDownRefresh() //取消下拉刷新
                let {
                    type,
                    info
                } = error
                if (type != 'getUserStorage') {
                    wx.showToast({
                        title: info,
                        icon: 'none',
                        duration: 2500
                    })
                }
                wx.hideLoading()
                
            })
    },
    // 取广告数据
    getAdData(){
        eellyReqPromise({
            service: getAd,
            args: {
                condition: {
                    position: 4
                }
            }
        })
        .then((res) => {
            let { status, info, retval } = res.data            
            if (status == 200) {
                this.setData({
                    adList: adDataMap(retval.data) // 广告数据简化
                })
            }
        })
        .catch( ({info}) => {
            wx.showToast({
                title: info,
                icon: 'none'
            })
        })
    },
    clickBtn(e) {
        routerTo(e)
    },

    getUserData() {
        // 从缓存中取用户信息
        return this.getUserStorage()
        
    },
    /**
     * [getUserStorage 在缓存中找用户信息]
     */
    getUserStorage() {
        let that = this
        return new Promise((reslove, reject) => {
            wx.getStorage({
                key: 'user',
                success(res) {
                    let {
                        data
                    } = res
                    that.setData({
                        noLogin: false,
                        user: res.data
                    })
                    reslove('取得')
                },
                fail() {
                    reject({
                        type: 'getUserStorage',
                        info: '获取缓存信息失败'
                    })
                }
            })
        })
    },
    login(e) {
        wx.showLoading({
            title: '正在登录...'
        })
        eellyLoginBtn(e.detail).then(res => {
            this._init()
        }).catch(res => {
            wx.showToast({
                title: '登录失败',
                icon: 'none'
            })
        })
    },
    /**
     * [getStat 取"领取记录"的数据]
     */
    getStatData(){
        eellyReqPromise({
            service: getChanceStat,
            login: true
        })
        .then((res) => {
            let { status, info, retval } = res.data
            if (status == 200) {
                this.setData({
                    chanceStatData: retval.data
                })
            }
        })
        .catch( ({info}) => {
            wx.showToast({
                title: info,
                icon: 'none'
            })
        })
    },
    /**
     * [getOrder 取订单数量]
     */
    getOrder() {
        wx.showLoading({
            mask: true,
            title: '加载中'
        })
        eellyReqPromise({
                login: true,
                service: getOrderAmount
            })
            .then((res) => {
                let {
                    status,
                    info,
                    retval
                } = res.data
                if (status == 200) {
                    this.setData({
                        orderAmount: retval.data
                    })
                    wx.hideLoading()
                } else {
                    wx.showToast({
                        title: info || '网络异常',
                        icon: 'none',
                        duration: 2500
                    })
                }
            })
            .catch((error) => {
                let {
                    info
                } = error
                wx.showToast({
                    title: info || '网络异常',
                    icon: 'none',
                    duration: 2500
                })
            })
    },   
    // 处理"直播中"列表数据
    processLiveData(list = []) {
        let newList = []
        let advanceListToday = []
        for (let i = list.length - 1; i >= 0; i--) {
            let item = list[i]
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
                newList[i].different = true
                newList[i - 1].different = true
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
    getLiveData(type = 1) {
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
                    let {
                        status,
                        info = '网络异常',
                        retval
                    } = res.data
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
    getTitle() {
        eellyReqPromise({
                service: getTitleArea,
            })
            .then((res) => {
                let {
                    status,
                    info = '网络异常',
                    retval
                } = res.data
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
    adToHome(event){
        let {url} = event.currentTarget.dataset
        if (/^\/pages\/home\/index/.test(url)) {
            wx.setStorage({
                key: "homeAdUrl",
                data: url
            })
        }
    }
})
