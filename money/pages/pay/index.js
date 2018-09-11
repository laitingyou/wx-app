const { getPayData, getFreight, getCoupon } = require('../../../utils/interface/pay')
const { getDefaultAddress } = require('../../../utils/interface/address')

const { eellyReqPromise } = require("../../../utils/eellyReq")

const { add, subtract, multiply } = require("../../../utils/floatNumber")
const utils = require("../../../utils/util")

// 调用微信登录和取用户信息
const {loginAndGetUser} = require("../../../utils/loginAndGetUser")
// 衣联登录
const eellyGetTokenKey = require("../../../utils/eellyGetTokenKey")

const {createEellyPay, eellyPay} = require("../../../utils/eellyPay")

const App = getApp()
const {getAccessToken, eellyLoginBtn, store, navigatorVersion} = App

Page({
    /**
     * 页面的初始数据
     */
    data: {
        // 当前订单的支付，放弃支付后再次支付要使用到orderSns
        // 修改商品数量时清空，
        orderSns: [],
        // 订单生成时间
        orderTime: 0,
        // "活动"订单为1，非“活动”订单为0
        spelling: 0,
        // 显示再次支付框
        showAgainPay: false,
        // 是否正在
        inPaying: false,
        // 支付按钮文件
        payBtnText: '立即支付',
        // 是否显示“店铺优惠弹框”
        showDiscounts: false,
        // 是否显示“配送弹框”
        expressageListShow: false,
        // 配送地址
        address: null,
        // 买家留言
        remark: '',
        // 商品数据
        payGoodsData: [],
        // 配送方式列表
        freightList: [],
        // 优惠券列表
        couponList: [],
        // 当前运费
        currentFreight: 0,
        // 当前选择的"快递"(下标)提交订单时使用
        freightIndex: null,
        // 当前重量
        currentWeight: null,
        // 当前优惠券
        currentCoupon: 0,
        // 当前的优惠券Id
        currentCouponId: null,
        // 当前的优惠券序号
        currentCouponNo: null,
        // 商品价格（不含运费和优惠券）
        goodsPrice: 0,
        // 订单总价
        totalPrice: 0,        
        // 如果来自其他小程序记录他的appId用于跳到回去
        wxAppId: null,
        // 跳到其他小程序的version属性
        navigatorVersion,
        // 返回来源小程序要传的参数
        backAppData: {},
        // 页面左上角是否有返回按钮(从其他小程序跳过来的没有)
        hasback: false,
        // 返回来源小程序的路径
        backAppPath: '',
        // 显示返回来源小程序的弹框
        showBackAppBox: false,
        showLoginBox: false
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        let {goodsId, orderSns} = options
        // 有referrerInfo且没有goodsId，那就表示从其他小程序跳过来的。 
        let {referrerInfo} = getApp()
        if (referrerInfo && !goodsId) {
            let {extraData} = referrerInfo            
            goodsId = extraData.goodsId
            let {fromFlag = ''} = extraData
            this.extraData = extraData
            this.setData({
                wxAppId: referrerInfo.appId,
                fromFlag,
                backAppData: {
                    goodsId
                }
            })
            wx.setStorageSync('payGoods', extraData) //把购买信息记到缓存
        } else {
            this.setData({
                hasback: true
            })
        }
        let orderSnsArr = !!orderSns ? [orderSns] : []
        this.setData({            
            goodsId,
            orderSns: orderSnsArr
        })      
        
        // paySucceed 缓存数据用于“页面卸载”时判断是否已支付成功
        wx.removeStorage({
            key: 'paySucceed'
        })

        let tokenKey = wx.getStorageSync('tokenKey') //衣联登录凭证
        // 先取AccessToken再做其他事情
        wx.showLoading({
            mask: true,
            title: '加载中……'
        })
        getAccessToken()
            .then(()=>{
                if (!tokenKey) {
                    // 没有登录的时候试试用wx.getUserInfo能不能取到数据来登录
                    this.payLogin()
                        .then((res)=>{
                            this._init()
                        })
                        .catch((error)=>{
                            if (error.type === 'getUserInfo') {
                                this.setData({
                                    showLoginBox: true
                                })
                                wx.hideLoading()
                            } else {
                                wx.showToast({
                                    title: error.info || '网络异常',
                                    icon: 'none'
                                })
                            }
                        })
                }else{
                    this._init()
                }
            })
            .catch((error)=>{
                wx.showToast({
                    title: error.info,
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
        if(wx.getStorageSync('changePayAddress')) {
            this._init()
            wx.removeStorage({
                key: 'changePayAddress'
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
        let {goodsId, orderSns} = this.data 
        // 如果是从其他小程序来的就不弹框
        if (this.data.hasback) {
            this.leavePayPage({goodsId, orderSns})
        }        
        store.remove('pay_init', this)
    },
    // 直接取用户信息进行登录
    payLogin(){
        return loginAndGetUser()
            .then((wxUserInfo)=>{
                return eellyGetTokenKey(wxUserInfo)
            }) 
    },
    buttonLogin(event){
        let {
            rawData,
            signature,
            encryptedData,
            iv
        } = event.detail
        wx.showLoading({
            mask: true,
            title: '加载中...'
        });
        eellyLoginBtn({
            rawData,
            signature,
            encryptedData,
            iv
        })
        .then((res)=>{ 
            wx.hideLoading()   
            this.setData({
                showLoginBox: false
            })               
            this._init();
        })
        .catch((error)=>{
            wx.showToast({
                title: '网络异常',
                icon: 'none'
            })
        })
    },
    closeGetUserInfoBox(){
        let self = this
        wx.getStorage({
            key: 'tokenKey',
            success(res) {                
                if (res.data) {
                    self.setData({
                        showLoginBox: false
                    })
                }
            } 
        })
    },
    /**
     * [leavePayPage 离开页面时做判断]
     * @param  {String} options.goodsId   []
     * @param  {Array}  options.orderSns  []
     */
    leavePayPage({goodsId, orderSns}){
        if (!wx.getStorageSync('paySucceed')) {
            wx.showModal({
                title: '您确定放弃付款吗？',
                confirmText: '继续支付',
                cancelText: '暂时放弃',
                success(res) {
                    if (res.confirm) {   
                        let url = `/money/pages/pay/index?goodsId=${goodsId}` 
                        if (orderSns.length > 0) {
                            url += `&orderSns=${orderSns[0]}`
                        }               
                        wx.navigateTo({
                            url,
                            success(){
                                wx.removeStorage({
                                    key: 'paySucceed'
                                })
                            }
                        })
                    } else {
                        wx.removeStorage({
                            key: 'payAddress'
                        })
                    }
                }
            })    
        }
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
     * [getGoodsDataFormStorage 从缓存中取商品数据]
     * @return {Function}        [Promise]
     */
    getGoodsDataFormStorage(){        
        return new Promise((resolve, reject)=>{     
            wx.getStorage({
                key: 'payGoods',
                success(res){
                    resolve(res.data)               
                },
                fail(){
                    reject({
                        type: 'getGoodsDataFormStorage',
                        info: '找不到下单信息'
                    })
                }   
            })
        })
    },
    /**
     * [getDefaultAddress 取默认地址]
     */
    getDefaultAddress(){        
        return new Promise((resolve, reject)=>{
            let payAddress = wx.getStorageSync('payAddress')
            // 如果缓存中没有收货地址，发起ajax请求
            if (payAddress) {
                resolve(payAddress)
            } else {
                eellyReqPromise({
                    login: true,
                    service: getDefaultAddress
                })
                    .then((res)=>{
                        let {status, info, retval} = res.data
                        if (status == 200) {
                            wx.setStorage({
                                key: 'payAddress',
                                data: retval.data,
                                success(){
                                    resolve(retval.data)
                                },
                                fail(){
                                    reject({
                                        type: 'getDefaultAddress',
                                        info: '缓存设置异常'
                                    })
                                }
                            })                            
                        } else {
                            reject({
                                type: 'getDefaultAddress',
                                info: info || '网络异常'
                            })
                        }
                    })
                    .catch((error)=>{
                        reject(error)
                    })
            }
        })
    },    
    /**
     * [getGoods 商品信息]
     * @param  {Array} args      [参数]
     * @return {Function}        [Prmise]
     */
    getGoods(args){
        let {spelling} = args
        args.spelling = (spelling == 2) ? 0 : spelling
        return new Promise((resolve, reject)=>{            
            eellyReqPromise({
                login: true,
                service: getPayData,
                args
            })
                .then((res)=>{
                    let { status, info, retval } = res.data
                    if (status == 200) {
                        let {data} = retval
                        // 取出商品的
                        // let goodsPrice = data[0].goodsInfo[0].totalPrice
                        var goodsPrice = 0
                        // 取出priceData，用于计算价格
                        for (var i = data.length -1; i >= 0; i--) {
                            let item = data[i]
                            let {goodsInfo} = item 
                            for (var j = goodsInfo.length -1 ; j >= 0; j--) {
                                let innerItem = goodsInfo[j]
                                // goodsPrice += innerItem.totalPrice*1
                                goodsPrice = add(goodsPrice, innerItem.totalPrice*1)
                                let {priceData, priceDetail} = innerItem.priceData
                                var newLowerLimit = 0                                
                                if (!priceDetail) {
                                    for (let k = priceData.length - 1; k >= 0; k--) {                                        
                                        let lowerLimit = priceData[k].lowerLimit * 1
                                        if (newLowerLimit <= 0 || lowerLimit < newLowerLimit) {
                                            newLowerLimit = lowerLimit
                                        } 
                                    }
                                }
                                
                                data[i].goodsInfo[j].lowerLimit = newLowerLimit
                            }
                        }
                        this.setData({
                            payGoodsData: data, 
                            goodsPrice
                        })
                        resolve(retval)
                    } else if(status != 707 || status != 708) {
                        reject({
                            type: 'getGoods',
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
     * [initGoodData 初始化页时使用，得收货地址和商品规格等]
     * @return {Funciton} [Promise]
     */
    initData(){
        return new Promise((resolve, reject)=>{
            Promise.all([
                this.getGoodsDataFormStorage(),
                this.getDefaultAddress()
            ])
                .then((result)=>{                    
                    let {goodsId} = this.data
                    let [pageGoods, payAddress] = result                    
                    this.setData({
                        address: payAddress
                    })                    
                    if (goodsId == pageGoods.goodsId) {                        
                        resolve({
                            ...pageGoods
                        })
                    } else {                        
                        reject({
                            type: 'getPayGoodsStroage',
                            info: '缓存异常'
                        })
                    }
                })
                .catch((error)=>{                    
                    reject(error)
                })
        })
        
    },
    /**
     * [_initPromise 初始化]
     */
    _initPromise(){        
        return this.initData()
            .then((res)=>{                 
                let {goodsId, quantity, specId, spelling, isLive = 0, liveId = '' } = res
                let args = {
                    isLive,
                    spelling,
                    data: [{
                       goodsId, quantity, specId 
                    }]
                }
                this.setData({
                    spelling,
                    liveId
                })
                return this.getGoods(args)                
            })
            .then(()=>{
                return Promise.all([ 
                    this.getFreightList(),
                    this.getCouponList()
                ])
            })
    },
    _init(){
        this._initPromise()
            .then((res)=>{                
                wx.hideLoading()  
                // 计算总价格
                this.calculateMoney()
                // 判断“商品数量”是否正确
                this.quantityError()              
            })
            .catch((error)=>{
                let {type, info} = error
                // 取优惠券接口异常时也算一下总价
                if (type == 'getCouponList' || type == 'getFreightList') {
                    wx.hideLoading()  
                    // 计算总价格
                    this.calculateMoney()
                    // 判断“商品数量”是否正确
                    this.quantityError() 
                } else {
                    wx.showToast({
                        title: info,
                        icon: 'none'
                    })    
                }
                
            })
    },
    /**
     * [freightList 配送方式列表]     
     */
    getFreightList(){
        return new Promise((resolve, reject)=>{
            let { 
                goodsId, 
                payGoodsData,                          
                address: {
                    regionId
                }
            } = this.data
            if (regionId) {
                let quantity = payGoodsData[0].goodsInfo[0].goodsNumber
                eellyReqPromise({
                    service: getFreight,                
                    args: {
                        data: [{
                            goodsId,
                            quantity
                        }],
                        regionId
                    }
                })
                    .then((res)=>{
                        let { status, info, retval } = res.data
                        if (status == 200) {
                            let {data} = retval
                            if (data.length>0) {
                                this.setData({
                                    freightList: data,
                                    freightIndex: 0,
                                    currentFreight: data[0].freight*1,                                
                                    currentWeight: data[0].weight*1,
                                })    
                            }
                            //计算运费，修复取“优惠券”失败而取“配送方式”总价不对的bug
                            this.calculateMoney() 
                            resolve(retval.data)
                        } else if(status != 707 || status != 708) {
                            this.setData({
                                freightList: [],
                                freightIndex: null,
                                currentFreight: 0,                                
                                currentWeight: null
                            })
                            reject({
                                type: 'getCreightList',
                                info: info || '网络异常'
                            })                        
                        }
                    })
                    .catch((error)=>{
                        let {info} = error
                        reject({
                            type: 'getFreightList',
                            info
                        })
                    })    
            } else {
                reject({
                    type: 'getFreightList',
                    info: '请添加收货地址'
                })
                wx.showToast({
                    title: '请添加收货地址',
                    icon: 'none'
                })
            }
            
        })
    },
    /**
     * [getCouponList 取优惠券]
     * @return {Funciton} [Promise]
     */
    getCouponList(){
        return new Promise((resolve, reject)=>{
            let {payGoodsData, goodsPrice} = this.data
            let {storeId} = payGoodsData[0]
            eellyReqPromise({
                login: true,
                service: getCoupon,
                args: {
                    storeId,
                    money: goodsPrice
                }
            })
                .then((res)=>{
                    let { status, info, retval } = res.data
                    if (status == 200) {
                        let couponList = retval.data                        
                        let currentCouponId = ''
                        let obj = {}                        
                        for (let i = couponList.length - 1; i >= 0; i--) {
                            let item = couponList[i]
                            let {couponValue, couponId, endTime, couponNo } = couponList[i]
                            endTime *= 1
                            if ('couponValue' in obj) {
                                if (couponValue > obj.couponValue) {
                                    obj = {couponValue, couponId, endTime, couponNo}
                                }else if(couponValue == obj.couponValue && endTime > obj.endTime){
                                    obj = {couponValue, couponId, endTime, couponNo}
                                }
                            } else {
                                obj = {couponValue, couponId, endTime, couponNo}
                            }
                        } 
                        if (couponList.length>0) {
                            this.setData({
                                couponList,
                                currentCouponId: obj.couponId,
                                currentCoupon: obj.couponValue,
                                currentCouponNo: obj.couponNo
                            })    
                        }else{
                            // 没有优惠时清空优惠券
                            this.setData({
                               couponList: [],
                               currentCouponId: '',
                               currentCoupon: 0,
                               currentCouponNo: ''
                            }) 
                        }
                        //计算运费，修复取“优惠券”失败而取“配送方式”总价不对的bug
                        this.calculateMoney() 
                        resolve(retval)
                    } else if(status != 707 || status != 708) {
                        reject({
                            type: 'getCouponList',
                            info: info || '网络异常'
                        })
                    }
                })
                .catch((error)=>{                    
                    let {info} = error
                    reject({
                        type: 'getCouponList',
                        info: info || '网络异常'
                    })
                })
        })
    },
    /**
     * [openDiscounts 打开优惠券弹框]
     */
    openDiscounts() {
        let {couponList} = this.data
        if (couponList.length > 0) {
            this.setData({
                showDiscounts: true
            })
        } else {
            wx.showToast({
                title: '没有可用的优惠券',
                icon: 'none'
            })
        }
    },
    /**
     * [openDiscounts 打开配送地址弹框]
     */
    openExpressageList() { 
        let {addrId} = this.data.address
        if (addrId) {
            this.setData({
                expressageListShow: true,
            })    
        } else {
            wx.showToast({
                title: '请添加收货地址',
                icon: 'none'
            })
        }       
        
    },
    /**
     * [couponChange 选择优惠券]
     */
    couponChange(event){
        let {value} = event.detail
        let currentCoupon = 0
        let currentCouponId = ''
        let currentCouponNo = ''        
        if (value) {
            let [couponNo, couponId, couponValue] = value.split(',')
            currentCoupon = couponValue
            currentCouponId = couponId 
            currentCouponNo = couponNo
        }else{            
            currentCoupon = 0
            currentCouponId = null 
            currentCouponNo = null
        } 

        this.setData({
            showDiscounts: false,
            currentCoupon,
            currentCouponId,
            currentCouponNo,
            // 清空订单数据，因为改变运费、商品数量、优惠券时要生成新订单
            orderSns: [],
            orderTime: 0
        })
        // 计算价格
        this.calculateMoney()
    },
    /**
     * [freightChange 选择快递]
     */
    freightChange(event){
        let arr = event.detail.value.split(',')
        let [freightIndex, freight, currentWeight] = arr
        this.setData({
            expressageListShow: false,
            freightIndex,
            currentWeight: currentWeight*1,
            currentFreight: freight*1 || 0,
            // 清空订单数据，因为改变运费、商品数量、优惠券时要生成新订单
            orderSns: [],
            orderTime: 0
        })
        // 计算价格
        this.calculateMoney()
    },
    /**
     * [calculateMoney 计算订单金额]
     * @return {[type]} [description]
     */
    calculateMoney(){
        let {currentFreight, currentCoupon, goodsPrice} = this.data        
        // let totalPrice = currentFreight*1 - currentCoupon*1 + goodsPrice*1
        let totalPrice = add(currentFreight*1, goodsPrice )
        totalPrice = subtract(totalPrice, currentCoupon*1)
        this.setData({
            totalPrice: utils.priceToString(totalPrice)
        })
    }, 
    /**
     * [changeRemark 买家留言，去掉首尾空格]
     */
    changeRemark(event){
        this.setData({
            remark: utils.trim(event.detail.value) || ''
        })
    },
    /**
     * [resetFreight 重新取运费数据，在“改变商品数量”时调用]
     */
    resetFreight(){
        wx.showLoading({
            mask: true,
            title: '重新计算运费'
        })
        // 重取快递列表和优惠券列表        
        Promise.all([this.getFreightList(), this.getCouponList()])
            .then((result)=>{
                let [freightRes, couponRes] = result
                let {freightIndex, currentCouponNo} = this.data
                // 配送方式处理
                if (freightIndex !== null && freightIndex >= 0) {
                    let current = freightRes[freightIndex] 
                    this.setData({
                        currentFreight: current.freight*1,
                        currentWeight: current.weight*1
                    })                    
                }
                // 配送方式处理 end
                
                // 重新计算运费
                this.calculateMoney()
                wx.hideLoading()
            })
            .catch((error)=>{
                let {info} = error
                // 重新计算运费
                this.calculateMoney()
                wx.showToast({
                    title: info,
                    icon: 'none'
                })
            })
    },    
    setTimeoutResetFreight: null,
    /**
     * [changGoodsNumber 价格改变时修改]
     * @param  {Object} arg 
     * @param  {Array}  arg.payGoodsData    [订单商品数据]
     * @param  {String} arg.storeId         [店铺Id]
     * @param  {String} arg.goodsId         [商品Id]
     * @param  {Number} arg.newGoodsNumber  [商品数量]
     */
    changGoodsNumber(arg){
        let {payGoodsData, storeId, goodsId, newGoodsNumber} = arg        
        var goodsPrice = 0
        let priceData = {}
        // 取出priceData，用于计算价格
        for (let i = payGoodsData.length -1; i >= 0; i--) {
            let item = payGoodsData[i]
            let {goodsInfo} = item                
            if (item.storeId == storeId) {
                for (let j = goodsInfo.length -1 ; j >= 0; j--) {
                    let innerItem = goodsInfo[j]
                    if (innerItem.goodsId == goodsId) { 
                        priceData =  innerItem.priceData
                        break
                    }
                }
                break
            }
        }
        // 取出priceData end
        // 计算商品价格（单价乘数量）
        // 存在priceDetail为活动价
        var onePrice = 0
        if ('priceDetail' in priceData) {
            onePrice = priceData.priceDetail.price
        // 非活动价有价格区间，要根据起批量计算价格
        }else{
            let innerPriceData = priceData.priceData
            for (let i = innerPriceData.length - 1; i >= 0; i--) {
                let item = innerPriceData[i]
                let {price, lowerLimit, upperLimit} = item
                // 字符串转数字
                lowerLimit *= 1
                upperLimit *= 1
                let isThis = (upperLimit*1>0) ? (newGoodsNumber >= lowerLimit && newGoodsNumber <= upperLimit) : ( newGoodsNumber>= upperLimit)
                if (isThis) {
                    onePrice = price
                }
            }
        }
        // goodsPrice = newGoodsNumber * onePrice
        goodsPrice = multiply(newGoodsNumber, onePrice * 1)
        this.setData({
            payGoodsData,
            goodsPrice,
            orderSns: [],
            orderTime: 0
        })   
        // 计算总金额
        // this.calculateMoney()
        clearTimeout(this.setTimeoutResetFreight)
        this.setTimeoutResetFreight = setTimeout(()=>{
            // 重新取“快递方式”并计算总价
            this.resetFreight()
        }, 350)
        // 更改缓存，方便更改地址时返回支付页面再次使用
        let payGoodsStorage = wx.getStorageSync('payGoods')
        payGoodsStorage.quantity = newGoodsNumber
        wx.setStorage({
            key: 'payGoods',
            data: payGoodsStorage
        })
    },
    /**
     * [goodsNumber 直接修改input修改数量]
     */
    goodsNumberInt(event){
        let {value} = event.detail 
        let {goodsid: goodsId, storeid: storeId, stock, lower} = event.target.dataset
        let {payGoodsData, spelling} = this.data 
     
        value = utils.trim(value)
        // “集赞商品”只能买一件  
        if (spelling == 1 && value*1 >= 2) {
            wx.showToast({
                title: `每单限购一件`,
                icon: 'none'
            })
            return 
        }
        if (spelling == 2 && value*1 < 3) {
            wx.showToast({
                title: `3件起批`,
                icon: 'none'
            })
            return 
        }
        if (!/^[1-9][0-9]*$/.test(value)) {
            wx.showToast({
                title: '请输入正整数',
                icon: 'none'
            })
        // 超过库存
        } else if(value*1 > stock*1){
            wx.showToast({
                title: `最多只能购买${stock}件`,
                icon: 'none'
            })
        // 小于起批量
        } else if(value*1 < lower){ 
            wx.showToast({
                title: `商品数量不能小于${lower}件`,
                icon: 'none'
            })   
        } else {
            for (let i = payGoodsData.length -1; i >= 0; i--) {
                let item = payGoodsData[i]
                let {goodsInfo} = item                
                if (item.storeId == storeId) {
                    for (let j = goodsInfo.length -1 ; j >= 0; j--) {
                        let innerItem = goodsInfo[j]
                        let {goodsNumber} = innerItem                    
                        if (innerItem.goodsId == goodsId) {                                            
                            payGoodsData[i].goodsInfo[j].goodsNumber = value*1
                            break
                        }
                    }
                    break
                }
            }
        }
        this.changGoodsNumber({payGoodsData, goodsId, storeId, newGoodsNumber: value*1})
    },
    /**
     * [changGoodsNumber 修改商品数量]
     */
    changGoodsNumberBtn(event){
        let {goodsid: goodsId, storeid: storeId, add, disabled, stock, lower, value} = event.target.dataset
        if (disabled) {
            if (add) {
                wx.showToast({
                    title: `最多只能购买${stock}件`,
                    icon: 'none'
                })
            }else{
                wx.showToast({
                    title: `商品数量不能小于${lower}件`,
                    icon: 'none'
                })                
            }
            return
        }
        // goodsInfo.goodsNumber
        // “集赞商品”只能买一件        
        let {spelling} = this.data
        if (spelling == 1 && value >= 1) {
            wx.showToast({
                title: `每单限购一件`,
                icon: 'none'
            })
            return 
        }  
        if (spelling == 2 && value <= 3 && !add) {
            wx.showToast({
                title: `3件起批`,
                icon: 'none'
            })
            return 
        }      
        let {payGoodsData} = this.data
        for (let i = payGoodsData.length -1; i >= 0; i--) {
            let item = payGoodsData[i]
            let {goodsInfo} = item
            var newGoodsNumber = 0
            if (item.storeId == storeId) {
                for (let j = goodsInfo.length -1 ; j >= 0; j--) {
                    let innerItem = goodsInfo[j]
                    let {goodsNumber} = innerItem                    
                    if (innerItem.goodsId == goodsId) { 
                        newGoodsNumber = !!add ? (goodsNumber*1+1) : (goodsNumber*1-1)                                         
                        payGoodsData[i].goodsInfo[j].goodsNumber = newGoodsNumber
                        break
                    }
                }
                break
            }
        }
        this.changGoodsNumber({payGoodsData, goodsId, storeId, newGoodsNumber})
    }, 
    /**
     * [quantityError 计算购买的商品数量是否在“起批量”和"库存"之间
     * 在提交订单和初始化页面时做判断]
     * @return {Boolean} [商品数量不在“起批量”和"库存"之间为true]
     */
    quantityError(){
        let {payGoodsData} = this.data
        let result = false
        
        for (let i = payGoodsData.length - 1; i >= 0; i--) {
            let {goodsInfo} = payGoodsData[i]            
            for (let i = goodsInfo.length - 1; i >= 0; i--) {                
                let {goodsNumber, lowerLimit, specInfo: [{stock}]} = goodsInfo[i]
                if (goodsNumber*1 > stock*1 ) {
                    result = true
                    wx.showToast({
                        title: `最多只能购买${stock}件`,
                        icon: 'none'
                    })
                    break;
                }
                if (goodsNumber < lowerLimit) {
                    result = true
                    wx.showToast({
                        title: `商品数量不能小于${lowerLimit}件`,
                        icon: 'none'
                    })
                    break;
                }
            }
        }        
        return result
    },
    /**
     * [successLeave 支付成功后页面跳转]
     * @param  {Number} roderId [订单ID必转]
     */
    successLeave(orderId){
        if (orderId) {
            let payGoods = wx.getStorageSync('payGoods')
            let {spelling} = payGoods
            let {wxAppId} = this.data
            if (wxAppId) {
                // let backAppPath = spelling ? 'pages/praise/index' : 'money/pages/orderDetails/index'
                let backAppPath = 'money/pages/orderDetails/index'
                this.setData({
                    showBackAppBox: true,
                    backAppPath,
                    backAppData: {
                        orderId
                    }
                }) 
            } else {
                if (spelling == 1) {
                    // 跳转到“集赞”页
                    wx.redirectTo({
                        url: '/pages/praise/index?orderId='+ orderId 
                    })    
                } else {
                    // 跳转到“订单”页
                    wx.redirectTo({
                        url: '/money/pages/orderDetails/index?orderId='+ orderId 
                    })
                }
            }
            
        }
    },    
    /**
     * [pay 支付]
     */
    pay() {
        let that = this
        let {
            inPaying,
            address: {
                addrId: addressId
            },
            spelling,
            freightList,
            freightIndex,
            currentCouponId,
            payGoodsData,
            remark,
            fromFlag,
            liveId
        } = this.data
        // 正在支付中，不得得重复提交
        if (inPaying) {return false}        
        // 表单校验失败
        if (this.quantityError()) {
            return false
        }else if (!addressId) {
            wx.showToast({
                title: '请选择收货地址',
                icon: 'none'
            })
            return false
        // 没有选择“配送方式”
        }else if(!freightList[freightIndex]){
            wx.showToast({
                title: '请选择配送方式',
                icon: 'none'
            })
            return false
        }
        // 筛先快递信息
        let freight = freightList[freightIndex]
        let {
            shippingId,
            expressSelect,
            expressType
        } = freight
        // 筛先快递信息end
        
        let userInfo = {
            addressId,
            shippingId,
            expressSelect,
            expressType
        }
        let goods = []

        for (let i = payGoodsData.length - 1; i >= 0; i--) {
            let {goodsInfo} = payGoodsData[i]
            for (let g = goodsInfo.length - 1; g >= 0; g--) {
                let {goodsId, specInfo, goodsNumber} = goodsInfo[g]
                let {quantity, specId} =  specInfo[0]
                let obj = {
                    goodsId, 
                    quantity: goodsNumber, 
                    specId
                }
                goods.push(obj)
            }
        }
        
        let args = {
            userInfo,
            goods,
            remark,
            spelling: (spelling == 2) ? 0 : spelling,
            liveId            
        }        
        if (fromFlag) {
            args.fromFlag = fromFlag
        }
        // 如果有优惠券
        if (currentCouponId) {
            args.couponsId = currentCouponId
        }
        
        this.setData({
            inPaying: true,
            payBtnText: '正在启动微信支付...'
        })
        createEellyPay(args)
            .then((res)=>{
                this.setData({
                    inPaying: false,
                    payBtnText: '已支付',
                    orderSns: res,
                    orderTime: Date.now()
                })
                wx.setStorageSync('paySucceed', true)
                console.log(res)
                // 判断是否是“集赞商品”以确认支付成功后要跳到的页面
                this.successLeave(res.orderIds[0])                
                
            })
            .catch((error)=>{
                let {type, info} = error
                // 用户放弃微信支付
                if (type == 'giveUpPay') {
                    let {currentCoupon} = that.data
                    this.setData({
                        payBtnText: '立即支付',
                        inPaying: false,
                        orderSns: error.orderSns,
                        orderTime: Date.now()
                    }) 
                    that.againPay()  
                // 微信支付失败
                } else if(type == 'wxPayFail'){
                    this.setData({
                        payBtnText: '立即支付',
                        inPaying: false,
                        orderSns: error.orderSns,
                        orderTime: Date.now()
                    })
                    wx.showToast({
                        title: info,
                        icon: 'none'
                    })
                // 其他失败
                } else {
                    wx.showToast({
                        title: info,
                        icon: 'none'
                    })
                    this.setData({
                        inPaying: false,
                        payBtnText: '立即支付'
                    })    
                }
            })           
    },    
    /**
     * [hasOrderPay 已有订单时调用]
     * @param  {Array}  orderSns  [订单信息]
     */
    hasOrderPay(orderSns){
        let {inPaying, fromFlag} = this.data        
        // 正在支付中，不得得重复提交
        if (inPaying) {return false}  
        this.setData({
            inPaying: true,
            payBtnText: '立即支付'
        })
        eellyPay(orderSns, fromFlag)
            .then((res)=>{
                wx.setStorageSync('paySucceed', true)
                this.setData({
                    inPaying: false,
                    payBtnText: '立即支付'
                })
                // 判断是否是“集赞商品”以确认支付成功后要跳到的页面
                this.successLeave(res.orderIds[0])
                
            })
            .catch((error)=>{
                let {type, info} = error
                // 用户放弃微信支付
                if (type == 'giveUpPay') {
                    let {currentCoupon} = this.data
                    this.setData({
                        payBtnText: '立即支付',
                        inPaying: false,
                        orderSns: error.orderSns,
                        orderTime: Date.now()
                    }) 
                    this.againPay()  
                // 微信支付失败
                } else if(type == 'wxPayFail'){
                    this.setData({
                        payBtnText: '立即支付',
                        inPaying: false,
                        orderSns: error.orderSns,
                        orderTime: Date.now()
                    })
                    wx.showToast({
                        title: info,
                        icon: 'none'
                    })
                // 其他失败
                } else {
                    wx.showToast({
                        title: info,
                        icon: 'none'
                    })
                    this.setData({
                        inPaying: false,
                        payBtnText: '立即支付'
                    })    
                }
            })
    },
    // 点击支付按钮
    clickPayBtn(){
        let {orderSns} = this.data
        if (orderSns.length > 0) {
            this.hasOrderPay(orderSns)
        } else {
            this.pay()
        }
    },
    // 用户主动放弃支付时调用
    againPay(){
        this.setData({
            showAgainPay: true
        })
    },
    // 点击再次支付按钮
    tapAgainPayBtn(){
        let {orderSns} = this.data
        this.hasOrderPay(orderSns)
    }
})