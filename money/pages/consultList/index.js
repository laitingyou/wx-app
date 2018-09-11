const {eellyReqPromise} = require('../../../utils/eellyReq');
const {orderRefundLog} = require('../../../utils/interface/order')
Page({
    data: {
        consultListData: null,
        remarkTypeArray : ['其他','','','商品质量不好','卖家超时未发货','卖家发错货','','商品与描述不符','收到商品破损','','','商品缺货','与卖家协商一致退款','不想要了／拍错了']
    },
    onLoad(options) {
        let {orderId} = options
        this.getConsultList(orderId)
    },
    /**
     * @TODO 获取协商记录数据
     * @param {String} orderId - 订单Id.
     */
    getConsultList(orderId) {
        eellyReqPromise({
            service: orderRefundLog,
            login: true,
            args: {
                orderId
            }
        }).then(res => {
            let {status, retval} = res.data
            if (status === 200) {
                let consultListData = retval.data
                consultListData.forEach(item => {
                    if (item.certificate) {
                        let certificate = item.certificate
                        certificate.apply_amount = (certificate.apply_amount / 100).toFixed(2)
                        certificate.apply_freight = (certificate.apply_freight / 100).toFixed(2)
                    }

                })
                this.setData({
                    consultListData
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
     * @TODO 预览图片
     * @param {Object} e - 获取图片连接
     */
    showImage(e) {
        let {img,certificate} = e.currentTarget.dataset
        console.log(certificate);
        wx.previewImage({
            current: img,
            urls: certificate
        })
    }
});