const { eellyReqPromise } = require("../../../utils/eellyReq")
const { editAddress } = require("../../../utils/interface/address.js")
const App = getApp()
const { getAccessToken, eellyLogin, store } = App

Page({

    /**
     * 页面的初始数据
     */
    data: {
        // 页面标题
        pageTitle: '',
        // 用于设置页面标题和判断这个页面是添加还是修改地址,
        // 地址Id ,如果有就所能标题改为“修改收货地址”，并保存的时候加上这个参数
        addrId: '',
        // 存放picker选择的省市区，如[广东省,广州市,越秀区]
        region: [],
        // 存当前要修改的收货地址, 跟据addrId从缓存时取
        currentAddress: {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        let {addrId = ''} = options
        this.setData({
            addrId
        })
        // 设置标题
        this.setTitle()

        /*wx.showLoading({
            mask: true,
            title: '加载中'
        })*/
        // 登录
        // this._init()
        eellyLogin()
        if (addrId) {
            this.getAddressFromStorage()
        }
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
    
    /**
     * [setTitle 设置页面标题]
     */
    setTitle(){
        let {addrId} = this.data
        let title = addrId ? '修改收货地址' : '添加收货地址'
        this.setData({
            pageTitle: title
        })
    },
    /**
     * [bindRegionChange picker组件调用，设置省市区数据]

     */
    bindRegionChange(events) {        
        this.setData({
            region: events.detail.value
        })
    },
    /**
     * [getAddressFromStorage 从缓存中]
     */
    getAddressFromStorage(){
        let that = this
        wx.getStorage({
            key: 'currentEditorAddress',
            success(res){
                let {data} = res
                let currentAddress = {
                    userName: data.userName, 
                    telNumber: data.telNumber, 
                    default: data.default
                }
                let detailArr = data.detailInfo.split(' ')
                //省市区
                let region = [ detailArr[0], detailArr[1], (detailArr[2] || '') ]
                currentAddress.detailInfo = detailArr.slice(3).join(' ') 
                // 重新设置表单数据
                that.setData({
                    currentAddress,
                    region
                })
            }
        })
    },
    /**
     * [afterSave 保存成功后的事件]
     */
    afterSave(){         
        wx.showToast({
            title: '保存成功',
            icon: 'success'
        })
        // 删除缓存中的地址
        wx.removeStorage({
            key: 'currentEditorAddress',
            complete(){
            // 返回上一页 
                wx.navigateBack(1)                
            }
        })
        store.emit('address_init')
    },
    // 修改收货地址
    /**
     * [changePayAddress 修改收货地址]
     * @param  {Objcet} addressData [修改的地址数据]
     * @param  {String} storageName [支付地址缓存名称]
     */
    changePayAddress(addressData, storageName){
        let payAddress = wx.getStorageSync(storageName)
        let {addrId} = addressData        
        if (payAddress && addrId == payAddress.addrId) {  
            let {provinceName, cityName, countyName} = addressData
            let detailInfo = `${provinceName} ${cityName} ${countyName}`
            let newPayAddress = {...addressData, detailInfo}
            delete newPayAddress.provinceName
            delete newPayAddress.cityName
            delete newPayAddress.countyName
            wx.setStorage({
                key: storageName,
                data: newPayAddress
            })
            wx.setStorage({
                key: 'changePayAddress',
                data: true
            })
        }
    },
    /**
     * [formSubmit 提交表单]
     */
    formSubmit(events){        
        // 表单数据
        let {value} = events.detail 
        // 表单校验
        let verify = this.verifyData(value)
        // 表单校验结束 
        let {error, data} = verify
        if (error) {
            wx.showToast({
                title: error,
                icon: 'none'
            })
        } else {
            wx.showLoading({
                title: '正在保存……',
                mask: true
            })            
            this.saveAddress(data)
                .then((res)=>{
                    // 如果存在"支付页收货地址"修改它
                    this.changePayAddress(res, 'payAddress')
                    // 保存后回填到地址列表页、做跳转等
                    this.afterSave()
                })
                .catch((error)=>{
                    let {type, info} = error
                    wx.showToast({
                        title: info,
                        icon: 'none'
                    })
                })
        }
    },
    /**
     * [verifyData 表单数据校验]
     * @param  {Objcet} valeu  [表单数据]
     * @return {Objcet} report [校验结束]
     * @return {Boolean} report.valid [通过为true]
     * @return {String} report.error  [错误信息]
     * @return {Objcet} report.data   [校验通过后的数据 ]
     */
    verifyData(value){
        let {detailInfo, telNumber, userName} = value
        let report = {
            valid: true,
            error: '',
            data: {}
        } 
        let arr  = Object.keys(value)
        let {region} = this.data
        // 错误提示文字
        let labeText = {
            detailInfo: '请填写详细地址',
            telNumber: '请填写正确的手机号码',
            userName: '请填写收件人姓名',
            region: '请选择地区'
        }
        
        // 判断是否为空
        for (let i = 0; i < arr.length; i++) {
            let item = arr[i]
            if (!value[item]) {
                report.error = labeText[item]
                report.valid = false
                return report
            }
        }
        // 手机号判断
        if (!/^1[0-9]{10}$/.test(telNumber)  ) {
            report.error = labeText.telNumber
            report.valid = false 
            return report
        }        
        // 判断选择城市
        if (region.length<3) {
            report.error = labeText.region
            report.valid = false 
            return report
        }
        let provinceName = region[0]
        let cityName = region[1]
        let countyName = region[2]
        report.data = { 
            ...value, 
            provinceName, 
            cityName, 
            countyName, 
            default: 0 
        }
        return report
    },
    /**
     * [saveAddress 保存地址ajax方法]
     * @param  {Object} formData [要提交的参数]
     * @return {function}        [Promise方法]
     */
    saveAddress(formData){
        let {addrId} = this.data
        let ajaxArgs = {...formData}
        if (addrId) {
            ajaxArgs.addrId = addrId
        }
        return new Promise((resolve, reject)=>{
            eellyReqPromise({
                login: true,
                service: editAddress, 
                args: {
                    data: ajaxArgs
                }
            })
            .then((res)=>{
                let { status, info, retval } = res.data
                if (status == 200) {
                    let retvalData = retval.data
                    // let addrId = addrId || retvalData.addrId   
                    let {regionId} = retvalData                
                    resolve({...ajaxArgs, regionId})
                } else {
                    reject({
                        type: 'saveAddress',
                        info: info || '网络异常'
                    })
                }
            })
            .catch((error)=>{
                reject(error)
            })
        })
    }
})