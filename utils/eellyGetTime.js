const {
  baseUrl,
    timeUrl,
    version,
    appId,
    appSecret,
    secretKey,
} = require("./config")

/**
 * [eellyGetTime 取百里挑衣网服务器时间]
 */
function eellyGetTime() {
    return new Promise((resolve, reject) => {
        // 客户端与服务端时间差
        let serverTimeDifference = wx.getStorageSync('serverTimeDifference') || null
        if (serverTimeDifference) {
            resolve(serverTimeDifference)
        } else {
            wx.request({
                url: timeUrl,
                method: 'GET',
                complete(res) {
                    let {statusCode, data} = res
                    if (statusCode == 200 && /^[0-9]{10}$/.test(data)) {
                        let timeDifference = Math.floor(new Date() / 1000 - data)
                        wx.setStorageSync('serverTimeDifference', timeDifference)
                        resolve(timeDifference)
                    } else {
                        reject({
                            type: 'getTime',
                            info: '网络异常'
                        })
                    }
                }
            })
        }

    })
}

module.exports = eellyGetTime