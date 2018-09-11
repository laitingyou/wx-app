const { eellyReqPromise } = require('../../../utils/eellyReq')
import { orderRefundInvoice, getOrderRefundInvoice, editOrderRefundInvoice } from '../../../utils/interface/order'
import { getDefaultAddressByUserId, getAllExpressList } from '../../../utils/interface/address'

Page({
  data: {
    formData: {
      // "orderId": "116",
      // "invoiceInfo": '{consignee:"收件人姓名", gbCode:"地区编号", regionName:"广东省 广州市 越秀区",address:"白云大道北泰兴大厦",zipcode:500001,mobile:15267987854}',
      // "invoiceCode": "shunfeng",
      // "invoiceName": "顺丰",
      // "invoiceNo": "123123"
      invoiceNo: ''
    },
    defaultAddress: {},
    expressList:[],
    expressShow:false,
    storeId: 0,
    orderId: 0,
    checked: null,
    flag: 1
  },
  onLoad (options) {
    this.getAddress(options.sellerId)
    this.getExpress()
    this.setData({
      storeId: options.sellerId || 0,
      orderId: options.orderId || 0,
      flag: ~~options.flag
    })

    if(~~options.flag === 2){
      this.getIntData(options.orderId)
    }
  },
  /**
   * 验证表单字段
   * @param formData
   * @returns {*}
   */
  verify (formData) {
    let err = null
    if (!formData['invoiceName']) {
      err = '请选择快递公司'
    } else if (!formData['invoiceNo'] || formData['invoiceNo'].toString().replace(/^\s+|\s+$/g, '').length === 0) {
      err = '请填写快递单号'
    }
    if (/\W/i.test(formData.invoiceNo.toString())) {
      err = '请正确填写单号'
    }
    if (err) {
      wx.showToast({
        title: err,
        icon: 'none'
      })
    }
    return err
  },
  submit () {

    let { formData, orderId, flag, defaultAddress } = this.data
    if (this.verify(formData)) return
    delete defaultAddress.region_id
    delete defaultAddress.phone_tel
    delete defaultAddress.region_name
    delete defaultAddress.phone_mob
    eellyReqPromise({
      service: flag === 1 ? orderRefundInvoice : editOrderRefundInvoice,
      login: true,
      args: {
        ...formData,
        orderId,
        invoiceInfo: JSON.stringify(defaultAddress)
      }
    }).then(res => {
      if (res.data.status == 200) {
        wx.showToast({
          title: res.info || '发货成功',
          icon: 'success'
        })
        setTimeout(_=>{
          wx.reLaunch({
            url: '/money/pages/order/index?tab=5'
          })
        }, 2000)
      } else {
        wx.showToast({
          title: res.data.info || '网络异常',
          icon: 'none'
        })
      }
    }).catch(err => {
      wx.showToast({
        title: err.info || '发货失败',
        icon: 'none'
      })
    })
  },
  getIntData(orderId){
    wx.showLoading({
      title: '加载中……',
      icon: 'loading'
    })
    eellyReqPromise({
      service: getOrderRefundInvoice,
      login: true,
      args: {
        orderId
      }
    }).then(res => {
      if (res.data.status == 200) {
        let {data} = res.data.retval
        this.setData({
          'formData.invoiceName': data.invoice_name,
          'formData.invoiceNo': data.invoice_no,
          'formData.invoiceCode': data.invoice_code,
          'formData.oiId': data.oi_id
        })
        wx.hideLoading()
      } else {
        wx.showToast({
          title: res.data.info || '网络异常',
          icon: 'none'
        })
      }
    }).catch(err => {
      wx.showToast({
        title: err.info || '服务器异常',
        icon: 'none'
      })
    })
  },

  getAddress (storeId) {
    eellyReqPromise({
      service: getDefaultAddressByUserId,
      login: true,
      args:{
        userId:storeId
      }
    }).then(res => {
      if (res.data.status == 200) {
        let defaultAddress = res.data.retval.data
        defaultAddress.gbCode = defaultAddress.region_id
        defaultAddress.regionName = defaultAddress.region_name
        defaultAddress.mobile = defaultAddress.phone_mob
        defaultAddress.phone = defaultAddress.phone_tel
        this.setData({
          defaultAddress
        })
      } else {
        wx.showToast({
          title: res.data.info || '网络异常',
          icon: 'none'
        })
      }
    }).catch(err => {
      wx.showToast({
        title: err.info || '网络异常',
        icon: 'none'
      })
    })
  },
  getExpress () {
    eellyReqPromise({
      service: getAllExpressList,
    }).then(res => {
      if (res.data.status == 200) {
        this.setData({
          expressList: res.data.retval.data
        })
      } else {
        wx.showToast({
          title: res.data.info || '网络异常',
          icon: 'none'
        })
      }
    }).catch(err => {
      wx.showToast({
        title: err.info || '网络异常',
        icon: 'none'
      })
    })
  },
  selectExpress () {
    this.setData({
      expressShow: true
    })
  },
  radioChange (e) {
    let { expressList } = this.data, index = e.detail.value
    this.setData({
      'formData.invoiceName': expressList[index].name,
      'formData.invoiceCode': expressList[index].type
    })
  },
  onBlur(e){
    this.setData({
      'formData.invoiceNo': e.detail.value
    })
  },
  onSweep () {
    wx.scanCode({
      success: (res) => {
        this.setData({
          'formData.invoiceNo': res.result
        })
      }
    })
  },
  goChat () {
    let {storeId} = this.data
    let url = '/imPartials/pages/chating/chating?chatTo=' + storeId
    wx.navigateTo({
      url
    })
  }
})