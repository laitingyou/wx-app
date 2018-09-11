import { orderRefund, uploadService, orderRefundLogEdit, orderRefundMoney } from '../../../utils/interface/order'
import { baseUrl } from '../../../utils/config'

const { eellyReqPromise, upload } = require('../../../utils/eellyReq')

Page({
  data: {
    returnGoodsShow: false,
    formData: {},
    returnGoodsReasonList: [
      { name: '卖家发错货', value: 5 },
      { name: '商品质量不好', value: 3 },
      { name: '商品与描述不符', value: 7 },
      { name: '收到商品破损', value: 8 },
      { name: '其他', value: 0 }
    ],
    refundReasonList: [
      { name: '商品缺货', value: 11 },
      { name: '卖家超时未发货', value: 4 },
      { name: '与卖家协商一致退款', value: 12 },
      { name: '不想要了/拍错了', value: 13 },
      { name: '其他', value: 0 }
    ],
    currentReason: '',
    photos: [],
    currentList: [],
    modal: false,
    modalMsg: '一个订单只能申请一次退货或退款哦',
    modalType: 'default',
    checked: null,
    type: 1,
    maxPrice: 0
  },
  onLoad (options) {
    let data = this.data
    let listType = [ 'refundReasonList', 'returnGoodsReasonList' ]
    this.setData({
      currentList: data[ listType[ options.type - 1 ] ],
      formData: options,
      modal: true,
      type: ~~options.type
    })
    if (~~options.flag === 2) {
      this.orderRefundLogEdit(options.orderId)
    }
    this.getOrderRefundMoney(options.orderId, ~~options.flag === 2 )

  },
  /**
   * 获取最高退款价格
   */
  getOrderRefundMoney(orderId = 0, reEdit) {
    eellyReqPromise({
      service: orderRefundMoney,
      args: {
        orderId
      }
    }).then(res => {
      if (res.data.status == 200) {
        let {data} = res.data.retval
        if(reEdit) {
          this.setData({
            maxPrice: data.returnAmount
          })
        }else {
          this.setData({
            franking: data.freight,
            maxPrice: data.returnAmount,
            'formData.price': data.returnAmount
          })
        }

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
  orderRefundLogEdit (orderId) {
    eellyReqPromise({
      service: orderRefundLogEdit,
      login: true,
      args: {
        orderId
      }
    }).then(res => {
      if (res.data.status == 200) {
        let { data } = res.data.retval
        let item = this.data.currentList.find(_ => _.value === ~~data.remark_type)
        this.setData({
          currentReason: item.name,
          formData: {
            type: data.type,
            remarkType: data.remark_type,
            desc: data.remark,
            price: data.apply_amount,
            certificate: '',
            franking: data.apply_freight,
            orderId
          },
          photos: data.certificate || []
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
  onClose () {
    this.setData({
      modal: false
    })
    if (this.data.modalType === 'success') {
      setTimeout(_ => {
        wx.reLaunch({
          url: '/money/pages/order/index?tab=5'
        })
      }, 400)
    }
  },
  /**
   * 原因列表显示
   */
  showReturnGoods () {
    this.setData({
      returnGoodsShow: true
    })
  },
  onCancel () {
    this.setData({
      returnGoodsShow: false
    })
  },
  /**
   * 退款说明
   * @param e
   */
  onBlur (e) {
    let {type} = e.currentTarget.dataset
    let value = e.detail.value.toString()
    value = value.replace(/^\s+|\s+$/g, '')
    if (type === 'input') {
      let {maxPrice} = this.data
      if (value * 100 > maxPrice) {
        wx.showToast({
          title: '退款金额不能大于总金额',
          icon: 'none'
        })
        this.setData({
          'formData.price': maxPrice
        })
      } else {
        this.setData({
          'formData.price': value * 100
        })
      }
    } else {
      this.setData({
        'formData.desc': value
      })
    }
  },
  /**
   * 验证表单字段
   * @param formData
   * @returns {*}
   */
  verify (formData) {
    let err = null
    if (!('remarkType' in formData)) {
      err = '请选择退款原因'
    }
    if (!(formData.price > 0)) {
      err = '请填写正确的退款金额'
    }

    if (err) {
      wx.showToast({
        title: err,
        icon: 'none'
      })
    }
    return err
  },
  /**
   * 提交退款申请
   * @param args
   */
  orderRefund (...args) {
    setTimeout(_ => {
      let { photos } = this.data, allPhotos = []
      let { formData } = this.data
      if (this.verify(formData)) return
      wx.showLoading({
        mask: true,
        title: '正在提交...'
      })
      // 上传图片
      upload({
        service: uploadService,
        file: photos
      }).then(res => {
        let allPhotos = res.reduce((preItem, curItem, curIndex) => {
          let all = preItem + curItem
          return all + (curIndex === res.length - 1 ? '' : '#')
        }, '')
        if (formData.type == 2) {
          formData.certificate = allPhotos
        }
        delete formData.franking
        delete formData.flag
        eellyReqPromise({
          service: orderRefund,
          login: true,
          args: {
            ...formData
          }
        }).then(res => {
          if (res.data.status == 200) {
            wx.hideLoading()
            this.setData({
              modal: true,
              modalType: 'success',
              modalMsg: res.info || '提交成功'
            })
          } else {
            wx.showToast({
              title: res.data.info || '网络异常',
              icon: 'none'
            })
          }
        }).catch(err => {
          wx.hideLoading()
          this.setData({
            modal: true,
            modalMsg: err.info || '提交失败'
          })
        })
      }).catch(err => {
        wx.showToast({
          title: err.info || '图片上传失败',
          icon: 'none'
        })
      })
    }, 200)
  },
  /**
   * 退款原因选择
   * @param e
   */
  radioChange (e) {
    let index = e.detail.value
    let item = this.data.currentList.find(_ => _.value === ~~index)
    this.setData({
      'formData.remarkType': index,
      currentReason: item.name
    })
  },
  /**
   * 添加退货图片
   */
  addPhoto () {
    let { photos } = this.data
    wx.chooseImage({
      count: 9 - photos.length, // 默认9
      sizeType: [ 'original', 'compressed' ],
      sourceType: [ 'album', 'camera' ],
      success: (res) => {
        let tempFilePaths = res.tempFilePaths
        this.setData({
          photos: [ ...photos, ...tempFilePaths ]
        })
      }
    })
  },
  /**
   * 移除图片
   * @param e
   */
  onRemove (e) {
    let { index } = e.currentTarget.dataset
    let { photos } = this.data
    photos.splice(index, 1)
    this.setData({
      photos
    })
  }
})
