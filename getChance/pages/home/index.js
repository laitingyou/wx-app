const { eellyReqPromise } = require("../../../utils/eellyReq")
const {format} = require('../../../utils/util')
const {getChanceStat, getChanceList} = require('../../../utils/interface/getChance')

const app = getApp()
const {getAccessToken} = app

Page({
    /**
     * 页面的初始数据
     */
    data: {
        // 当前选择卡
        currentTab: 0,
        // 领取信息
        statData: null,
        // 领取列表请求参数
        listArg: {
            page: 1, 
            limit: 10
        },
        // 领取列表数据
        listData: [],
        // 列表是否加载中
        isListLoading: false,
        // 
        isNotList: false,
        // 页面距滚动到底部多少时加载数据
        lowerThreshold: 320,
        modelHidden: true
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        getAccessToken()
            .then((res)=>{
                if (wx.getStorageSync('tokenKey')) {
                    this._init()
                } else {
                    this.setData({
                        showBindInit: true
                    })
                    wx.navigateTo({
                        url: '/pages/login/index'
                    })
                }
            })
            .catch((error) => {
                let {info} = error
                wx.showToast({
                    title: info,
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
        if (this.data.showBindInit) {
            this._init()
            this.setData({
                showBindInit: false
            })
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
    /**
     * [changeTab 选项卡]
     */
    changeTab(event){
        let {tab: currentTab} = event.currentTarget.dataset
        currentTab *= 1
        this.setData({
            currentTab
        })
    },
    _init(){
        this.getStatData()
        this.getList(this.data.listArg)
    },
    /**
     * [getStat 取统计数据]
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
                    statData: retval.data
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
     * [getList description]
     * @param  {number} options.page  [页码]
     * @param  {number} options.limit [每页条数]
     */
    getList(options){
        let {listArg, isNotList, isListLoading} = this.data
        let args = {}
        // 没有数据了，或正在请求中，
        if (isNotList || isListLoading) {
            return false
        }
        if (options) {
            args = options
        } else {
            let {page, limit} = listArg
            args = {
                page: page + 1,
                limit
            }
        }
        this.setData({
            isListLoading: true
        })
        eellyReqPromise({
            login: true,   
            service: getChanceList,
            args
        })
        .then((res) => {
            let { status, info, retval: {data = []} } = res.data
            if (status == 200) {
                if (data.length > 0 ) {
                    data.map(function(item) {
                        item.createdTime = format(item.createdTime * 1000, 'yyyy-MM-dd hh:mm:ss')
                        return item
                    })
                    this.setData({
                        listData: data,
                        listArg: args,
                        isListLoading: false
                    })    
                } else {
                    this.setData({
                        isNotList: true,
                        isListLoading: false
                    })
                }
            }
        })
        .catch( ({info}) => {
            wx.showToast({
                title: info,
                icon: 'none'
            })
            this.setData({
                isListLoading: false
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
    
    /*触底加载*/
    onReachBottom(){
        that.getList()
    },
    onOpenRule(){
        this.setData({
          modelHidden: false
        })
    },
    onCloseRule(){
        this.setData({
          modelHidden: true
        })
    },
})