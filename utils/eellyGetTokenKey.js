/**
 * 登录的最后一步，取 tokenKey
 */

// 封装过的ajax请求
const { eellyReq } = require("./eellyReq")
const tokenKeyService = require("./interface/tokenKey")
// 取优惠券
const {getCoupon} =require('./getCoupon')

// 云信的初始化方法等等
import IMEventHandler from './imeventhandler'

function getTokenKey(wxUserInfo) {
    return new Promise((resolve, reject) => {
        let user = wx.getStorageSync('user')
        let tokenKey = wx.getStorageSync('tokenKey')
        // 聊天室要用到
        let neteaseIm = wx.getStorageSync('neteaseIm')
        let newUser = false;//是否刚刚授权完成，默认是false
        
        if (user && tokenKey) {
            resolve({
                user,
                tokenKey,
                neteaseIm,
                newUser
            })
        // 拿到“用户信息”
        } else if(wxUserInfo.encryptedData) {
            delete wxUserInfo.userInfo//删除没用的字段
            eellyReq({
                service: tokenKeyService,
                args: {
                    siteName: 'wap',
                    type: 'applet',
                    loginData: wxUserInfo
                },
                success(res) {
                    let {
                        status,
                        info,
                        retval
                    } = res.data
                    if (status == 200) {
                        let { data } = retval
                        let { uid, userName, tokenKey, neteaseIm, nickName, portrait, wechatName } = data
                        let userData = {
                            user: {
                                uid,
                                userName,
                                nickName,
                                portrait,
                                wechatName
                            },
                            tokenKey,
                            neteaseIm,
                            newUser:true
                        }
                        wx.setStorageSync('user', userData.user)
                        wx.setStorageSync('tokenKey', tokenKey)
                        wx.setStorageSync('neteaseIm', neteaseIm)
                        // 删除订单地址防止更换账号或切换测试环境时支付报错
                        wx.removeStorage({
                            key: 'payAddress'
                        })
                        getCoupon(eellyReq) //取“优惠券”并设置TabBarBadge
                        
                        // 防目测试环境没有“neteaseIm”发生报错影响登录功能
                        if (neteaseIm) {
                            // 网易云信登录
                            new IMEventHandler({ 
                                token: neteaseIm.token, 
                                account: neteaseIm.username
                            })    
                        }
                        resolve(userData)   
                                               
                    } else {
                        reject({
                            type: 'getTokenKey',
                            info: info || '获取tokenKey失败'
                        })
                    }
                },
                fail() {
                    reject({
                        type: 'getTokenKey',
                        info: '获取tokenKey失败'
                    })
                }
            })
        } else {
            reject({
                type: 'getTokenKey',
                info: '未授权，登录失败'
            })
        }

    })
}


module.exports = getTokenKey
