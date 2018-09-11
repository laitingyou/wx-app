const {
    baseUrl,
    timeUrl,
    version,
    appId,
    appSecret,
    secretKey,
    clientName
} = require("./config")



// 默认的请求体
var originalData = {
    "app": "Mall",
    "client_name": clientName,
    "client_version": version,
    "client_user_type": "buyer"
}
// 默认的请求头
var roiginalHeader = {
    'content-type': 'application/x-www-form-urlencoded',
    'Transmission-Mode': 'Security'
}

/**
 * [eellyReq ajax请求加入自定义请求头和默认参数等
 * 用法比wx.request多一个args和service参数，其他的按wx.request的来设置]
 * @param  {Object}  args     [一般接口要求的参数在这里传]
 * @param  {Object}  service  [里面有service_name和method，这相当于一般ajax里的接口地址]
 * @param  {Boolean} login    [接口地是否需要登录，默认为false]
 */
function eellyReq({
    header = roiginalHeader,
    data = originalData,
    method = 'POST',
    login = false,
    args = {},
    service = {},
    dataType = 'json',
    responseType = 'text',
    success = function (res) { },
    fail = function () { },
    complete = function () { }
}) {
    var header = { ...roiginalHeader, ...header }
    var data = { ...originalData, ...data }

    let serverTimeDifference = wx.getStorageSync('serverTimeDifference') || ''
    let accessToken = wx.getStorageSync('accessToken') || ''

    header['Transmission-Token'] = accessToken

    data.time = Math.floor(Date.now() / 1000) - serverTimeDifference
    data.service_name = service.service_name
    data.method = service.method
    data.args = args
    data.args = JSON.stringify(args)
    // 
    if (login) {
        data.user_login_token = wx.getStorageSync('tokenKey') || ''
    }
    let sartTime = Date.now()
    wx.request({
        url: baseUrl,
        method,
        data: 'data=' + JSON.stringify(data),
        header,
        dataType,
        responseType,
        success(res) {
            /*let { status } = res.data
            // AccessToken过期
            if (status == 707) {
              App.getAccessToken()
            // 登录 过期  
            }else if(status == 701){ 
              App.eellyLogin()
            }else{
              success && success(res)
            } */
            success && success(res)
        },
        fail,
        complete(res){            
            complete(res)
            // 自定义分析
            if (wx.reportAnalytics) {
                let {statusCode} = res                
                let {status = 0} = res.data
                let timing = Date.now() - sartTime
                if (timing >= 1000 || status != 200 || statusCode != 200) {
                    wx.reportAnalytics('blty_ajax', {
                        statuscode: statusCode,
                        url: baseUrl,
                        method: data.method,
                        service_name: data.service_name,
                        args: data.args,
                        status,
                        timing
                    })    
                }                    
            }
        }
    })
}

// accessToken和登录的错误次数，超过三回不再递归
var errorNumber = 0 
/**
 * [eellyReqPromise  用Promise封装 eellyReq 并处理AccessToken和TokenKey过期的情况
 * 用法比wx.request多一个args和service参数，不用传success、fail、complete其他的按wx.request的来设置]
 * @param  {Object} args     [一般接口要求的参数在这里传]
 * @param  {Object} service  [里面有service_name和method，这相当于一般ajax里的接口地址]
 */
function eellyReqPromise({
    header = roiginalHeader,
    data = originalData,
    method = 'POST',
    login = false,
    args = {},
    service = {},
    dataType = 'json',
    responseType = 'text',
    emit = ''
}) {
    // 取App的内容，不要放外面，会报错
    const App = getApp()
    return new Promise((resolve, reject) => { 
        if (!wx.getStorageSync('tokenKey') && login) {
            wx.hideLoading()            
            // 到登录页“登录”
            wx.navigateTo({
                url: '/pages/login/index?emit=' + emit
            })
            return            
        } 
        // 发起请求
        eellyReq({
            header,
            data,
            method,
            login,
            args,
            service,
            dataType,
            responseType,
            success(res) {
                let { status } = res.data
                // AccessToken过期
                if (status == 707 && errorNumber < 3) {
                    errorNumber++
                    // 删除accessToken
                    wx.removeStorageSync('accessToken')
                    // 重新敢accessToken
                    App.getAccessToken()
                        .then(() => {
                            eellyReqPromise({
                                header,
                                data,
                                method,
                                login,
                                args,
                                service,
                                dataType,
                                responseType,
                                emit
                            })
                                .then((res) => {
                                    resolve(res)
                                })
                                .catch((error) => {
                                    reject(error)
                                })
                        })
                    // 登录 过期  
                } else if (status == 708 && errorNumber < 3) {
                    errorNumber++
                    // 删除用户信息
                    wx.removeStorageSync('user')
                    wx.removeStorageSync('tokenKey')
                    wx.removeStorageSync('neteaseIm')
                   
                    // 到登录页“登录”
                    wx.hideLoading()
                    wx.navigateTo({
                        url: '/pages/login/index?emit=' + emit
                    })
                    reject({
                        type: 'noLogin',
                        info: '请先登录'
                    })
                } else if(status == 200){
                    resolve(res)
                    errorNumber = 0
                } else {
                    reject({
                        type: 'fail',
                        info: res.data.info||'网络异常'
                    })
                }
            },
            fail() {
                reject({
                    type: 'fail',
                    info: '网络异常'
                })
            }
        })
    })
}

function upload ({file, service, success, fail}) {
  let accessToken = wx.getStorageSync('accessToken')
  let header = roiginalHeader
  let data = {}
  let index = 0
  let allfile = []
  data.service_name = service.service_name
  data.method = service.method
  data.app = 'Api'
  header['Transmission-Token'] = accessToken
  return new Promise((resolve, reject) => {
    if(file.length === 0){
      resolve(allfile)
      return;
    }
    for (let item of file) {
      //判断图片是否是线上的图片，是就不上传了，直接抛出路径
      if (/https:\/\/img/.test(item)) {
        allfile.push(item)
        index++
        if (index === file.length) {
          resolve(allfile)
        }
        continue
      }
      wx.uploadFile({
        url: baseUrl,
        filePath: item,
        name: 'file',
        header,
        formData: {
          data: JSON.stringify(data)
        },
        success: function (res) {
          let data = JSON.parse(res.data)
          let currentFile = data.retval.data
          allfile.push(currentFile[0].url)
          index++
          if (index === file.length) {
            resolve(allfile)
          }
        },
        fail (e) {
          reject(e)
        }
      })
    }
  })
}

module.exports = { eellyReq, eellyReqPromise, upload}