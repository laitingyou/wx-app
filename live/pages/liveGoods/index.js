// pages/liveGoods/index.js
const {getLiveGoodsInfo} = require("../../../utils/interface/live");
const {eellyReq , eellyReqPromise} = require("../../../utils/eellyReq");
const App = getApp();
const {getAccessToken, eellyLogin} = App;
const {getAuth} = require("../../../utils/auth");
Page({

    /**
     * 页面的初始数据
     */
    data: {
        goodsList: [],
        store: {},
        live: {},
        countDownData: {},
        liveId: '',
        isShareHide:false,
        title:''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    
    onLoad: function (options) {
        let {liveId} = options;
        this.liveId = liveId
        this.setData({
            liveId
        })
        getAuth().then(res => {
            if(res){
                this.setData({
                    title:'直播预告'
                })
            }
            this.setData({
                isShareHide: res
            })
        }).catch(err => {

        })
        this.getGoodsData(liveId)
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        clearTimeout(this.timer)

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.getGoodsData(this.liveId)
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },


    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },
    getGoodsData(liveId) {
        clearTimeout(this.timer)
        let that = this;
        wx.showLoading({
            mask: true,
            title: '加载中'
        })
        this._init()
            .then((res)=>{
                let {status, info, retval} = res.data;
                if (status === 200) {
                    wx.hideLoading();
                    wx.stopPullDownRefresh();
                    let {goodsList, live, store} = retval.data;
                    that._getCountDown(live.scheduleTime)
                    goodsList.forEach((item) => {
                        let up = item.upperPrice, lp = item.price;
                        item.luPrice = up === lp ? lp : `${lp}-${up}`
                    });
                    store.image = live.image;
                    that.setData({goodsList, store, live});
                } else if (status != 707 || status != 708) {
                    wx.showToast({
                        title: info,
                        icon: 'none'
                    })
                }
            })
            .catch((error)=>{
                let {info} = error
                wx.showToast({
                    title: info,
                    icon: 'none'
                })
            })
        
    },
    _init(){
        return getAccessToken()
            .then((res)=>{
                return eellyReqPromise({
                        service: getLiveGoodsInfo,
                        args: {
                            liveId: this.data.liveId
                        }
                    })
            })
            
    },
    /*TODO 直播倒计时*/
    timer: null,
    _getCountDown(st) {
        let time = ((st * 1000) - new Date().getTime());
        time -= 1000;
        let days = parseInt(time / 1000 / 60 / 60 / 24, 10), //计算剩余的天数
            hours = parseInt(time / 1000 / 60 / 60 % 24, 10), //计算剩余的小时
            minutes = parseInt(time / 1000 / 60 % 60, 10),//计算剩余的分钟
            seconds = parseInt(time / 1000 % 60, 10);//计算剩余的秒数
        if (time <= 0) {
            clearTimeout(this.timer);
            wx.redirectTo({url: '/pages/liveDetails/index?liveId=' + this.liveId})
        }
        let countDownData = {
            days: days < 10 ? '0' + days : days,
            hours: hours < 10 ? '0' + hours : hours,
            minutes: minutes < 10 ? '0' + minutes : minutes,
            seconds: seconds < 10 ? '0' + seconds : seconds
        };
        this.setData({countDownData});
        this.timer = setTimeout(() => this._getCountDown(st), 1000)
    }
});