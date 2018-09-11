let service_name = 'Eelly\\SDK\\Order\\Api\\BuyerOrder'
let addOrderCount_name = 'Eelly\\SDK\\Order\\Api\\Count'

module.exports = {
  // 取订单数量
  getOrderAmount: {
    service_name,
    method: 'myAppletOrderStats'
  },
  getOrderList: {
    service_name,
    method: 'listAppletOrder'
  },
  getOrderDetail: {
    service_name,
    method: 'appletOrderDetail'
  },
  confirmReceivedOrder: {
    service_name,
    method: 'confirmReceivedOrder'
  },
  addOrderCount: {
    service_name: addOrderCount_name,
    method: 'addOrderCount'
  },
  orderRefund: {
    service_name: service_name,
    method: 'orderRefund'
  },
  orderRefundInvoice: {
    service_name: service_name,
    method: 'orderRefundInvoice'
  },
  uploadService:{
    service_name:'UploadService',
    method:'upload'
  },
  orderRefundLogEdit:{
    service_name,
    method: 'orderRefundLogEdit'
  },
  getOrderRefundInvoice:{
    service_name,
    method: 'getOrderRefundInvoice'
  },
  editOrderRefundInvoice:{
    service_name,
    method: 'editOrderRefundInvoice'
  },
  /*获取最高退款价格*/
  orderRefundMoney: {
    service_name,
    method: 'orderRefundMoney'
  },
  /*协商记录*/
    orderRefundLog: {
        service_name,
        method: 'orderRefundLog'
    },
    /*退款详情*/
    orderReundDetails :{
        service_name,
        method : 'orderDetail'
    },
    /*撤销退款申请*/
    cancelOrderRefund :{
      service_name,
        method : 'cancelOrderRefund'
    },
    // 催发货
    remindExpress:{
      service_name:'Order\\Service\\OrderService',
      method:'remindExpress'
    }


}