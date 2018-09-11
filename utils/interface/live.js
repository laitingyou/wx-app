let service_name = 'Live\\Service\\LiveService'
let previewService_name = 'Live\\Service\\PreviewService'
let ContactsService_name = 'Customer\\Service\\ContactsService'
let GoodsService_name = 'Live\\Service\\GoodsService'
let CouponService_name = 'Active\\Service\\Coupon\\CouponService'
let ChatRoomService_name = 'IM\\Service\\Netease\\ChatRoomService'
let orderService_name = 'Goods\\Service\\GoodsService'
let liveShareService_name = 'Eelly\\SDK\\Live\\Api\\LiveShare'
let LiveActivity_name = 'Eelly\\SDK\\Live\\Api\\LiveActivity'

module.exports = {
    // 直播预告列表
    getPendingList: {
        service_name,
        method: 'getPendingList'
    },
    // 直播中列表
    getProgressList: {
        service_name,
        method: 'getProgressList'
    },
    // 直播商品列表
    getLiveGoodsInfo: {
        service_name,
        method: 'getLiveGoodsInfo'
    },
    // 订阅直播
    addSubscribe: {
        service_name,
        method: 'addSubscribe'
    },
    //获取直播间信息
    getLiveRoomInfo: {
        service_name,
        method: 'getLiveRoomInfo'
    },
    // 点赞
    addStatsPraise: {
        service_name: previewService_name,
        method: 'addStatsPraise'
    },
    //关注
    setConcern: {
        service_name: ContactsService_name,
        method: 'userOperateForApp'
    },
    //直播商品列表
    getGoodsServiceList: {
        service_name: GoodsService_name,
        method: 'getLiveRoomGoods'
    },
    // 获取快捷问题
    getLiveQuickQuestion: {
        service_name,
        method: 'getLiveQuickQuestion'
    },

    // 读取优惠券
    getLiveRoomCoupon: {
        service_name: CouponService_name,
        method: 'getLiveRoomCoupon'
    },
    // 领取优惠券
    receiveCoupon: {
        service_name: CouponService_name,
        method: 'receiveCoupon'
    },
    remindSetCoupon: {
        service_name: CouponService_name,
        method: 'remindSetCoupon'
    },
    usersShareCallback: {
        service_name: ChatRoomService_name,
        method: 'sendBarrage'
    },
    // 立即下单
    getGoodsSpecPrice: {
        service_name: orderService_name,
        method: 'getGoodsSpecPrice'
    },
    getRecommendsLive: {
        service_name: service_name,
        method: 'getRecommendsLive'
    },
    getLiveShare: {
        service_name: liveShareService_name,
        method: 'share'
    },
    shareFeedback: {
        service_name: liveShareService_name,
        method: 'shareFeedback'
    },
    getLiveActivityDoor: {
        service_name: LiveActivity_name,
        method: 'getLiveActivityDoor'
    },
    getTitleArea: {
        service_name: 'Channel\\Service\\AppletService',
        method: 'getTitleArea'
    },
    getShareTemplate:{
        service_name:'Channel\\Service\\AppletService',
        method:'getShareTemplate'
    }

}