const {
    timeUrl,
    appId,
    appSecret,
    secretKey,
    version,
    navigatorVersion,
    appKey // 云信的key
} = require("./utils/config")


//取服务器时间
const eellyGetTime = require('./utils/eellyGetTime')
// 微信登录并取微信用户信息
const {wxLogin} = require('./utils/loginAndGetUser')
//取access_token
const {eellyGetToken} = require('./utils/eellyGetToken')
// 重新封装好的ajax请求方式
const {eellyReqPromise} = require("./utils/eellyReq")
// 取TokenKey（登录的最后一步）
const eellyGetTokenKey = require("./utils/eellyGetTokenKey")
//状态管理
const store = require("./utils/store")
//状态管理,来自云信的解决方案
const subscriber = require('./utils/event.js')
//弹幕接口
const {addBarrage} = require('./utils/interface/barrage')
// 阿拉钉统计
const ald = require('./utils/ald-stat.js')
//app.js
App({

    onLaunch(options) {
        
        //移除Storage的项，couponInfo优惠券信息，
        // version_show版本显示
        // hidden_goods_live 商品直播展示
        this.removeStorage(
            [
                'couponInfo',
                'version_show',
                'hidden_goods_live'
            ]
        )

        try {
            const updateManager = wx.getUpdateManager()
            updateManager.onUpdateReady(function () {
                wx.showModal({
                    title: '更新提示',
                    content: '新版本已经准备好，是否重启应用？',
                    success: function (res) {
                        if (res.confirm) {
                            updateManager.applyUpdate()
                        }
                    }
                })

            })
        } catch (err) {

        }

    },
    onShow(options){
        // 从另一小程序跳过来的会有referrerInfo
        let {referrerInfo} = options      
        if (referrerInfo) {
            this.referrerInfo = referrerInfo
        }
    },
    // 用于小程序之间跳转navigator组件里的version属性
    navigatorVersion,
    /**
     * 移除Storage
     * @param keys Storage的key 数组
     */
    removeStorage(keys){
        keys.map(key=>{
            wx.removeStorage({
                key
            })
        })
    },

    /**
     * 页面不存在就跳回首页
     */
    onPageNotFound(res) {
        
        let {path, query} = res
        // 接口首页更换地址，防旧版app分享的地址未更新过来
        if (/^\/?(pages\/live\/index)$/.test(path)) {
            wx.switchTab({
                url: '/live/pages/live/index'
            })
        } else {
            wx.switchTab({
                url: '/pages/home/index'
            })
        }

    },
    globalData: {
        tarIndex: 0,//首页和拼货页面共享数据
        barrageList: [],
        //// 云信的全局数据
        isLogin: false, // 当前是否是登录状态
        currentChatTo: '', // 记录当前聊天对象account，用于标记聊天时禁止更新最近会话unread
        loginUser: {},//当前登录用户信息
        friends: [],//好友列表，
        friendsWithCard: {}, // 带有名片信息的好友列表（转发时使用）
        friendsCard: {},//带有名片信息的好友列表
        onlineList: {},//在线人员名单 account: status
        blackList: {},//黑名单列表
        config: {
            appKey,
            url: 'https://app.netease.im',
            openSubscription: true
        },//存储appkey信息
        nim: {},//nim连接实例
        subscriber, //消息订阅器
        notificationList: [], // 通知列表
        recentChatList: {},//最近会话列表
        rawMessageList: {}, //原生的所有消息列表(包含的字段特别多)
        messageList: {}//处理过的所有的消息列表   
        //// 云信的全局数据 end
    },
    // tabarlist页面，给返回上一页面的方法判断是否使用switchTab
    tabBarList: [
        '/pages/home/index',
        '/pages/goodsList/index',
        '/pages/preferential/index',
        '/pages/my/index'
    ],
    /**
     * [getAccessToken 取getAccessToken]
     */
    getAccessToken() {
        return eellyGetTime()
            .then(() => {
                return eellyGetToken()
            })
        /*.catch((error)=>{
          console.log(error)
        })*/
    },
    /**
     * [eellyLogin 百里挑衣登录 在button中使用]
     * @param  {Object} userInfo [通过buton按钮拿到的微信用户信息]
     */
    eellyLoginBtn(userInfo) {
        if ('errMsg' in userInfo) {
            delete userInfo.errMsg
        }
        return this.getAccessToken()
            .then(() => {
                return wxLogin()
            })
            .then((jsCode) => {                
                return eellyGetTokenKey({
                    jsCode,
                    ...userInfo
                })
            })
    },
    /**
     * [eellyLogin 登录]
     * @param  {String} emit [发跨页面调用的方法]
     */
    eellyLogin(emit = '') {
        if (!wx.getStorageSync('tokenKey')) {
            // 跳到登录页
            wx.navigateTo({
                url: '/pages/login/index?emit=' + emit
            })
        } else {
            this.store.emit(emit)
        }
    },   
    store,

    /**
     *  推送弹幕到服务器
     * @param barrageType 弹幕类型
     * 1 => "xx 进入市场准备拼货了",
     * 2 => "xx 把红包发到微信群了",
     * 3 => "xx 进入了直播间",
     * 4 => "xxx 邀请朋友帮他点赞成功",
     * 5 => "xx 领了880元红包",
     * 6 => "xx 是一条狗 刚刚下了一笔新订单",
     * 7 => "xx 正在直播间拿货",
     * 8 => "xx 正在邀请朋友帮他点赞"
     */
    addBarrage(barrageType,data=null){
        eellyReqPromise({
            service:addBarrage,
            args:{
                userType:1,
                userId:wx.getStorageSync('user').uid || 0,
                barrageType,
                data
            }
        }).then(res=>{}).catch(err=>{})   
    }
})