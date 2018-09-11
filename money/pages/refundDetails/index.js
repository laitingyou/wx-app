const {eellyReqPromise} = require('../../../utils/eellyReq')
const {orderReundDetails, orderRefund, cancelOrderRefund} = require('../../../utils/interface/order')
Page({
    data: {
        reundDetailsData: null, // 退款退货详情数据
        countDownData: '', // 退款退货详情倒计时状态文本
        remarkTypeArray: ['其他', '', '', '商品质量不好', '卖家超时未发货', '卖家发错货', '', '商品与描述不符', '收到商品破损', '', '', '商品缺货', '与卖家协商一致退款', '不想要了／拍错了']//图款原因文案
    },
    /**
     * TODO 初始化退货退款数据
     * @param {Object} options - 对象下的订单Id
     */
    onLoad(options) {
        let {orderId} = options
        this.getReundDetails(orderId)
    },
    /**
     * TODO 获取退货详情列表
     * @param {string} orderId - 订单Id
     */
    getReundDetails(orderId) {
        wx.showLoading({
            title: '加载中...',
            icon: 'none'
        })
        eellyReqPromise({
            service: orderReundDetails,
            args: {
                orderId
            }
        }).then(res => {
            wx.hideLoading()
            const {status, retval} = res.data
            if (status === 200) {
                let reundDetailsData = retval.data
                reundDetailsData.newApplyAmount = (reundDetailsData.applyAmount / 100).toFixed(2)
                reundDetailsData.newApplyFreight = (reundDetailsData.applyFreight / 100).toFixed(2)
                this.setData({
                    reundDetailsData,
                    orderId
                }, () => {
                    let {time} = this.data.reundDetailsData
                    /*
                    *     let countdown = Number(orderDetailData.countdown);
                    this._getCountDown(countdown ? countdown * 1000 : countdown)*/
                    this._getCountDown(time * 1000)
                })
            } else {
                wx.showToast({
                    title: '获取数据失败',
                    icon: 'none'
                })
            }
        }).catch(err => {
            wx.showToast({
                title: err.info,
                icon: 'none'
            })
        })
    },
    /**
     * TODO 复制订单信息
     * @param {Object} e - 事件对象获取clip字符串.
     */
    setClipboard(e) {
        const {clip} = e.currentTarget.dataset;
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
    /**
     * TODO  订单状态倒计时
     * @param {String} time - 返回的秒时间戳.
     */
    timer: null,
    _getCountDown(time) {
        if (time < 0) {
            clearTimeout(this.timer);
            return
        }
        let countDownData, {reundDetailsData} = this.data;
        time -= 1000;
        let days = parseInt(time / 1000 / 60 / 60 / 24, 10),
            hours = parseInt(time / 1000 / 60 / 60 % 24, 10),
            minutes = parseInt(time / 1000 / 60 % 60, 10);
        let countDown = {
            days,
            hours,
            minutes
        };
        let sdays = Number(countDown.days) > 0 ? `${countDown.days}天` : ''
        let shours = Number(countDown.hours) > 0 ? `${countDown.hours}时` : ''
        let sminutes = Number(countDown.minutes) > 0 ? `${countDown.minutes}分钟` : ''
        if (reundDetailsData.status === '1' || reundDetailsData.status === '2' || reundDetailsData.status === '6') {
            countDownData = `卖家还剩${sdays}${shours}${sminutes}处理申请`;
        } else if (reundDetailsData.status === '3' || reundDetailsData.status === '4' || reundDetailsData.status === '5') {
            countDownData = `我还剩${sdays}${shours}${sminutes}处理申请`
        } else if (reundDetailsData.status === '7') {
            let {finished_time} = this.data.reundDetailsData
            let time = finished_time.split('-').join(' ').split(' ');
            let [y, m, d, t] = time
            let [h, mm] = t.split(':')
            countDownData = `${y}年${m}月${d}日  ${h} : ${mm}分完成退款`
            clearTimeout(this.timer)

        }
        else {
            countDownData = ' ';
        }

        this.setData({
            countDownData
        });
        this.timer = setTimeout(() => this._getCountDown(time), 1000);

    },
    onUnload() {
        clearTimeout(this.timer)
    },
    /**
     * @TODO 跳转私聊
     * @param {Object} e - 获取自定义属性sellerid
     */
    goChat(e) {
        let {sellerid} = e.currentTarget.dataset
        wx.navigateTo({
            url: `/imPartials/pages/chating/chating?chatTo=seller_00000${sellerid}`
        })
    },
    /**
     * @TODO 跳转协商记录
     */
    goConsultList(e) {
        wx.navigateTo({
            url: `/money/pages/consultList/index?orderId=${this.data.orderId}`
        })
    },
    /**
     * @TODO 跳转订单详情
     */
    goOrderDetail() {
        wx.navigateTo({
            url: `/money/pages/orderDetails/index?orderId=${this.data.orderId}`
        })
    },
    /**
     * @TODO 跳转修改退款退货
     */
    goAfterSale(e) {
        const {orderId} = this.data
        const {flag, type} = e.currentTarget.dataset
        const {applyAmount, applyFreight} = this.data.reundDetailsData
        wx.navigateTo({
            url: `/money/pages/afterSale/index?orderId=${orderId}&price=${applyAmount}&type=${type}&franking=${applyFreight}&flag=${flag}`
        })
    },
    /**
     * @TODO 跳转退货
     * @param  {Object} e 获取新增或修改标识
     */
    goGoodsBack(e) {
        const {flag} = e.currentTarget.dataset
        const {seller_id} = this.data.reundDetailsData
        wx.navigateTo({
            url: `/money/pages/goodsBack/index?orderId=${this.data.orderId}&flag=${flag}&sellerId=${seller_id}`
        })
    },
    /**
     * @TODO 跳转物流
     */
    goLogistics(e) {
        let {type = 1} = e.currentTarget.dataset
        wx.navigateTo({
            url: `/money/pages/logistics/index?orderId=${this.data.orderId}&type=${type}`
        })
    },
    /**
     * @TODO 撤销退款申请
     * @param {Object}
     */
    cancelRefund(e) {
        const {orderId} = this.data
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
    /**
     * @TODO 预览图片
     * @param {Object} e - 获取图片连接
     */


    showImage(e) {
        const {certificate} = this.data.reundDetailsData
        const {img} = e.currentTarget.dataset
        wx.previewImage({
            current: img,
            urls: certificate
        })
    }
});