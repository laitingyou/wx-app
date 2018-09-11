let service_name = 'Goods\\Service\\GoodsService'

let goodsData = {
    method: 'miniProgramGetGoodsDetailByGoodsId',
    service_name
}
let goodsDetail = {
    method: "miniProgramGetGoodsDescription",
    service_name
}

let recommendGoods = {
    method: "miniProgramGetRecommendGoodsData",
    service_name
}

module.exports = {
    goodsData,
    recommendGoods,
    goodsDetail
}