let service_name = 'Active\\Service\\Market\\MarketActivityApplyService'

module.exports = {
    // 热卖信息
    getHotSeller: {
        service_name,
        method: 'getHotSellerSpellingGoods'
    },
    getPreviewImgData:{
      service_name:'Channel\\Service\\AppletService',
      method:'getPreviewImgData'
    }
}