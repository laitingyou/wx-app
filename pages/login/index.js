// pages/login/index.js
const App = getApp()
let {getAccessToken, eellyLoginBtn, tabBarList, store} = App
const {eellyReq} = require("../../utils/eellyReq")
const messagesService = require('../../utils/interface/messagesService')
const { sendFromId } = require('../../utils/formId')
Page({

    /**
     * 页面的初始数据
     */
    data: {

    },

    /**
     * 生命周期函数--监听页面加载
     */

    onLoad(options) { 
        wx.showLoading({
            mask: true,
            title: '加载中……'
        }) 
        getAccessToken()
            .then(()=>{
                wx.hideLoading()
            })
            .catch(()=>{
                wx.hideLoading()
            })

        let {emit = ''} = options        
        let {backUrl = ''} = options
        if (!backUrl) {
            let pagesArr = getCurrentPages()
            let leg = pagesArr.length
            if (leg>1) {
                let lastPage = pagesArr[leg -2 ]
                let {options} = lastPage
                let optionsKeys = Object.keys(options)
                backUrl = '/'+lastPage.route
                for (let i = optionsKeys.length - 1; i >= 0; i--) {
                    let item = optionsKeys[i]
                    let str = (i>0) ? '&' : '?';
                    backUrl += `${str}${item}=${options[item]}` 
                } 
            } else {
                backUrl = '/pages/home/index'
            }
            
        }
        this.setData({
            backUrl,
            emit
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
    // 返回上一页
    backPage(){
        let {backUrl} = this.data        
        let isTabBarList = tabBarList.findIndex(function(value) {
            return (backUrl.indexOf(value)>-1)  ;
        })
        
        if ( isTabBarList > 0 ) {         
            wx.switchTab({
                url: backUrl
            })
        } else {
            wx.navigateBack({
                delta: 1
            })
        }
    },
    login(event){
        wx.showLoading({
            mask: true,
            title: '正在登录……'
        })        
        let {
            rawData,
            signature,
            encryptedData,
            iv
        } = event.detail
        
        eellyLoginBtn({
            rawData,
            signature,
            encryptedData,
            iv
        })
            .then((res)=>{                
                wx.hideLoading()
                this.backPage()
                // App.store.emit('finish',true)                
                store.emit(this.data.emit)
                // 发formId给服务端
                eellyReq({
                    service: messagesService.addFormId,
                    args:{
                        formId: this.data.formId
                    }
                })
                // 给服务端发formId
                sendFromId(this.data.formId)                    
            })
            .catch((error)=>{
                let {info} = error
                wx.showToast({
                    title: info || '网络异常',
                    icon: 'none'
                })
            })
    },
    bindsubmit(e){ 
        this.setData({
            formId: e.detail.formId
        }) 
    }
})