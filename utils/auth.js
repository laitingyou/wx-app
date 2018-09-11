const {eellyReq}=require('./eellyReq')
const {version}=require('./config')
const authInterface=require('./interface/auth')
const { eellyGetToken } = require('./eellyGetToken')
let getAuth=function (callback) {
    return new Promise((resolve,reject)=>{
        let version_hide = wx.getStorageSync('version_show')
            if(version_hide!==""){
                resolve(version_hide)
            }else {
                eellyGetToken().then(res=>{
                    eellyReq({
                        service:authInterface,
                        args: {
                            platform: 5
                        },
                        success(res){
                          if (res.data.status == 200) {
                            let {result}=res.data.retval.data

                            resolve(!!~~result)
                            wx.setStorageSync('version_show', !!~~result)
                          } else {
                            wx.showToast({
                              title: res.data.info || '网络异常',
                              icon: 'none'
                            })
                          }
                        },
                        fail(err){
                            reject(err)
                        }
                    })
                }).catch(err=>{ reject(err)})
            }
    })


}
module.exports={
    getAuth
}
