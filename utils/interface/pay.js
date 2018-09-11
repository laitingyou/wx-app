let service_name = 'Order\\Service\\OrderService'

module.exports = {
    // 取订单中“店铺”、“商品”的数据
    getPayData: {
        service_name,
        method: 'getTranConfirmData'
    },
    // 通过选择地址获取运费和重量
    getFreight: {
        service_name: 'Store\\Service\\StoreService',
        method: 'getFreightAndWeight'
    },
    // 创建订单
    getPayOrderData: {
        service_name,
        method: 'payOrderData'
    },
    // 优惠券（支付页使用）
    getCoupon: {
        service_name: 'Active\\Service\\Coupon\\CouponService',
        method: 'getOrderCouponList'
    },    
    // 取得已有订单支付所要的参数
    orderGoPay: {
        service_name: 'Order\\Service\\OrderService',
        method: 'orderGoPay'
    },
    //支付成功发送公众号通知
    sendSuccessOrder:{
        service_name:'Messages\\Service\\WechatMinMessagesService',
        method:'sendSuccessOrder'
    }
}