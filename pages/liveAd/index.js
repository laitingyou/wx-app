import {getPreviewImgData} from '../../utils/interface/my'
import {eellyReqPromise} from '../../utils/eellyReq'
Page({

  /**
   * 页面的初始数据
   */
  data: {
      images:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getImages()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  copyWx(){
    wx.setClipboardData({
      data: 'wxCode',
      success: function(res) {
        // wx.showToast({
        //   title: '复制成功',
        //   icon: 'none'
        // })
      }
    })
  },

  getImages(){
    wx.showLoading()
    eellyReqPromise({
      service: getPreviewImgData
    }).then(res=>{
      let {data} = res.data.retval
      this.setData({
        images:data
      })
      wx.hideLoading()
    }).catch(err=>{
      wx.showToast({
        title: err.info || '网络异常',
        icon: 'none'
      })
    })
  },

  preview(e){
    let {url} = e.currentTarget.dataset
    wx.previewImage({
      urls: [url],
      fail(err){
        console.log(err)
      }
    })
  }
})