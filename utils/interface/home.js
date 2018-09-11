module.exports={
    /*首页获取直播列表*/
    getHomeLiveList:{
        service_name:'Live\\Service\\LiveService',
        method:'getHomeLiveList'

    },
    /*商品列表*/
    getGoodsList:{
        service_name:'Channel\\Service\\AppletService',
        method:'getAppletActivityStoreGoods'

    },
    /*商品目录*/
    getGoodsTitle:{
        service_name:'Channel\\Service\\AppletService',
        method:'appletIndex'
    },
    /*获取优惠券*/
    getMinRedPackage:{
        service_name:'Active\\Service\\Coupon\\CouponService',
        method:'getMinRedPackage'
    },
    // 取首页"直播数据"
    getAppLetLiveList: {
        service_name: 'Channel\\Service\\AppletService',
        method: 'getAppLetLiveList'
    },
    // 取拼货标题
    getActivityArea: {
        service_name: 'Channel\\Service\\AppletService',
        method: 'getActivityArea'
    },
    //领取成功红包，发送公众号消息通知
    sendReceiveRedPackage:{
        service_name:'Messages\\Service\\WechatMinMessagesService',
        method:'sendReceiveRedPackage'
    },
    //获取价格区间更多优惠商品数据
    getPriceAreaActivityStoreGoods:{
        service_name:'Channel\\Service\\AppletService',
        method:'getPriceAreaActivityStoreGoods'
    },
    // 获取分享文案
    getShareTemplate:{
        service_name:'Channel\\Service\\AppletService',
        method:'getShareTemplate'
    }
}