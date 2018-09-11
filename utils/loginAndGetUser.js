
/**
 * [wxLogin 取用户信息]
 * @return {Function} [返回Promise]
 */
function wxLogin() {
    return new Promise((resolve, reject) => {
        wx.login({
            success(res) {
                if (res.code) {
                    var jsCode = res.code;
                    resolve(jsCode)
                } else {
                    reject({
                        type: 'wxLogin',
                        info: '登录失败'
                    })
                }
            },
            fail() {
                reject({
                    type: 'wxLogin',
                    info: '登录失败'
                })
            }
        })
    })
}

/**
 * [getUserInfo 取微信用户信息，如果拒绝]
 * @param  {String}   jsCode   [wx.login取得的jsCode]
 */
function getUserInfo(jsCode) {
    return new Promise((resolve, reject) => {
        wx.getUserInfo({
            withCredentials: true,
            success(res) {
                let { rawData, signature, encryptedData, iv } = res
                resolve({
                    jsCode,
                    rawData,
                    signature,
                    encryptedData,
                    iv
                })
            },
            fail() {
                // 删除用户信息
                wx.removeStorageSync('user')
                wx.removeStorageSync('tokenKey')
                wx.removeStorageSync('neteaseIm')
                // 到登录页“登录”
                reject({
                    type: 'getUserInfo',
                    info: '取用户数据失败'
                })
            }
        })
    })
}

// 微信登录并拿取用户信息
function loginAndGetUser() {
    return wxLogin()
        .then((jsCode) => {
            return getUserInfo(jsCode)
        })
}

module.exports = {loginAndGetUser, wxLogin}