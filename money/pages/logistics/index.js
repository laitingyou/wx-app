const { getLogisticsData } = require("../../../utils/interface/logistics")
const { eellyReqPromise } = require("../../../utils/eellyReq")

const App = getApp()
const { getAccessToken } = App

Page({

    /**
     * 页面的初始数据
     */
    data: {
      list:[]
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        let {orderId, type} = options
        this.setData({
          orderId,
            type
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
        wx.showLoading({
            mask: true,
            title: '加载中……'
        })
        this._init()
            .then((res)=>{
                let { status, info, retval } = res.data
                if (status == 200) {
                    this.setData({
                       ...retval.data 
                    })
                    wx.hideLoading()
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
    _init(){        
        return getAccessToken()
            .then(()=>{
                return this.getLogistics()
            })
    },
    /**
     * [getLogistics 取物流信息]
     * @return {[type]}         [description]
     */
    getLogistics(){
        let {orderId, type} = this.data
        return eellyReqPromise({
            login: true,
            service: getLogisticsData,
            args: {
               orderId,
               type 
            }
        })
    },
    /**
     * [copyNumber 复制运单号]
     * @return {[type]} [description]
     */
    copyNumber() {
        let {number} = this.data
        wx.setClipboardData({
            data: number,
            success(res) {
                wx.showToast({
                    title: '复制成功',
                    icon: 'success'
                })
            },
            fail() {
                wx.showToast({
                    title: '复制失败',
                    icon: 'none'
                })
            }
        })
    },
    /**
     * [callPhone 拔打电话]
     */
    callPhone() {
        let {tel} = this.data
        wx.makePhoneCall({
            phoneNumber: tel,
            fail() {
                wx.showToast({
                    title: '拔号失败',
                    icon: 'none',
                    duration: 2500
                })
            }
        })
    }
})