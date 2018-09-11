const {
  baseUrl,
    timeUrl,
    version,
    appId,
    appSecret,
    secretKey
} = require("./config")

const md5 = require('./md5');

/**
 * [md5Encode 对象进行md5签名加密]
 * 步聚：
 * 1.对象转数组
 * 2.对数组进行默认的sort排序
 * 3.把数组转字符串后面拼上字符串'true'或传入的字符串
 * 4.转回好的得字符串
 * @param  {[object]} obj [description]
 * @param  {[string]} str [description]
 * @return {[object]}     [description]
 */
function md5Encode(obj, str) {
    let arr = [],
        newObj = {},
        newStr = str || 'true';
    for (var x in obj) {
        if (obj.hasOwnProperty(x)) {
            arr.push(x);
        }
    }
    arr = arr.sort()
    let sign = md5(JSON.stringify(arr) + newStr)
    return sign
}

/**
 * [eellyGet 取access_token]
 */
function eellyGetToken() {
    return new Promise((reslove, reject) => {
        // 与服务器时间差
        let serverTimeDifference = wx.getStorageSync('serverTimeDifference') || ''
        let accessToken = wx.getStorageSync('accessToken') || ''
        let dataObj = {
            "app": "Api",
            "service_name": "CredentialService",
            "method": "token",
            "time": Math.floor(new Date() / 1000 - serverTimeDifference),
            "client_name": "wechat",
            "client_version": version,
            "client_user_type": "buyer",
            "args": {
                "appId": appId,
                "appSecret": appSecret
            }
        }

        let sign = md5Encode(dataObj)

        if (accessToken) {
            reslove(accessToken)
        } else {
            wx.request({
                url: baseUrl,
                method: 'POST',
                header: {
                    'Transmission-Token': 'true',
                    'Transmission-Mode': 'Security',
                    'Transmission-Version': 'v2'
                },
                data: {
                    sign,
                    ...dataObj
                },
                success(res) {
                    let {
                        status,
                        info,
                        retval
                    } = res.data
                    if (status == 200) {
                        let accessToken = retval.data.access_token
                        wx.setStorageSync('accessToken', accessToken) || ''
                        reslove(accessToken)
                    } else {
                        reject({
                            type: 'getToken',
                            info: info || '网络异常'
                        })
                    }
                },
                fail() {
                    reject({
                        type: 'getToken',
                        info: '网络异常'
                    })
                }
            })
        }
    })
}

module.exports = {
    eellyGetToken,
    md5Encode
}