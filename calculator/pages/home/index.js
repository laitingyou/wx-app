const api = require('../../../utils/interface/home')
const { eellyReqPromise } = require("../../../utils/eellyReq")

const App = getApp()

const { getAccessToken } = App

Page({
  /**
   * 页面的初始数据
   */
  data: {
    hasProvince: true,
    dataList: [
      {
        label: '春季衣服',
        value: 5,
        input: false
      },
      {
        label: '夏季衣服',
        value: 5,
        input: false
      },
      {
        label: '秋季衣服',
        value: 5,
        input: false
      },
      {
        label: '冬季衣服',
        value: 5,
        input: false
      }
    ],  
    provinceData: {
      "beijing": [180, 120, 180, 360],
      "tianjin": [130, 100, 150, 320],
      "hebei": [130, 110, 150, 360],
      "shanxi": [130, 110, 150, 360],
      "neimenggu": [150, 120, 180, 400],
      "liaoning": [120, 110, 170, 380],
      "jilin": [160, 120, 180, 400],
      "heilongjiang": [160, 120, 180, 400],
      "shanghai": [150, 120, 170, 360],
      "jiangsu": [100, 80, 120, 300],
      "zhejiang": [100, 80, 120, 300],
      "anhui": [120, 100, 130, 360],
      "fujian": [130, 110, 150, 340],
      "jiangxi": [150, 120, 160, 340],
      "shandong": [120, 100, 150, 300],
      "henan": [130, 110, 150, 360],
      "hubei": [150, 120, 160, 340],
      "hunan": [150, 120, 160, 350],
      "guangdong": [120, 100, 150, 300],
      "guangxi": [100, 80, 110, 280],
      "hainan": [110, 100, 120, 120],
      "chongqing": [130, 100, 150, 320],
      "sichuan": [130, 100, 150, 320],
      "guizhou": [130, 100, 150, 330],
      "yunnan": [150, 110, 150, 360],
      "xizang": [160, 100, 180, 350],
      "shanxi": [130, 110, 150, 360],
      "gansu": [110, 90, 120, 320],
      "qinghai": [110, 90, 120, 360],
      "ningxia": [110, 100, 120, 340],
      "xinjiang": [160, 100, 180, 350],
      "xianggang": [150, 120, 160, 320],
      "aomen": [150, 120, 160, 320]
    }

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) { 
    let that = this   
    wx.getStorage({
      key: 'userInfoCalculator',
      success(res) {
        let {province} = res.data
        that.setData({
          hasProvince: !!province
        })
      },
      fail() {
        that.setData({
          hasProvince: false
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow () {

    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide () {
    this.setData({
      timerRun: false
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload () {
    wx.removeStorage({key: 'userInfoCalculator'})
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh () {
    this._init()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage () {

  },  
  /**
   * 点击输入
   * @param e
   */
  oninput(e){
    let {index, value} = e.currentTarget.dataset
    let dataInput = `dataList[${index}].input`
    let dataValue = `dataList[${index}].value`
    this.setData({
      [dataInput]: true
    })
  },
  /**
   * 输入完成
   */
  onfinish(e){
    let {value} = e.detail
    let {dataList} = this.data
    let editRow = 0
    value = value.toString().replace(/\s*/,'')
    for (let i in dataList){
        if(dataList[i].input){
          editRow = i
          dataList[i].input = false
          if(~~value){
                dataList[i].value = ~~value
          }else {
            dataList[i].value = 5
          }
          this.setData({
            dataList
          })
          break
        }
    }

    
  },
  /**
   * 点击选项
   * @param e
   */
  onChoose(e){
    let {index, value } = e.currentTarget.dataset
    let dataKey = `dataList[${index}].value`
    this.setData({
      [dataKey]: value
    })
  },
  /**
   *  开始计算
   */
  startCount(e){
    let {dataList, provinceData} = this.data
    let {
      province = 'beijing',
      nickName = '',
      avatarUrl = '',
      randomNum = parseInt(Math.random()*(70-50+1)+50) // 50-70的随机数
    } = wx.getStorageSync('userInfoCalculator')
    province = province ? province.toLowerCase() : 'beijing'    
    let money = 0

    dataList.forEach(function(currentValue, index){ 
      let provinceKey = provinceData[province] 
      let provinceVal = provinceKey ? provinceKey[index] : provinceData['beijing'][index]     
      money += Math.floor(provinceVal * currentValue.value * randomNum) 
    })

    wx.setStorage({
      key: 'userInfoCalculator',
      data: {
        province,
        nickName,
        avatarUrl,
        money,
        randomNum
      }
    })
    // 自定义统计点“计算器”的人
    if (wx.canIUse('reportAnalytics')) {
      wx.reportAnalytics('calculator', {
        province,
        nickname: nickName,
        avatarurl: avatarUrl
      });  
    } 
    wx.navigateTo({
      url: '/calculator/pages/testResult/index'
    })

  }
})
