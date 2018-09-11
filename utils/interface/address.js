let service_name = 'Member\\Service\\Address\\ReceiveService'

module.exports = {
    // 添加或修改收货地址
    editAddress: {
        service_name,
        method: 'saveMinAddress'
    },
    // 设置默认收货地址
    setMinDefaultAddress: {
        service_name,
        method: 'setMinDefaultAddress'
    },
    // 删除地址
    delAddress: {
        service_name,
        method: 'deleteMinAddress'
    },
    // 取地址列表
    addressList: {
        service_name,
        method: 'getMinAddressList'
    },
    getDefaultAddress: {
        service_name,
        method: 'getMinDefaultAddress'
    },
  getDefaultAddressByUserId: {
        service_name:'Store\\Service\\ReturnAddressService',
        method: 'getDefaultAddressByUserId'
    },
  //获取快递列表
  getAllExpressList:{
    service_name:'Eelly\\SDK\\Order\\Api\\Invoice',
    method:'getAllExpressList'
  }
}