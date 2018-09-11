import { getMinRedPackage } from "../../../utils/interface/preferential";

const api = require('../../../utils/interface/home')
const { eellyReqPromise } = require("../../../utils/eellyReq")

const App = getApp()

const { getAccessToken} = App
import {getMoneySaveTemplate} from '../../../utils/interface/savingTest'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    portrait:'',
    canvasW:0,
    canvasH:0,
    shareInfo: {}
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    /*this.getUserInfoCalculator()
      .then( (userInfoCalculator)=>{
        this.userInfoCalculator = userInfoCalculator
        this.getData(userInfoCalculator.money)
        // this.getShareInfo()
      })
      .catch(()=>{

      })*/
    let user = {}
    wx.showLoading({
      mask: true,
      title: '计算中……'
    })
    this.getUserInfoCalculator().then(res=>{
      user = res
      getAccessToken()
        .then(()=>{
          Promise.all([
            this.getData(user.money),
            this.getShareInfo()
          ]).then(res=>{
            let userInfo = user|| {}
            let data = res[0] || {}
            this.downloadFile([userInfo.avatarUrl,data.image], (e)=>{
              userInfo.avatarUrl = e[0]
              data.image = e[1]
              this.onDraw(data,userInfo)
            })

            this.setData({
              shareInfo: res[1] || {}
            })
          })
        })
    }).catch(err=>{

    })
  },
  downloadFile(url=[],callback){
    let i = 0, tmpUrl=[]
    let down = (src)=>{
      wx.downloadFile({
        url: src,
        success: (_) =>{
          if (_.statusCode == 200) {
            i++
            tmpUrl.push(_.tempFilePath)
            if(i < url.length) {
              down(url[i])
            }else {
              callback(tmpUrl)
            }
          }
        },
        fail(e){
          wx.showToast({
            title: '图片链接无效',
            icon: 'none'
          })
        }
      })
    }
    down(url[0])
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

    // this._init()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide () {
   
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh () {
    // this._init()
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
    let {shareInfo} = this.data
    return {
      title: shareInfo.content,
      path: '/pages/home/index?calculator=1',
      imageUrl: shareInfo.image,
      success (res) {
        // 转发成功
        wx.showToast({
          title: '分享成功',
          icon: 'none'
        })
      },
      fail (res) {
        // 转发失败
        wx.showToast({
          title: '分享失败',
          icon: 'none'
        })
      }
    }
  },
  getUserInfoCalculator(){
    return new Promise((resolve, reject) => {
      wx.getStorage({
        key: 'userInfoCalculator',
        success(res){
          resolve({...res.data})
        },
        fail(){
          reject({
            type: 'getUserInfoCalculator',
            info: '未找到计算结束'
          })
        }
      })
    })
  },
  getShareInfo(){
    return new Promise((resolve, reject) => {
      eellyReqPromise({
        service: api.getShareTemplate,
        args: {
          condition:{ type: 17 }
        }
      }).then(res => {
        let {status, info, retval: {data}} = res.data
        if (status == 200) {
          resolve(data[0] || {})
        } else {
          reject({
            type: 'getShareInfo',
            info
          })
        }        
      }).catch(err=>{
        reject(err)
      })  
    })
    
  },
  /**
   * 传金额拿拼图所需要图片
   */
  getData(money = 0){  
    return new Promise((resolve, reject) => {
      eellyReqPromise({
        service: getMoneySaveTemplate,
        args: {
          condition: {
            money
          }
        }
      }).then(res => {        
        let {status, info, retval: {data}} = res.data
        if (status == 200) {
          resolve(data)
        }else{
          reject({
            type: 'getData',
            info
          })
        }

      }).catch(err=>{
        reject({
          type: 'getData',
          info: '网络异常'
        })
      })  
    })  
    
    
  },

  getAvatar(){
    //   let userInfo = wx.getStorageSync('user')
    // let  { portrait } = userInfo
    // console.log(portrait)
    // wx.downloadFile({
    //   url: portrait,
    //   success: (res)=> {
    //     if (res.statusCode === 200) {
    //       this.setData({
    //         portrait: res.tempFilePath
    //       })
    //     }
    //   }
    // })

  },
  /**
   * 画图
   */
  onDraw(data, userInfo){
  try {
    let sysInfo = wx.getSystemInfoSync()
    let rpxTopx = sysInfo.windowWidth / 750
    let  ctx = wx.createCanvasContext('canvas') //上下文
    let w = 680 * rpxTopx, h = 990 * rpxTopx
    let textArr = []
    let text = ""
      this.setData({
        canvasW: w,
        canvasH: h
      })
      //白色背景
      // ctx.setFillStyle('#ff3264')
      // ctx.fillRect(0, 0, w, h)
//
    // // 表情包
    ctx.drawImage(data.image ||  '/images/test.png', 0, 0, w, h )
      ctx.save()
      // // 头像
      ctx.beginPath()
      ctx.arc(w/2, 100 * rpxTopx, 50 * rpxTopx, 0, 2 * Math.PI)
      ctx.setStrokeStyle('#d3d3d3')
      ctx.stroke()
      ctx.clip()

      // //
      ctx.drawImage(userInfo.avatarUrl || '/images/default-icon.png', w/2 - 50 * rpxTopx, 100 * rpxTopx - 50 * rpxTopx, 100 * rpxTopx, 100 * rpxTopx )

      // 标题
      ctx.restore()
      ctx.setTextAlign('center')
      ctx.font = 'bold'
      ctx.setFontSize(36 * rpxTopx)
      ctx.setFillStyle('#000000')
      text = data.title
      text = text.replace(/\{(.*)\}/,userInfo.nickName)
      if(text.length > 16){
        textArr[0] = text.slice(0,16)
        textArr[1] = text.slice(16)
        ctx.fillText(textArr[0], w/2, 200 * rpxTopx)
        ctx.fillText(textArr[1], w/2, 260 * rpxTopx)
      }else {
        ctx.fillText(text, w/2, 200 * rpxTopx)
      }



      // 金额
      // ctx.setFontSize(40)
      ctx.setFillStyle('#ff0000')
      ctx.setFontSize(70 * rpxTopx)
      ctx.fillText('￥'+userInfo.money, w / 2, 370* rpxTopx)
      // ctx.setFontSize(20)
      // ctx.fillText('￥', w / 2 - 160 * rpxTopx, 370* rpxTopx)
      //绘画
      ctx.draw(false)
      wx.hideLoading()
  }catch (err){
    wx.hideLoading()
    wx.showToast({
      title: '数据格式出错',
      icon: 'none'
    })
  }

  },
  /**
   * 保存图片
   */
  saveImage(){
    let {canvasW, canvasH} = this.data
    wx.canvasToTempFilePath({
      canvasId: 'canvas',
      width:canvasW,
      height:canvasH,
      quality:1,
      fileType: 'jpg',
      destWidth: canvasW,
      destHeight: canvasH,
      success:(res)=> {
        console.log(res)
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success(res) {
            wx.showToast({
              title: '保存成功',
              icon: 'none'
            })
          },
          fail(err){
            wx.showToast({
              title: '保存失败',
              icon: 'none'
            })
          }
        })
      },
      //生成失败
      fail:(err)=>{
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        })
      }
    },this)
    
  }

})
