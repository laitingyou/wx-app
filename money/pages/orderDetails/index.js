// pages/orderDetails/index.js
const {getOrderDetail, confirmReceivedOrder, cancelOrderRefund} = require('../../../utils/interface/order');
const {eellyReqPromise} = require('../../../utils/eellyReq');
const {eellyPay} = require("../../../utils/eellyPay");
const utiles = require('../../../utils/util');
// 调用微信登录和取用户信息
const {loginAndGetUser} = require("../../../utils/loginAndGetUser")
// 衣联登录
const eellyGetTokenKey = require("../../../utils/eellyGetTokenKey")

const app = getApp()
const {getAccessToken, eellyLoginBtn, navigatorVersion} = app

Page({

    /**
     * 页面的初始数据
     */
    data: {
        orderDetailData: null,
        orderStatusData: [
            {content: '未知（错误值）', statusId: 0},
            {content: '等待我付款', statusId: 1, ico: 'icon-fukuan'},
            {content: '集赞中 等待我分享 ', statusId: 2, ico: 'icon-zan'},
            {content: '集赞成功 等待发货', content2: '等待发货', statusId: 3, ico: 'icon-fahuotixing'},
            {content: '等待我收货', statusId: 4, ico: 'icon-fahuotixing'},
            {content: '等待我评价', statusId: 5, ico: 'icon-chenggongbiaoqing'},
            {content: '已评价', statusId: 6, ico: 'icon-fahuotixing'},
            {content: '集赞失败,已退款', statusId: 7, ico: 'icon-icon3'},
            {content: '已退款, 交易取消', statusId: 8, ico: 'icon-iconfontzhizuobiaozhun0262'},
            {content: '未付款, 交易取消', statusId: 9, ico: 'icon-iconfontzhizuobiaozhun0262'},
            {content: '申请退款中，等待卖家处理', statusId: 10, ico: 'icon-icon3'},
            {content: '申请退货中，等待卖家处理', statusId: 11, ico: 'icon-icon3'},
            {content: '卖家拒绝退款，等待我处理', statusId: 12, ico: 'icon-iconfontzhizuobiaozhun0262'},
            {content: '卖家拒绝退货，等待我处理', statusId: 13, ico: 'icon-iconfontzhizuobiaozhun0262'},
            {content: '卖家同意退货，等待我退货', statusId: 14, ico: 'icon-fahuotixing'},
            {content: '我已发货，等待卖家收货', statusId: 15, ico: 'icon-fahuotixing'},
            {content: '交易完成', statusId: 16, ico: 'icon-shouhuoziliao'}
        ],
        countDownData: '',
        isPay: false,
        timer: null,
        navigatorVersion,
        // 如果来自其他小程序记录他的appId用于跳到回去
        wxAppId: null,
        // 页面左上角是否有返回按钮(从其他小程序跳过来的没有)
        hasback: false,
        // 是否弹出授权框
        showLoginBox: false,
        // 显示返回来源小程序的弹框
        showBackAppBox: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        let {orderId = ''} = options
        let tokenKey = wx.getStorageSync('tokenKey') //衣联登录凭证
        // 有referrerInfo且没有orderId，那就表示从其他小程序跳过来的。
        let {referrerInfo} = getApp()
        if (referrerInfo && !orderId) {
            let {extraData} = referrerInfo 
            let {fromFlag = ''} = extraData
            orderId = extraData.orderId
            this.setData({
                wxAppId: referrerInfo.appId,               
                orderId,
                fromFlag
            })
        } else {
            this.setData({
                hasback: true
            })
        }
        wx.showLoading({
            mask: true,
            title: '加载中...'
        });
        getAccessToken()
            .then(()=>{
                if (!tokenKey) {
                    // 没有登录的时候试试用wx.getUserInfo能不能取到数据来登录
                    this.payLogin()
                        .then((res)=>{
                            this.setData({
                                showLoginBox: false
                            })
                            this.getOrderDetail(orderId)
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
                    this.getOrderDetail(orderId)
                }
            })
            .catch((error)=>{
                wx.showToast({
                    title: error.info || '网络异常',
                    icon: 'none'                   
                })
            })
        
        // 
        // this.getOrderDetail(orderId)
    },
    // 直接取用户信息进行登录
    payLogin(){
        return loginAndGetUser()
            .then((wxUserInfo)=>{
                return eellyGetTokenKey(wxUserInfo)
            }) 
    },
    // 授权登录
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
            let {orderId} = this.data 
            this.setData({
                showLoginBox: false
            })           
            this.getOrderDetail(orderId)
        })
        .catch((error)=>{
            wx.showToast({
                title: '网络异常',
                icon: 'none'
            })
        })
    },
    goPraise() {
        let {orderDetailData} = this.data;
        wx.navigateTo({
            url: `/pages/praise/index?orderId=${orderDetailData.orderId}`
        })
    },
    goLogistics(e) {
        let {orderid,type=1} = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/money/pages/logistics/index?orderId=${orderid}&type=${type}`
        })
    },
    goDetail() {
        let {orderDetailData} = this.data;
        wx.navigateTo({
            url: `/pages/goods/index?goodsId=${orderDetailData.goodsList[0].goodsId}`
        })
    },
    goGoodsBack(e) {
        const {flag} = e.currentTarget.dataset
        const {orderId, sellerId} = this.data.orderDetailData
        wx.navigateTo({
            url: `/money/pages/goodsBack/index?orderId=${orderId}&flag=${flag}&sellerId=${sellerId}`
        })
    },
    goAfterSaleList(e) {
        let {orderid, orderamount, type, freight, flag} = e.currentTarget.dataset
        wx.navigateTo({
            url: `/money/pages/afterSaleList/index?orderId=${orderid}&price=${orderamount}&franking=${freight}&flag=${flag}`
        })
    },
    //跳转退款退货详情
    goreundDetails(e) {
        let {orderid} = e.currentTarget.dataset
        wx.navigateTo({
            url: `/money/pages/refundDetails/index?orderId=${orderid}`
        })
    },
    //跳转退款退货详情
    goreundDetails(e) {
        let {orderid} = e.currentTarget.dataset
        wx.navigateTo({
            url: `/money/pages/refundDetails/index?orderId=${orderid}`
        })
    },
    // 退货
    goGoodsBack(e) {
        const {orderid, flag, sellerid} = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/money/pages/goodsBack/index?orderId=${orderid}&flag=${flag}&sellerId=${sellerid}`
        })
    },
    goPay(e) {
        let {ordersn} = e.currentTarget.dataset;
        this.setData({isPay: true})
        let {fromFlag} = this.data
        
        eellyPay([ordersn], fromFlag).then(res => {
            if (res) {
                this.setData({
                    isPay: false
                });
                // hasback为false则为其他小程序里来的
                if (this.data.hasback) {
                    wx.showToast({
                        title: '支付成功',
                        icon: 'none',
                        success(){
                            wx.navigateTo({
                                url: '/money/pages/order/index'
                            })
                        }
                    })
                } else {
                    this.setData({
                        showBackAppBox: true
                    });
                }
                
            }
        }).catch(error => {
            this.setData({
                isPay: false
            });
            wx.showToast({
                title: error.info,
                icon: 'none'
            })
        })

    },

    /*TODO  确认收货*/
    goTake() {
        let {orderDetailData} = this.data;
        wx.showModal({
            content: '是否确认收货？',
            confirmColor: '#FE3666',
            cancelColor: '#888888',
            success(res) {
                if (res.confirm) {
                    eellyReqPromise({
                        login: true,
                        service: confirmReceivedOrder,
                        args: {
                            orderId: orderDetailData.orderId,
                            uid: wx.getStorageSync('user').uid
                        }
                    }).then(res => {
                        let {status} = res.data;
                        if (status === 200) {
                            wx.showToast({
                                title: '收货成功',
                                icon: 'none',
                                success() {
                                    let {orderStatus} = orderDetailData;
                                    wx.redirectTo({
                                        url: `/money/pages/order/index?tab=${orderStatus}`
                                    })
                                }
                            })
                        } else {
                            wx.showToast({
                                title: '收货失败',
                                icon: 'none'
                            })
                        }
                    })
                }
            }
        })
    },
    /*TODO 获取详情数据*/
    getOrderDetail(orderId) {
        eellyReqPromise({
            service: getOrderDetail,
            login: true,
            args: {
                orderId: orderId,
            }
        }).then(res => {
            wx.hideLoading();
            let {status, retval} = res.data, orderDetailData = retval.data;
            let {goodsList, freight, changePrice, orderAmount, discountAmount, timeList, initFreight,returnAmount} = orderDetailData;
            if (status === 200) {
                if (timeList) {
                    for (let i in timeList) {
                        let timeItem = Number(timeList[i]);
                        let date = new Date(timeItem * 1000);
                        timeList[i] = timeItem ? utiles.format(date, 'yyyy-MM-dd hh:mm:ss') : 0;
                        orderDetailData.timeLists = timeList
                    }
                }
                orderDetailData.newfreight = this._convertPrice(freight);// 邮费
                orderDetailData.newinitFreight = this._convertPrice(initFreight);// 原运费
                orderDetailData.neworderAmount = this._convertPrice(orderAmount);// 实收
                orderDetailData.newdiscountAmount = this._convertPrice(discountAmount);//优惠金额
                orderDetailData.newchangePrice = this._convertPrice(changePrice);//  改价
                orderDetailData.newReturnPrice = this._convertPrice(returnAmount)
                // 处理商品数据
                goodsList.forEach((item) => {
                    item.price = this._convertPrice(item.price);
                    item.spec = item.spec.split(',');
                });

                this.setData({
                    orderDetailData
                }, () => {
                    let {orderDetailData} = this.data;
                    let countdown = Number(orderDetailData.countdown);
                    this._getCountDown(countdown * 1000)
                })

            } else {
                wx.showToast({
                    title: '获取数据失败',
                    icon: 'none'
                })
            }
        }).catch(() => {
            wx.showToast({
                title: '网络异常',
                icon: 'none'
            })
        })

    },

    /*复制功能*/
    setClipboard(e) {
        let {clip} = e.currentTarget.dataset;
        wx.setClipboardData({
            data: clip,
            success: () => {
                wx.showToast({
                    title: `复制成功`,
                    icon: 'none'
                });
            }
        })
    },
    _convertPrice(num) {
        return (num / 100).toFixed(2)
    },
    timer: null,
    _getCountDown(time) {
        if (time < 0) {
            clearTimeout(this.timer);
            return
        }
        let countDownData, {orderDetailData} = this.data;
        time -= 1000;
        let days = parseInt(time / 1000 / 60 / 60 / 24, 10),
            hours = parseInt(time / 1000 / 60 / 60 % 24, 10),
            minutes = parseInt(time / 1000 / 60 % 60, 10);
        let countDown = {
            days,
            hours,
            minutes
        };
        let sdays = Number(countDown.days) > 0 ? `${ countDown.days}天` : ''
        let sHours = Number(countDown.hours) > 0 ? `${ countDown.hours}时` : ''
        let sminutes = Number(countDown.minutes) > 0 ? `${ countDown.minutes}分钟` : ''

        switch (orderDetailData.orderStatus) {
            case  '1':
                countDownData = `${sdays}${sHours}${sminutes}后自动取消订单`;//待付款
                break;
            case '2':
                countDownData = `剩余${sHours}${sminutes}`;//待分享
                break;
            case '3':
                countDownData = `卖家有48小时备货期`;//待发货
                break;
            case '4':
                countDownData = `${sdays}${sHours}${sminutes}后自动收货`;//待收货
                break;
            case '5':
                countDownData = `${sdays}${sHours}${sminutes}后自动评价`;//待评价
                break;
            case '10':
                countDownData = `卖家还剩${sdays}${sHours}${sminutes}处理申请` //我申请退货或退款，等待卖家处理
                break;
            case  '11':
                countDownData = `卖家还剩${sdays}${sHours}${sminutes}处理申请`
                break;
            case '12':
                countDownData = `我还剩${sdays}${sHours}${sminutes}处理申请` //卖家拒绝退货和退款，等待我处理
                break;
            case  '13':
                countDownData = `我还剩${sdays}${sHours}${sminutes}处理申请`
                break
            case '14':
                countDownData = `我还剩${sdays}${sHours}${sminutes}发出退货`// 卖家同意退货，等待我退货
                break;
            case '15':
                countDownData = `卖家还剩${sdays}${sHours}${sminutes}收货，逾期系统自动收货` //等待卖家收货
                break
            default:
                countDownData = ' ';
                break;
        }

        this.setData({
            countDownData
        });
        this.timer = setTimeout(() => this._getCountDown(time), 1000);

    },
    /**
     * @TODO 跳转修改退款退货
     */
    goAfterSale(e) {
        let {orderid, type, freight, flag} = e.currentTarget.dataset
        let {orderAmount} = this.data.orderDetailData
        wx.navigateTo({
            url: `/money/pages/afterSale/index?orderId=${orderid}&price=${orderAmount}&type=${type}&franking=${freight}&flag=${flag}`
        })
    },
    /**
     * @TODO 撤销退款申请
     * @param {Object}
     */
    cancelRefund(e) {
        const {orderId} = this.data.orderDetailData
        wx.showModal({
            content: '确定撤销当前订单的售后申请?',
            confirmColor: '#FE3666',
            cancelColor: '#888888',
            success(res) {
                if (res.confirm) {
                    eellyReqPromise({
                        service: cancelOrderRefund,
                        args: {
                            orderId
                        }
                    }).then(res => {
                        let {status} = res.data;
                        if (status === 200) {
                            wx.showToast({
                                title: '操作成功',
                                icon: 'none',
                                success() {
                                    setTimeout(() => {
                                        wx.navigateTo({
                                            url: '/money/pages/order/index'
                                        })
                                    }, 1000)
                                }
                            })
                        } else {
                            wx.showToast({
                                title: '操作失败',
                                icon: 'none'
                            })
                        }
                    })
                }
            }
        })
    },
    onUnload() {
        clearTimeout(this.timer)
    }
});