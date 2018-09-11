let getAppletChildCate = {
    method: 'getAppletChildCate',
    service_name: 'Goods\\Service\\CategoryService'
}
let getAppletActivityStoreGoods = {
    method: "getAppletActivityStoreGoods",
    service_name: 'Channel\\Service\\AppletService'
}

//分类列表广告
let getAdvertising ={
    method:'getAdvertising',
    service_name:'Channel\\Service\\AppletService'
}

module.exports = {
  getAppletChildCate,
  getAppletActivityStoreGoods,
    getAdvertising

}