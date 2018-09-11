let StoreService_name = 'Store\\Service\\StoreService';
let BusinessCircleService_name = 'BusinessCircle\\Service\\BusinessCircleService';
module.exports = {
    // 店铺商品请求连接
    getMiniProgramStoreGoodsList: {
        service_name: StoreService_name,
        method: 'getMiniProgramStoreGoodsList'
    },
    // 店铺首页朋友圈连接
    storeIndexView: {
        service_name: BusinessCircleService_name,
        method: 'storeIndexView'
    },
    //
    getUserDynamicList: {
        service_name: BusinessCircleService_name,
        method: 'getUserDynamicList'
    },
    // 店铺信息
    sellerBusinessInfo: {
        service_name: BusinessCircleService_name,
        method: 'sellerBusinessInfo'
    },
    // 店铺直播数据
    getLiveData:{
        service_name: 'Live\\Service\\PreviewService',
        method: 'popInfo'
    },
    // 获取二维码
    getCreateAppletBQrCode:{
        service_name: 'Member\\Service\\OAuth\\WechatService',
        method: 'getCreateAppletBQrCode'
    }
};