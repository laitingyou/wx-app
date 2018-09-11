// 以上数据相当于ajax地址
const {
    setMinDefaultAddress,
    delAddress,
    editAddress,
    addressList
} = require("../../../utils/interface/address.js")

// 用Promise封装好的ajax方法，会自动处理登录过期
const { eellyReqPromise } = require("../../../utils/eellyReq")

const App = getApp()
const { getAccessToken, eellyLogin, store} = App

Page({

    /**
     * 页面的初始数据
     */
    data: {
        // 标题
        pageTitle: '收货地址',
        // 收货地址列表
        list: [],
        // 当前选择的地址，参数type = choose 时使用 
        currentAddrId: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        /*
        type 类型：
            choose 地址选择
            addAddress 添加地址
         */
        let {type = '', addrId = ''} = options
        if (type == 'choose') {
            this.setData({
                pageTitle: '选择收货地址'
            })
        }
        this.setData({
            type,
            currentAddrId: addrId
        })
        store.on('address_init', this, function() {
           this._init()
        })
        eellyLogin('address_init')
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
       // this._init()         
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
        store.remove('address_init', this)
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
     * [_init 运行getAddressList方法]
     */
    _init(){
        wx.showLoading({
            mask: true,
            title: '加载中……'
        })
        eellyReqPromise({
            login: true,
            service: addressList
        })
            .then((res)=>{
                let { status, info, retval } = res.data
                if (status == 200) {
                    this.setData({
                        list: retval.data
                    })
                    wx.hideLoading()
                } else {
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
     * [getAddressList 取收货地址]
     * @return {} [description]
     */
    /*getAddressList(){
        return eellyLogin()
            .then(()=>{ 
                return eellyReqPromise({
                    login: true,
                    service: addressList
                })
            })
    },*/
    /**
     * [setDefaultAddress 默认地址改变触发的方法]
     */
    setDefaultAddress(event){
        wx.showLoading({
            mask: true,
            title: '设置中……'
        })
        let {value} = event.detail
        eellyReqPromise({
            login: true,
            service: setMinDefaultAddress,
            args: {
                addrId: value
            }
        })
            .then((res)=>{
                let { status, info, retval } = res.data
                if (status == 200) {
                    wx.hideLoading()
                } else if(status != 707 || status != 708) {
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
     * [delDataListAddress 当"删除收货地址"后，
     * 用此方法删Page data中的数据]
     * @param  {String} addrId [地址的Id]
     */
    delDataListAddress(addrId){
        let {list} = this.data
        let newList = list.filter(function(item){
            return (item.addrId != addrId)
        })
        this.setData({
            list: newList
        })
    },
    // 点击删除按钮
    bindDelAddress(event){
        let addrId = event.currentTarget.dataset.id
        let that = this
        wx.showModal({
            title: '确定要删除该收货地址？',
            success: function(res) {
                if (res.confirm) {
                    that.delAddress(addrId)
                } 
            }
        })
    },    
    /**
     * [delAddress 删除收货地址]
     * @param  {String} addrId [地址ID]
     */
    delAddress(addrId){
        wx.showLoading({
            mask: true,
            title: '设置中……'
        })        
        eellyReqPromise({
            login: true,
            service: delAddress,
            args: {
                addrId
            }
        })
            .then((res)=>{
                let { status, info, retval } = res.data
                if (status == 200) {
                    this.delDataListAddress(addrId) //删除界面中的收货地址
                    this.isDelPayAddress(addrId) //判断是否删除的地址否是为支付地址
                    wx.showToast({
                        title: '已删除',
                        icon: 'success'
                    })
                } else {
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
     * [isDelPayAddress 判断是否删除的地址否是为支付地址，
     * 如是则加缓存changePayAddress，
     * 删除缓存地址payAddress]
     * @param  {Number}  addrId [description]
     * @return {Boolean}        [description]
     */
    isDelPayAddress(addrId){
        // wx.setStorage
        wx.getStorage({
            key: 'payAddress',
            success(res){
                let payAddress = res.data
                if (addrId == payAddress.addrId) {
                    // 删除缓存中的支付地址
                    wx.removeStorageSync('payAddress')
                    // 给支付页面判断
                    wx.setStorageSync('changePayAddress', true)    
                }                
            }
        })
        
    },
    /**
     * [saveAddressStorage 把要修改的地址信息保存到缓存给“修改”页面使用]
     * @param  {String} addrId [地址的Id，用于筛选出收货地址]
     */
    saveAddressStorage(event){
        let addrId = event.currentTarget.dataset.id
        let {list} = this.data
        // 根据addrId筛选出要修改的数据
        let newList = list.filter(function(item){
            return (item.addrId == addrId)
        })
        // 将要修改数据传入缓存供修改页面使用
        wx.setStorage({
            key: 'currentEditorAddress',
            data: newList[0],
            success(){
                wx.navigateTo({
                    url: `../addAddress/index?type=edit&addrId=${addrId}`,
                })
            },
            fail(){
                wx.showToast({
                    title: '设置缓存错误',
                    icon: 'none'
                })
            }
        })
    },
    /**
     * [addAddress 保存地址ajax方法]
     * @param  {Object} formData [要提交的参数]
     * @return {function}        [Promise方法]
     */
    addAddress(formData){        
        return new Promise((resolve, reject)=>{
            eellyReqPromise({
                login: true,
                service: editAddress, 
                args: {
                    data: formData
                }
            })
            .then((res)=>{
                let { status, info, retval } = res.data
                if (status == 200) {
                    resolve({
                        ...formData,
                        ...retval.data
                    })
                } else {
                    reject({
                        type: 'addAddress',
                        info: info || '网络异常'
                    })
                }
            })
            .catch((error)=>{
                reject(error)
            })
        })
    },
    /**
     * [changeList 用于添加和修改收货地址后把数回填到列表中]
     * @param  {Ojbect} addressData [要回填的数据]
     */
    changeList(addressData){
        let {list} = this.data
        let {addrId} = addressData
        let isAdd = true
        for (let i = list.length - 1; i >= 0; i--) {
            let item = list[i]
            if (item.addrId == addrId) {
                isAdd = false
                list[i] = addressData
                break
            }
        }
        // 如果是添加地址，在数组顶部添加
        if (isAdd) {
            list.unshift(addressData)
        }
        this.setData({list})
    },
    /**
     * [addAddressFormWx 从微信添加收货地址]
     */
    addAddressFormWx(){
        let that = this
        wx.chooseAddress({
            success(res){
                let {
                    userName,
                    telNumber,
                    provinceName,
                    cityName,
                    countyName,
                    detailInfo
                } = res
                wx.showLoading({
                    mask: true,
                    title: '设置中……'
                })
                // 添加地址
                that.addAddress({
                    userName,
                    telNumber,
                    provinceName,
                    cityName,
                    countyName,
                    detailInfo,
                    default: 0
                })
                .then((res)=>{
                    let {
                        provinceName,
                        cityName,
                        countyName,
                        detailInfo
                    } = res
                    res.detailInfo = `${provinceName} ${cityName} ${countyName} ${detailInfo}`
                    delete res.provinceName
                    delete res.cityName
                    delete res.countyName
                    that.changeList(res)
                    wx.hideLoading()
                })
                .catch((error)=>{
                    let {info} = error
                    wx.showToast({
                        title: info,
                        icon: 'none'
                    })
                })
            }
        })
    },
    /**
     * [chooseAddress 支付页面来的选择收货地址]
     */
    chooseAddress(event){
        let {id} = event.currentTarget.dataset
        let {list, type} = this.data
        if (type == 'choose') {
            let address = list.filter(function(item) {
                return (item.addrId == id);
            });            
            wx.setStorage({
                key: 'payAddress',
                data: {
                    ...address[0]
                },
                success(){
                    // 给支付页面判断
                    wx.setStorageSync('changePayAddress', true)                    
                    // 返回支付页面，从栈中返回
                    wx.navigateBack(1)                   
                }
            })    
        }
    }
})