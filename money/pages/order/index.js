// pages/order/index.js
const {eellyPay} = require("../../../utils/eellyPay");
const {getOrderList, confirmReceivedOrder, addOrderCount, remindExpress} = require('../../../utils/interface/order');
const {eellyReqPromise} = require('../../../utils/eellyReq');
Page({
    data: {
        /*tab导航数据*/
        tabItem: [{title: '全部', content: ''}, {title: '待付款', content: ''}, {title: '待分享', content: ''}, {
            title: '待发货',
            content: ''
        }, {title: '待收货', content: ''}, {title: '退货退款', content: ''}/*, {title: '待评价', content: ''}*/],//状态
        current: 0,// 当前ID
        last: '',//获取最后一页
        orderListData: null,//订单列表数据
        scrollTop: 0,// 滚动到顶部
        isMore: true,//显示没有更多订单
        orderStatus: [
            '未知（错误值）', '等待我付款', '待分享', '待发货', '待收货', '待评价', '已评价', '集赞失败,已退款', '已退款, 交易取消', '未付款, 交易取消'
            , '申请退款中', '申请退货中', '卖家拒绝退款', '卖家拒绝退货', '等待我退货', '等待卖家收货', '交易完成', '已退款，交易取消'
        ] //订单状态信息
    },
    switchTab(e) {
        let {current} = e.currentTarget.dataset;
        wx.showLoading({
            mask: true,
            title: '加载中...'
        });
        this.getOrderList(current);
        this.setData({
            current,
            isMore: true
        });
        this.page = 1;
    },
    /*获取订单列表*/
    getOrderList(tab = 0, page = 1, isOnReachBottom) {
        let {isMore, orderListData} = this.data;
        wx.showLoading({
            mask: true,
            title: '加载中...'
        });
        eellyReqPromise({
            service: getOrderList,
            login: true,
            args: {
                tab,
                page
            }
        }).then(res => {
            wx.hideLoading();
            let {status, retval} = res.data;
            let orderData = retval.data;
            let {items, last} = orderData;
            if (status === 200) {
                /*滚动到底部触发*/
                if (!!isOnReachBottom) {
                    if (isMore) {
                        if (this.page > last) {
                            this.setData({
                                isMore: false
                            });
                        } else {
                            this.setData({
                                orderListData: orderListData.concat(this.dealGoodsList(items)),
                            })
                        }
                    } else {
                        this.setData({
                            isMore: true
                        });
                    }
                } else {
                    /*点击触发*/
                    wx.pageScrollTo({scrollTop: 0});
                    this.setData({
                        orderListData: this.dealGoodsList(items),
                        last
                    })
                }
            } else {
                wx.showToast({
                    title: '获取数据失败',
                    icon: 'none'
                })
            }
        }).catch(e => {
            wx.showToast({
                title: e.info,
                icon: 'none'
            })
        });
    },
    // 跳转售后申请
    goAfterSale(e) {
        let {orderid, orderamount, type, freight, flag} = e.currentTarget.dataset
        wx.navigateTo({
            url: `/money/pages/afterSale/index?orderId=${orderid}&price=${orderamount}&type=${type}&franking=${freight}&flag=${flag}`
        })
    },
    //跳转退款退货详情
    goreundDetails(e) {
        let {orderid} = e.currentTarget.dataset
        wx.navigateTo({
            url: `/money/pages/refundDetails/index?orderId=${orderid}`
        })
    },
    // 跳转集赞
    goPraise(e) {
        let {orderid} = e.currentTarget.dataset;
        eellyReqPromise({
            service: addOrderCount,
            args: {
                orderId: orderid
            }
        }).then(res => {
            if (res.data.status === 200) {
                wx.navigateTo({
                    url: `/pages/praise/index?orderId=${orderid}`
                })
            }
        }).catch(e => {
            wx.showToast({
                title: e.info,
                icon: 'none'
            })
        })
    },
    // 跳转详情
    goDetail(e) {
        let {goodsid} = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/goods/index?goodsId=${goodsid}`
        })
    },
    // 跳转物流
    goLogistics(e) {
        let {orderid, type = 1} = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/money/pages/logistics/index?orderId=${orderid}&type=${type}`
        })
    },

    goGoodsBack(e) {
        const {orderid, flag, sellerid} = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/money/pages/goodsBack/index?orderId=${orderid}&flag=${flag}&sellerId=${sellerid}`
        })
    },
    // 去退货退款列表
    goAfterSaleList(e) {
        let {orderid, orderamount, type, freight, flag} = e.currentTarget.dataset
        wx.navigateTo({
            url: `/money/pages/afterSaleList/index?orderId=${orderid}&price=${orderamount}&franking=${freight}&flag=${flag}`
        })
    },
    // 确认支付
    goPay(e) {
        let that = this, {orderid, index} = e.currentTarget.dataset, {orderListData} = this.data;
        orderListData[index].isPay = true;
        this.setData({
            orderListData
        });
        eellyPay([orderid]).then(res => {
            orderListData[index].isPay = false;
            this.setData({
                orderListData
            });
            if (res) {
                wx.showToast({
                    title: '支付成功',
                    icon: 'none',
                    success() {
                        if (orderListData[index].extension === '1') {
                            that.getOrderList(2)
                            that.setData({
                                current: 2
                            })
                        } else {
                            that.getOrderList(3)
                            that.setData({
                                current: 3
                            })
                        }
                        orderListData.splice(index, 1);
                        that.setData({
                            orderListData
                        })
                    }
                })
            }
        }).catch(error => {
            orderListData[index].isPay = false;
            this.setData({
                orderListData
            });
            wx.showToast({
                title: error.info,
                icon: 'none'
            })
        })
    },
    // 确认收货
    goTake(e) {
        let that = this, {orderid, index} = e.currentTarget.dataset, {orderListData} = this.data;
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
                            orderId: orderid,
                            uid: wx.getStorageSync('user').uid
                        }
                    }).then(res => {
                        let {status} = res.data;
                        if (status === 200) {
                            wx.showToast({
                                title: '收货成功',
                                icon: 'none',
                                success() {
                                    orderListData.splice(index, 1);
                                    that.setData({
                                        orderListData
                                    })
                                }
                            })
                        } else {
                            wx.showToast({
                                title: '收货失败',
                                icon: 'none'
                            })
                        }
                    }).catch(e => {
                        wx.showToast({
                            title: e.info,
                            icon: 'none'
                        })
                    })
                }
            }
        })
    },
    /*处理订单数据*/
    dealGoodsList(orderList) {
        orderList.forEach(item => {
            let goodList = item.goodsList, freight = Number(item.freight);
            goodList.forEach((goodsItem) => {
                goodsItem.newspec = goodsItem.spec.split(','); // 分割尺码颜色
                goodsItem.newprice = this._convertPrice(goodsItem.price); // 分转元单位；
            });
            item.isPay = false;// 是否支付状态
            item.neworderAmount = this._convertPrice(item.orderAmount); // 转换单位
            item.newfreight = freight ? `运费：￥${this._convertPrice(item.freight)}` : '免运费';
        });
        return orderList
    },
    _convertPrice(num) {
        return (num / 100).toFixed(2)
    },
    onLoad(options) {
        let tab = options.tab;
        this.getOrderList(tab); //初始化订单数据
        if (tab) {
            this.setData({
                current: Number(tab)
            })
        }
    },
    page: 1,
    onReachBottom() {
        let currentID = this.data.current,
            nextPage = this.page++,
            last = this.data.last;
        if (nextPage > last) {
            this.setData({
                isMore: false
            });
        } else {
            this.getOrderList(currentID, nextPage, 'onReachBottom')
        }
    },

    onRemindExpress(e){
      let {orderid} = e.currentTarget.dataset;
      eellyReqPromise({
        service: remindExpress,
        args: {
          orderId: orderid
        }
      }).then(res => {
        if (res.data.status === 200) {
          wx.showToast({
            title: '已催促商家发货',
            icon: 'none'
          })
        }
      }).catch(e => {
        wx.showToast({
          title: e.info,
          icon: 'none'
        })
      })
    }
});