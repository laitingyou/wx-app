

module.exports = {
    /*获取商品信息*/
    appGetGoodsDetail : {
        method: 'appGetGoodsDetail',
        service_name:'Goods\\Service\\GoodsService'
    },
    /*领取优惠券*/
    receiveCoupon:{
        method:'receiveCoupon',
        service_name:'Active\\Service\\Coupon\\CouponService'
    },
    /*获取优惠券*/
    getSellerCouponList:{
        method:'getSellerCouponList',
        service_name:'Active\\Service\\Coupon\\CouponService'
    },
    /*获取详情*/
    goodsDetail:{
        method: "miniProgramGetRecommendGoodsData",
        service_name:'Goods\\Service\\GoodsService'
    },
    /*告诉直播间正在拿货*/
    sendBarrage:{
        method: "sendBarrage",
        service_name:"IM\\Service\\Netease\\ChatRoomService"
    },
    /*拼货动态消息轮询*/
    getGoodsLikeInfo:{
        method:"getGoodsLikeInfo",
        service_name:"Goods\\Service\\GoodsService"
    }

}