// pages/liveDetails.js
const app = getApp();
const {getAccessToken, navigatorVersion} = app
const ChatRoom = require('../../utils/sdk/NIM_Web_Chatroom_v5.0.1');
const {appKey} = require('../../utils/config');
const md5 = require('../../utils/md5');
const {getShareTemplate, getLiveRoomInfo, getGoodsServiceList, addStatsPraise, setConcern, getLiveQuickQuestion, getLiveRoomCoupon, receiveCoupon, remindSetCoupon, usersShareCallback, getGoodsSpecPrice, getRecommendsLive, getLiveShare, shareFeedback, getLiveActivityDoor} = require('../../utils/interface/live');
const {eellyReqPromise, eellyReq} = require('../../utils/eellyReq');
const {getAuth} = require('../../utils/auth');
const colorArray = ['../../images/liveDetail/heart1.png', '../../images/liveDetail/heart2.png', '../../images/liveDetail/heart3.png'];
const {getQRcodeScene} = require("../../utils/util");

Page({
    data: {
        roomInfo: null,//房间信息
        goodsList: [], //商品列表
        newGoodsList: [], //过滤的商品列表
        msgList: [],// 消息列表
        liveId: '',// 聊天室ID
        defaultAnnouncement: [],// 公告信息
        sId: '',//记录聊天室滚动ID
        isRecommend: '',// 判断推荐商品
        liveWinHeight: 0,// 直播窗口高度
        liveUrl: '',//直播地址
        /*直播视频*/
        praiseList: [],//点击加赞心心
        isShow: false,
        /*聊天室*/
        isQHide: false, // 问题弹窗
        isFocus: false, // 输入框是否聚焦
        isQShow: false,
        textValue: '',// 输入框值
        isQuestionhide: false,//快捷问题弹窗
        // “快揵问题”
        questionList: [],
        // 是否在请求“快揵问题”接口
        questionListLoading: false,
        isShareShow: false, //分享领优惠弹窗
        /*分享领券*/
        isShare: true, // 按钮是否分享
        couponList: [], // 现金券列表
        /*立即下单*/
        isOrderShow: false, //订单弹窗
        /*直播结束倒计时*/
        showTime: true,
        timeStr: '',
        isShareStorage: true,// 分享后按钮点亮缓存
        winHeight: 0,// 设备高度
        isCoverImageHide: false,
        isShareHide: false,
        navTitle: '', // 直播间标题
        RecommendGoodsInfo: null,
        /*立即下单*/
        info: null,// 下单信息
        currentSize: null,//当前尺码
        currentColor: null,// 当前颜色
        buttonType: {
            color: 'currentColor',
            size: 'currentSize'
        },
        random: 0,
        currentPriceType: 'group',
        num: 1,
        allPrice: 0,
        unitPrice: 0,
        quantity: 0,
        specId: 0,
        disabled: {
            color: [],
            size: []
        },
        currentStock: null,
        orderSort: null,
        showColseBox: false, //显示关闭时的弹框
        isVideoShow: true,// 直播与默认图切换显示
        isLiveMoreHide: true,//直播与默认图切换显示
        getRecommendsLiveLoading: false, // 是否在请求“推荐的直播”
        // getRecommendsLiveError: '', //请求“推荐的直播”报错信息
        recommendsLive: [],
        /*离开直播间弹出*/
        isLiveLeaveShow: false,
        /*礼品直播脚本*/
        isGiftShow: false,
        timeObj: null, //直播脚本倒计时
        activityList: null, // 活动列表
        isActivityShow: false, // 活动弹窗是否电视
        activityTime: '',// 活动时间
        activityInfo: null,// 活动信息
        changeGoods: null,// 改价钱
        isChangeGoodsPriceHide: {}, // 改价弹窗
        activityDisabled: true, // 活动按钮
        enabled: true,
        // 如果来自其他小程序记录他的appId用于跳到回去
        wxAppId: null,
        // 是否显示右上角关闭按钮（从其他直播间跳过来的不显示）
        showColse: false,
        isRedBagShow: true, //主播喊你领钱
        rebBagList: [],
        isGoodsOver: false // 宝贝抢光标识
    },
    chatRoom: null,
    ctx: null,
    onReady() {
        if (wx.createLivePlayerContext) {
            this.ctx = wx.createLivePlayerContext('video-livePlayer');
        }
    },
    onLoad(options) {
        let {liveId = '', uniqueFlag = '', laId = 0, showLiveList, scene} = options
        // 获取分享信息

        eellyReqPromise({
            service: getShareTemplate,
            args: {
                condition: {
                    type: 16
                }
            }
        }).then(res => {
            let { retval} = res.data
            this.setData({
                ShareTemplate: retval.data
            })
        })

        // 通过二维码进来的有scene，
        if (scene) {
            let sceneLiveId = getQRcodeScene(scene, 'liveId')
            if (!liveId && sceneLiveId) {
                liveId = sceneLiveId
            }
        }
        // 从另一个小程序跳转过来会有referrerInfo，并liveId不在options中
        let {referrerInfo} = getApp()
        if (referrerInfo && !liveId) {
            let {extraData} = referrerInfo
            liveId = extraData.liveId
            this.setData({
                wxAppId: referrerInfo.appId
            })
        } else {
            this.setData({
                showColse: true
            })
        }
        if (!liveId) {
            wx.showToast({
                title: '直播间ID错误',
                icon: 'none',
                complete() {
                    if (!referrerInfo) {
                        setTimeout(() => {
                            wx.switchTab({
                                url: '/pages/home/index'
                            })
                        }, 1500)
                    }
                }
            })
            return false
        }
        this.setData({
            liveUrl: `https://3344.liveplay.myqcloud.com/live/3344_prod_${liveId}_900.flv`
        });
        /*判断分享进入记录*/
        wx.showLoading({
            title: '加载中……',
            icon: 'loading',
            mask: true
        })
        this.setData({uniqueFlag, laId})
        getAccessToken()
            .then(() => {
                wx.hideLoading()
                // 页面初始化
                this._init({liveId, showLiveList})
            })
            .catch((error) => {
                wx.showToast({
                    title: error.info || '网络异常',
                    icon: 'none'
                })
            })
        /*保持屏幕常亮*/
        if (wx.setKeepScreenOn) {
            wx.setKeepScreenOn({
                keepScreenOn: true
            });
        }
    },
    /**
     * [getIp 取IP地址，并传给服务端]
     */
    getIp() {
        let {uniqueFlag, laId} = this.data
        if (uniqueFlag) {
            wx.request({
                url: 'https://network.eelly.cn/ip.php',
                success(res) {
                    let {statusCode, data} = res

                    if (statusCode == 200 && data.ip) {
                        let systemInfo = wx.getSystemInfoSync()
                        let {brand, model, version, system, platform} = systemInfo
                        let clientInfo = JSON.stringify({
                            ip: data.ip,
                            brand,
                            model,
                            version,
                            system,
                            platform
                        })
                        eellyReq({
                            service: shareFeedback,
                            args: {
                                uniqueFlag,
                                laId,
                                type: '小程序进入',
                                clientInfo
                            }
                        })
                    } else {
                        reject({
                            type: 'getIp',
                            info: '网络异常'
                        })
                    }
                },
                fail(res) {
                    reject({
                        type: 'getIp',
                        info: '网络异常'
                    })
                }
            })

        }
    },
    /**
     * [_init description]
     * @param  {[type]} options.liveId       [description]
     * @param  {[type]} options.showLiveList [description]
     */
    _init({liveId, showLiveList}) {
        this.inintLiveRoomData(liveId);
        this.setData({
            isLiveMoreHide: !showLiveList,
            liveId, // 直播id
            liveWinHeight: wx.getSystemInfoSync().screenHeight - 245,// 获取窗口高度减去固定聊天框高度
            winHeight: wx.getSystemInfoSync().screenHeight,//获取设备高度
        });
        getAuth().then(res => {
            this.setData({
                isShareHide: res
            })
        }).catch(err => {

        })
    },
    /*TODO 初始化聊天室数据*/
    inintLiveRoomData(liveId, cb) {
        wx.showLoading({
            mask: true,
            title: '加载中...'
        });
        return Promise.all([this.getUserLiveRoomData(liveId), this.getGoodsListData(liveId)]).then(res => {
            let [roomInfo, goodsList] = res;
            wx.hideLoading();
            cb && cb(roomInfo);
            this.setData({
                roomInfo,  // 初始化房间信息
                defaultAnnouncement: roomInfo.defaultAnnouncement, // 初始化公告
                goodsList, // 初始化商品列表
                isConcern: roomInfo.isConcern,//是否关注
                RecommendGoodsInfo: roomInfo.goodsInfo,
                navTitle: roomInfo.title,
                isRecommend: Array.isArray(roomInfo.goodsInfo)
            }, () => {
                let {endTime, startTime} = this.data.roomInfo;
                let {isActivityShow} = this.data;
                let nowTime = Date.now() / 1000;
                let {isShare} = this.data, isShareArray = wx.getStorageSync('isShareArray');
                /*如果当前时间大于结束时间跳转到首页*/
                if (nowTime > endTime) {
                    if (referrerInfo) {
                        wx.showToast({
                            title: '直播已结束',
                            icon: 'none'
                        })
                    } else {
                        wx.switchTab({
                            url: '/pages/home/index'
                        })
                    }
                } else {
                    this.getIp()
                }
                /*判断活动开始按钮倒计时*/
                if (roomInfo.activity) {
                    this.setData({
                        activityInfo: roomInfo.activity
                    }, () => {
                        if (roomInfo.activity.activityRemainTime <= 10) {
                            this.showActivity();
                            this._activityCountDown(roomInfo.activity.activityRemainTime)
                        }
                    })
                }
                this.chatRoomInit(roomInfo);
                this.giftCountDown();
                this.setData({
                    newGoodsList: this.data.goodsList.filter(item => item.goodsId !== roomInfo.goodsInfo.goodsId),
                    giftHours: parseInt((endTime - startTime) / 60 / 60 % 24, 10)
                });
                /*优惠券*/
                eellyReqPromise({
                    service: getLiveRoomCoupon,
                    args: {
                        storeId: roomInfo.storeInfo.userId
                    }
                }).then(res => {
                    let couponList = res.data.retval.data;
                    couponList.forEach(item => {
                        item.btnTips = +item.stock ? '点击领取' : '已抢光';
                        item.couponValue = Math.abs(item.couponValue);
                        item.minAmount = Math.abs(item.minAmount);
                    });
                    if (!!isShareArray) {
                        isShare = !isShareArray.some(liveId => liveId === this.data.liveId)
                    } else {
                        isShare = true
                    }
                    this.setData({
                        couponList,
                        isShare
                    });
                });
            })

        }).catch(e => {
            wx.showToast({
                title: e.info,
                icon: 'none'
            })
        });


    },
    //获取商品列表
    getGoodsListData(liveId) {
        if (liveId) {
            return new Promise((resolve, reject) => {
                eellyReqPromise({
                    service: getGoodsServiceList,
                    args: {liveId}
                }).then((res) => {
                    let {status, retval} = res.data, goodsList = retval.data.goodsInfo;
                    if (status === 200) {
                        resolve(goodsList)
                    } else {
                        reject(status)
                    }
                }).catch(e => {
                    reject(e)
                })
            })
        }
    },
    getUserLiveRoomData(liveId) {
        return new Promise((resolve, reject) => {
            eellyReqPromise({
                login: wx.getStorageSync('user'),
                service: getLiveRoomInfo,
                args: {liveId}
            }).then(res => {
                let data = res.data;
                if (data.status === 200) {
                    let {defaultAnnouncement, liveRoomAddr, liveRoomId, orderCount, storeOrderNum, totalOnline, isConcern, goodsInfo, concernCount, storeInfo, shareInfo, endTime, startTime, activity, title} = data.retval.data;
                    let roomInfo = {
                        defaultAnnouncement,
                        liveRoomAddr,
                        liveRoomId,
                        orderCount,
                        storeOrderNum,
                        totalOnline,
                        goodsInfo,
                        concernCount,
                        storeInfo,
                        shareInfo,
                        endTime,
                        startTime,
                        isConcern,
                        activity,
                        title
                    };
                    resolve(roomInfo)
                }
            }).catch(e => {
                reject(e)
            });
        })
    },
    /* TODO 处理聊天室消息数据*/
    chatRoomInit(res) {
        let roomInfo, msgList, sId, isRecommend;
        let {orderCount, storeOrderNum, totalOnline, goodsInfo, concernCount, storeInfo, shareInfo, endTime, startTime} = res;
        let {liveRoomAddr, liveRoomId} = res;
        let account = wx.getStorageSync('neteaseIm');
        this.chatRoom = ChatRoom.getInstance({
            appKey: appKey,
            account: account.username || '',
            token: account.token || '',
            chatroomId: liveRoomId,
            chatroomAddresses: liveRoomAddr,
            onerror: onChatroomError,
            isAnonymous: account ? false : true,// 是否匿名登录
            chatroomNick: account ? '' : '游客' + Math.ceil(Math.random() * 10000),// 游客
            ondisconnect: onChatroomDisconnect,
            // 处理消息
            onmsgs: msgs => {
                let ranStr = this._randomString(200),
                    isSales = new RegExp(storeInfo.userId, 'gi');
                msgs.forEach((item) => {
                    item.idClient = ranStr + md5(item.idClient);
                    /*计算在线总数，拿货总数，点赞数*/
                    switch (true) {
                        case item.type === 'text' && isSales.test(item.from) ://判断是否商家
                            item.isSalesName = '商家';
                            item.isSales = true;
                            break;
                        case item.type === 'notification' && item.attach.type === 'memberEnter': // 判断进入直播间并增加心心
                            totalOnline = Number(totalOnline) + msgs.length;
                            item.text = '进入直播间准备买买买了';
                            // this.initHeart(1);

                            break;
                        case item.type === 'custom':   // 判断自定义消息   点赞  拿货  下订单  关注直播商家 并动态更新数据
                            let content = JSON.parse(item.content);

                            item.customType = content.type;
                            if (content.type === 'livePraise') {
                                //if (new RegExp(wx.getStorageSync('user').uid, 'gi').test(item.from)) return;
                                // this.initHeart(content.bodies.praiseNumber)
                            } else if(content.type==='liveGetCoupon'){
                                item.text =`抢到${this.data.couponprice}元直播券`

                            }else if (content.type === 'liveCartBarrage') {
                                item.text = '正在去买心仪的宝贝';
                            } else if (content.type === 'liveGoodsUpdate') {
                                let {goodsList, RecommendGoodsInfo} = this.data;
                                this.setData({
                                    RecommendGoodsInfo: content.bodies.goodsInfo,
                                    newGoodsList: goodsList.filter(item => item.goodsId !== content.bodies.goodsInfo.goodsId)
                                });
                            } else if (item.customType === 'liveOrderBarrage') {
                                orderCount = Number(orderCount) + msgs.length;
                                item.text = '抢到宝贝，剁手成功！'
                            } else if (content.type === 'liveConcern') {
                                item.text = '主播，我关注你啦';
                            } else if (content.type === 'liveShare') {
                                item.text = '我分享直播间了，邀请好友一起来看'
                            } else if (content.type === 'changeGoodsPrice') {
                                let {isChangeGoodsPriceHide} = this.data;
                                let changeGoodsShow = content.bodies.goodsId
                                content.bodies.goodsPrice = (content.bodies.goodsPrice / 100).toFixed(2);
                                item.changeGoods = content.bodies
                                isChangeGoodsPriceHide[changeGoodsShow] = false
                                this.setData({
                                    isChangeGoodsPriceHide
                                }, () => {
                                    isChangeGoodsPriceHide[changeGoodsShow] = true
                                    setTimeout(() => {
                                        this.setData({
                                            isChangeGoodsPriceHide
                                        })
                                    }, 14000)
                                })
                            } else if (content.type === 'activityCountdown') {  /* 活动*/
                                this.setData({
                                    activityInfo: content.bodies
                                }, () => {
                                    this.showActivity();
                                    this._activityCountDown(10)
                                })
                            } else if (content.type === 'liveCoupon') {  // 主播喊你领钱了
                                let {isRedBagShow, rebBagList} = this.data
                                this.setData({
                                    isRedBagShow: !isRedBagShow,
                                    rebBagList: content.bodies.couponValueList
                                })
                            }
                            //宝贝抢光弹幕
                            else if (content.type === 'liveGoodsSellOver') {
                                this.setData({
                                    isGoodsOver: true
                                })
                            }
                         
                            if (content.type === 'liveCartBarrage' || content.type === 'liveOrderBarrage') {
                                item.fromNick = this._hideName(item.fromNick);
                            }
                            break;

                        default:
                            break;
                    }
                });
                /*读取10条历史消息*/
                if (this.data.msgList <= 10) {
                    this.chatRoom.getHistoryMsgs({
                        timetag: (new Date().getTime() - 60000),
                        msgTypes: ['text'],
                        limit: 10,
                        done: (err, obj) => {
                            this.setData({
                                msgList: obj.msgs
                            })
                        }
                    })
                }

                if (msgs[msgs.length - 1].text === '进入直播间准备买买买了') {
                    let list = this.data.msgList.filter(item => item.text != '进入直播间准备买买买了')
                    msgList = [...list, msgs[msgs.length - 1]]
                } else {
                    msgList = [...this.data.msgList, ...msgs]; // 当前用户消息
                }

                roomInfo = {
                    orderCount,
                    storeOrderNum,
                    totalOnline,
                    concernCount,
                    storeInfo,
                    shareInfo,
                    endTime,
                    startTime
                };// 更新直播间信息
                sId = msgs[msgs.length - 1].idClient;// 记录用户消息滚动的Id
                isRecommend = Array.isArray(goodsInfo);
                this.setData({
                    roomInfo,
                    msgList,
                    sId,
                    isRecommend
                })
            }
        });

        function onChatroomDisconnect(error) {
            // 此时说明 `SDK` 处于断开状态, 开发者此时应该根据错误码提示相应的错误信息, 并且跳转到登录页面
            console.log('连接断开', error);
            if (error) {
                switch (error.code) {
                    // 账号或者密码错误, 请跳转到登录页面并提示错误
                    case 302:
                        break;
                    // 被踢, 请提示错误后跳转到登录页面
                    case 'kicked':
                        break;
                    default:
                        break;
                }
            }
        }

        function onChatroomError(error, obj) {
            console.log('发生错误', error, obj);
        }
    },
    /*TODO 直播视频逻辑  关注用户等 */
    showPop() {
        let {isShow, winHeight} = this.data;
        wx.createSelectorQuery().select('#userPop').boundingClientRect().exec((res) => {
            this.setData({
                isShow: !isShow,
                liveWinHeight: isShow ? winHeight - 245 : winHeight - res[0].height - 70
            });
        });
    },
    setConcern(event) {
        if (wx.getStorageSync('tokenKey')) {
            this._setConcern()
        } else {
            wx.showLoading({
                title: '加载中...'
            });
            app.eellyLoginBtn(event.detail)
                .then(() => {
                    this._repeatInintRoom((res) => {
                        let {isConcern} = res;
                        if (+isConcern) {
                            wx.showToast({
                                title: '你已关注过',
                                icon: 'none'
                            })
                        } else {
                            this._setConcern()
                        }
                    });
                })
                .catch(() => {
                    wx.showToast({
                        title: '你已拒绝授权',
                        icon: 'none'
                    })
                })
        }
    },
    /*关注用户操作*/
    _setConcern() {
        let {roomInfo, isConcern} = this.data;
        wx.showLoading({
            mask: true,
            title: +isConcern ? '取消关注...' : '正在关注...'
        });
        let data = [{
            user_type: 2,
            relat_user_id: roomInfo.storeInfo.userId,
            is_concern: +isConcern ? 0 : 1
        }];
        eellyReqPromise({
            login: true,
            service: setConcern,
            args: {data},
        }).then(res => {
            let {status} = res.data;
            if (status === 200) {
                wx.showToast({
                    title: +isConcern ? '已取消关注' : '关注成功',
                    icon: 'none'
                });
                if (isConcern === '1') {
                    this.setData({
                        isConcern: '0'
                    })
                } else {
                    this.setData({
                        isConcern: '1'
                    })
                }
            } else {
                wx.showToast({
                    title: +isConcern ? '关注失败' : '取消关注失败',
                    icon: 'none'
                })
            }
        }).catch(() => {
            wx.showToast({
                title: '服务器异常',
                icon: 'none'
            })
        })

    },
    /*计算点赞的心型动画*/
    initHeart(praise) {
        let delay = 0, {praiseList} = this.data;
        if (praiseList.length > 100) praiseList.length = 0;
        for (let i = 0; i < praise; i++) {
            let item = {
                src: colorArray[Math.floor(Math.random() * colorArray.length)],
                left: (Math.floor(Math.random() * 100)) + 'rpx',
                bottom: (Math.floor(Math.random() * 100)) + 'rpx',
                delay: delay + 'ms'
            };
            delay += 1000;
            praiseList.push(item)
        }
        this.setData({
            praiseList
        })
    },
    getHeart() {
        let {praiseList, liveId} = this.data;
        praiseList.push({
            src: colorArray[Math.floor(Math.random() * colorArray.length)],
            left: (Math.floor(Math.random() * 100)) + 'rpx',
            bottom: (Math.floor(Math.random() * 100)) + 'rpx',
        });
        this.setData({
            praiseList
        });
        eellyReqPromise({
            login: !!wx.getStorageSync('user'),
            service: addStatsPraise,
            args: {praise: 1, liveId}
        }).then(res => {
            let {status} = res.data;
            if (status !== 200) {
                wx.showToast({
                    title: '点赞失败',
                    icon: 'none'
                })
            }
        })
    },
    /*TODO 快捷问题弹窗*/
    questionListPop() {
        let {winHeight, isQuestionhide} = this.data;
        wx.createSelectorQuery().select('#QuestionPop').boundingClientRect().exec((res) => {
            this.setData({
                isQuestionhide: !isQuestionhide,
                liveWinHeight: isQuestionhide ? winHeight - 245 : winHeight - res[0].height - 70
            });
        });
    },
    /*取“快捷问题”的数据*/
    getQuestionList() {
        let {questionList, questionListLoading} = this.data;
        if (questionList.length <= 0 && !questionListLoading) {
            this.setData({
                questionListLoading: true
            })
            wx.showLoading({
                title: '加载中……'
            })
            /*加载快捷问题*/
            eellyReqPromise({
                service: getLiveQuickQuestion,
            }).then((res) => {
                wx.hideLoading()
                let resData = res.data
                let {data} = resData.retval
                if (resData.status == 200) {
                    this.setData({
                        questionList: data,
                        questionListLoading: false
                    })
                    this.questionListPop() //“快捷问题”出来的dom操作
                } else {
                    wx.showToast({
                        title: resData.info || '加载快捷问题失败',
                        icon: 'none'
                    })
                }

            }).catch(() => {
                this.setData({
                    questionList: data,
                    questionListLoading: false
                })
                wx.showToast({
                    title: '加载快捷问题失败',
                    icon: 'none'
                })
            });
        } else {
            this.questionListPop() //“快捷问题”出来的dom操作
        }
    },
    chatEditorSendFocus(event) {
        if (wx.getStorageSync('tokenKey')) {
            this._chatEditorSendFocus()
        } else {
            wx.showLoading({
                title: '加载中...'
            })
            app.eellyLoginBtn(event.detail)
                .then(() => {
                    this._repeatInintRoom(() => {
                        this._chatEditorSendFocus()
                    })
                })
                .catch(() => {
                    wx.showToast({
                        title: '你已拒绝授权',
                        icon: 'none'
                    })
                })
        }
    },

    /*TODO 发送消息逻辑*/
    _chatEditorSendFocus(e) {
        let {isQHide, isFocus, isQShow} = this.data;
        this.setData({
            isQHide: !isQHide,
            isFocus: !isFocus,
            isQShow: !isQShow
        })

    },
    getSendValue(e) {
        let textValue = e.detail.value;
        this.setData({textValue})
    },
    sendText(e) {
        let that = this, {questionitem} = e.currentTarget.dataset, {isQuestionhide, winHeight} = this.data;
        let msgValue = this.data.textValue || questionitem;
        if (msgValue) {
            this.chatRoom.sendText({
                text: msgValue,
                done(error, msg) {
                    if (!error) {
                        let sId;
                        let ranStr = that._randomString(200);
                        msg.idClient = ranStr + md5(msg.idClient);
                        sId = msg.idClient;
                        if (isQuestionhide) {
                            wx.createSelectorQuery().select('#QuestionPop').boundingClientRect().exec((res) => {
                                that.setData({
                                    isQuestionhide: !isQuestionhide,
                                    textValue: '',
                                    msgList: [...that.data.msgList, msg],
                                    sId,
                                    liveWinHeight: isQuestionhide ? winHeight - 245 : winHeight - res[0].height - 70
                                });
                            });
                        } else {
                            that.setData({
                                textValue: '',
                                msgList: [...that.data.msgList, msg],
                                sId,
                            })
                        }
                    } else {
                        wx.showToast({
                            title: '发送消息失败',
                            icon: 'none'
                        })
                    }
                }
            });
        } else {
            wx.showToast({
                title: '消息不能为空',
                icon: 'none'
            })
        }
    },
    /*TODO 分享领券 */
    /*读取优惠券*/
    showSharePop(event) {
        if (wx.getStorageSync('tokenKey')) {
            this._showSharePop()
        } else {
            wx.showLoading({
                title: '加载中...'
            });
            app.eellyLoginBtn(event.detail)
                .then(() => {
                    this._repeatInintRoom(() => {
                        this._showSharePop()
                    });
                })
                .catch((err) => {
                    wx.showToast({
                        title: err.info,
                        icon: 'none'
                    })
                })
        }
    },
    _showSharePop() {
        let {isShareShow, winHeight, isRedBagShow} = this.data;
        wx.createSelectorQuery().select('#sharePop').boundingClientRect().exec((res) => {
            this.setData({
                isRedBagShow: true,
                isShareShow: !isShareShow,
                liveWinHeight: isShareShow ? winHeight - 245 : winHeight - res[0].height - 70
            });
        });
    },
    /* 领取优惠券*/
    getCoupon(e) {
        let {keycode,couponprice} = e.currentTarget.dataset;
        let {liveId} = this.data;
        wx.showLoading({
            mask: true,
            title: '加载中...'
        });
        this.setData({
            couponprice
        })
        eellyReqPromise({
            login: true,
            service: receiveCoupon,
            args: {
                keycode,
                liveId
            }
        }).then(res => {
            wx.hideLoading();
            let data = res.data.retval.data;
            if (data.code === '400') {
                wx.showToast({
                    title: data.msg,
                    icon: 'none'
                });
            } else {
                wx.showToast({
                    title: '恭喜你，领取成功',
                    icon: 'none'
                });
            }
        }).catch(err => {
            wx.showToast({
                title: err.info,
                icon: 'none'
            });
        })
    },
    /*提醒主播设置优惠券*/
    setRemind() {
        let that = this, {isShareShow, winHeight} = this.data;
        eellyReqPromise({
            service: remindSetCoupon
        }).then(res => {
            let {content} = res.data.retval.data;
            this.chatRoom.sendText({
                text: content,
                done(error, msg) {
                    if (!error) {
                        let sId;
                        let ranStr = that._randomString(200);
                        msg.idClient = ranStr + md5(msg.idClient);
                        sId = msg.idClient;
                        that.setData({
                            msgList: [...that.data.msgList, msg],
                            sId,
                            isShareShow: false,
                            liveWinHeight: isShareShow ? winHeight - 245 : winHeight - res[0].height - 70
                        })
                    } else {
                        wx.showToast({
                            title: '发送消息失败',
                            icon: 'none'
                        })
                    }
                }
            });
        }).catch(err => {
            wx.showToast({
                title: err.info,
                icon: 'none'
            });
        })
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage(e) {
        let {shareInfo} = this.data.roomInfo, {liveId, couponList} = this.data;
        let laid = e.target ? e.target.dataset.laid : 0;
        let {uid} = wx.getStorageSync('user')
        let  {ShareTemplate} = this.data

        // 未登录时不发这个请求
        if (uid) {
            eellyReqPromise({
                service: usersShareCallback,
                args: {
                    fromUserId: wx.getStorageSync('user').uid,
                    liveId: liveId,
                    type: 4
                }
            })
        }
        if (e.from === 'button') {
            setTimeout(() => {
                this.setData({
                    isShare: false
                });
            }, 1000)
            let isShareArray = wx.getStorageSync('isShareArray');
            if (couponList.length) {
                if (!!isShareArray) {
                    isShareArray.push(liveId);
                    wx.setStorageSync('isShareArray', isShareArray);
                } else {
                    wx.setStorageSync('isShareArray', [liveId]);
                }
            }
        }
        /* 直播活动分享*/
        if (wx.getStorageSync('tokenKey')) {
            eellyReqPromise({
                login: true,
                service: getLiveShare,
                args: {
                    liveId,
                    uniqueFlag: shareInfo.uniqueFlag,
                    laId: laid,
                    type: '小程序-分享'
                }
            })
        }
        if (ShareTemplate.length) {
            return {
                title: ShareTemplate[0].content,
                imageUrl: ShareTemplate[0].image,
                path: `/pages/liveDetails/index?liveId=${liveId}&showLiveList=isShow&uniqueFlag=${shareInfo.uniqueFlag}&laId=${laid}`
            }
        }else {
            return {
                title: '衣服好漂亮、价格好划算，老板好大方！',
                path: `/pages/liveDetails/index?liveId=${liveId}&showLiveList=isShow&uniqueFlag=${shareInfo.uniqueFlag}&laId=${laid}`
            }
        }

    },
    /*TODO  立即下单*/
    showOrderPop(e) {
        let {winHeight, isOrderShow} = this.data, {goodsid, sort, ischange} = e.currentTarget.dataset;
        let showPop = () => {
            wx.createSelectorQuery().select('#orderPop').boundingClientRect().exec((dom) => {
                this.setData({
                    isOrderShow: !isOrderShow,
                    liveWinHeight: isOrderShow ? winHeight - 245 : winHeight - dom[0].height - 70,
                    orderSort: sort ? sort : ''
                });
            });
        };
        if (!goodsid && !sort) {
            showPop()
        } else {
            let userId = wx.getStorageSync('user').uid
            wx.showLoading({
                title: '加载中...',
                mask: true
            });
            eellyReqPromise({
                service: getGoodsSpecPrice,
                args: {
                    goodsId: goodsid,
                    userId: userId ? userId : ''
                }
            }).then(res => {
                wx.hideLoading();
                this.setData({
                    info: res.data.retval.data,
                    isChange: !!ischange,
                    currentSize: null,
                    currentColor: null,
                    num: 1,
                    currentStock: null,
                    disabled: {
                        color: [],
                        size: []
                    }
                }, () => {
                    showPop();
                    let {isSpelling, priceData} = this.data.info
                    let unitPrice = Number(isSpelling) ? price : priceData.priceRange[priceData.priceRange.length - 1].price;
                    this.setData({
                        unitPrice,
                        allPrice: (+unitPrice * 1000000 * this.data.num) / 1000000,
                    })
                })
            }).catch(err => {
                wx.showToast({
                    title: err.info,
                    icon: 'none'
                })
            })
        }
    },

    btnClick(e) {
        let target = e.currentTarget.dataset, {buttonType} = this.data;
        if (target.key == this.data[buttonType[target.type]]) return;
        this.setData({
            [buttonType[target.type]]: target.key,
            random: Math.random()
        });
        this.checkGoods(target.type, target.key)
    },
    /**
     * 检查库存
     */
    checkGoods(type, index) {
        let {info, currentSize, currentColor, disabled} = this.data;
        let {specs} = info;
        let specsObj = JSON.parse(specs);
        if (type == 'color') {
            disabled['size'] = [];
            this.setData({
                disabled
            });
            let j = 0;
            for (let i in specsObj[index + 1]) {
                let item = specsObj[index + 1][i];
                if (~~item[item.length - 1] < 1) {
                    disabled['size'][j] = true;
                    wx.showToast({
                        title: '已抢光',
                        icon: 'none'

                    })
                    this.setData({
                        disabled
                    })
                }
                j++;
            }

        } else {
            disabled['color'] = [];
            this.setData({
                disabled
            });
            info.colors.map((_item, _index) => {
                for (let i in specsObj[_index + 1]) {
                    let item = specsObj[_index + 1][i];
                    if (~~item[item.length - 1] < 1 && item[0] == info.sizes[index]) {
                        disabled['color'][_index] = true;
                        wx.showToast({
                            title: '已抢光',
                            icon: 'none'
                        })
                        this.setData({
                            disabled
                        })

                    }
                }
            })
        }
        if (currentSize !== null && currentColor !== null) {
            for (let i in specsObj[currentColor + 1]) {
                if (specsObj[currentColor + 1][i].includes(info.sizes[currentSize])) {
                    let tmp = specsObj[currentColor + 1][i];
                    this.setData({
                        currentStock: tmp[tmp.length - 1]
                    });
                    return;
                }
            }
        }
    },
    goOrder(event) {
        if (wx.getStorageSync('tokenKey')) {
            this._goOrder()
        } else {
            wx.showLoading({
                tilte: '加载中...'
            });
            app.eellyLoginBtn(event.detail)
                .then(() => {
                    this._repeatInintRoom(() => {
                        this._goOrder()
                    })
                })
                .catch(() => {
                    wx.showToast({
                        title: '你已拒绝授权',
                        icon: 'none'
                    })
                })
        }
    },
    _goOrder() {
        let {info, currentSize, currentColor, num, currentPriceType, isOrderShow, winHeight, liveId} = this.data

        let {specs} = info;
        let specsObj = JSON.parse(specs);
        for (let i in specsObj[currentColor + 1]) {
            let item = specsObj[currentColor + 1][i];
            if (item.includes(info.sizes[currentSize])) {
                this.setData({
                    specId: i
                })
            }
        }
        /*设置缓存并跳转*/
        wx.setStorage({
            key: 'payGoods',
            data: {
                liveId,
                goodsId: info.goodsId,
                quantity: num,
                // spelling: info.isSpelling * 1,
                spelling: 0,
                isLive: 1,
                specId: this.data.specId
            },
            success: () => {
                wx.createSelectorQuery().select('#orderPop').boundingClientRect().exec((dom) => {
                    this.setData({
                        isOrderShow: !isOrderShow,
                        liveWinHeight: isOrderShow ? winHeight - 245 : winHeight - dom[0].height - 70,
                    }, () => {
                        this.sotpLive();
                        wx.navigateTo({
                            url: `/money/pages/pay/index?goodsId=${info.goodsId}`
                        })
                    });
                })
            }
        });
    },
    orderAmount(e) {
        let {goodsLikeSetting} = this.data.info
        this.setData({
            num: e.detail,
            allPrice: (+this.data.unitPrice * 1000000 * e.detail) / 1000000
        })
        // 增加拼团商品限购
        if (goodsLikeSetting) {
            if (e.detail > goodsLikeSetting.limitNum) {
                wx.showToast({
                    title: `每单限购${goodsLikeSetting.limitNum}件`,
                    icon: 'none'
                })
                this.setData({
                    enabled: false
                })
            } else {
                this.setData({
                    enabled: true
                })
            }
        }
    },
    // 随机字符串生成滚动Id
    _randomString(len = 10) {
        let str = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz',
            maxPos = str.length,
            ranStr = '';
        Array.from({length: len}, () => {
            ranStr += str.charAt(Math.floor(Math.random() * maxPos));
        });
        return ranStr;
    },
    //隐藏多余名字
    _hideName(str) {
        let aStr = str.split(''), rs = '***';
        if (aStr.length > 2) {
            aStr.splice(1, aStr.length - 2, rs);
            return aStr.join('')
        } else {
            return str
        }
    },
    // 遇登录按钮重新初始化聊天室
    _repeatInintRoom(cb) {
        let {liveId} = this.data;
        this.chatRoom.disconnect();
        this.inintLiveRoomData(liveId, (res) => {
            cb && cb(res)
        })
    },
    /*TODO 视频播放状态*/
    statechange(e) {
        switch (e.detail.code) {
            case 2105:
                /*    wx.showToast({
                        title: '当前视频播放出现卡顿',
                        icon: 'none'
                    });*/
                break;
            case 2103:
                let {roomInfo} = this.data
                if (roomInfo) {
                    let {endTime = 0} = roomInfo;
                    let nowTime = Date.now() / 1000;
                    if (nowTime > endTime) {
                        if (referrerInfo) {
                            wx.showToast({
                                title: '直播已结束',
                                icon: 'none'
                            })
                        } else {
                            wx.switchTab({
                                url: '/pages/home/index'
                            })
                        }
                    }
                }

                /*  wx.showToast({
                      title: '正在尝试连接直播...',
                      icon: 'none'
                  });*/

                break;
            case 2004:
                /*    wx.showToast({
                        title: '直播结束',
                        icon: 'none'
                    });*/
                this.setData({
                    isVideoShow: false
                })
            case 2006:
            case 2007:
            case -2301:
            case -2302:
            case 3001:
            case 3002:
            case 3003:
            case 3005:
                this.setData({
                    isVideoShow: true
                })
            default:
                break;
        }


    },
    error(e) {
        console.error('live-player error:', e.detail.errMsg)
    },
    /*TODO 直播倒计时*/
    netstatus(e) {
        let {roomInfo} = this.data
        if (roomInfo) {
            let {endTime = 0} = roomInfo;
            let nowTime = Date.now() / 1000;
            if (nowTime >= (endTime - 600) && nowTime < endTime) {
                this.setData({
                    showTime: false,
                });
                this.countDown()
            }
        }
    },
    timer: null,
    countDown() {
        let {endTime = 0} = this.data.roomInfo, nowTime = Date.now() / 1000;
        let time = (endTime - nowTime) * 1000;
        if (time > 0) {
            time -= 1000;
            let s = parseInt((time / 1000) % 60),
                i = parseInt((time / 1000) / 60);
            if (i < 10) i = '0' + i;
            if (s < 10) s = '0' + s;
            this.setData({
                timeStr: `00 : ${i} : ${s} `
            });
        } else {
            this.setData({
                showTime: true
            });
            clearTimeout(this.timer);
            return
        }
        this.timer = setTimeout(() => this.countDown(time), 1000);
    },
    maskMove() {
        return
    },
    goStore(e) {
        let {storeid} = e.currentTarget.dataset, {isShow, winHeight} = this.data;
        wx.navigateTo({
            url: `/store/index/index?storeId=${storeid}`,
        })
        wx.createSelectorQuery().select('#orderPop').boundingClientRect().exec((dom) => {
            this.setData({
                isShow: !isShow,
                liveWinHeight: isShow ? winHeight - 245 : winHeight - dom[0].height - 70,
            });
        });
        this.ctx && this.sotpLive();
    },
    goLive() {
        wx.switchTab({
            url: '/pages/home/index'
        })
    },
    /*监听页面卸载退出聊天室*/
    sotpLive() {
        if (this.ctx) {
            this.ctx.stop({
                success(res) {
                    console.log(res)
                }
            })
        } else {
            return
        }

    },
    playLive() {
        if (this.ctx) {
            this.ctx.play({
                success(res) {

                }
            })
        } else {
            return
        }

    },
    onUnload() {
        this.chatRoom && this.chatRoom.disconnect();
    },
    onHide() {
        this.ctx && this.sotpLive();
    },
    onShow(options) {
        this.ctx && this.playLive()
    },
    /** 关闭直播间的dom制作 */
    colseLivePop() {
        let {isLiveLeaveShow, winHeight} = this.data
        wx.createSelectorQuery().select('#liveLeave').boundingClientRect().exec((dom) => {
            this.setData({
                isLiveLeaveShow: !isLiveLeaveShow,
                liveWinHeight: isLiveLeaveShow ? winHeight - 245 : winHeight - dom[0].height - 70,
            });
        });
    },
    /**
     * [colseLive 关闭直播间]
     */
    colseLive() {
        let {getRecommendsLiveLoading, recommendsLive} = this.data
        // 取推荐直播,在点击左上角"X"按钮离开直播间时调用
        if (!getRecommendsLiveLoading && recommendsLive.length <= 0) {
            this.setData({
                getRecommendsLiveLoading: true
            })
            // this.colseLivePop()    //关闭直播间的dom制作
            wx.showLoading({
                title: '加载中……'
            })
            eellyReqPromise({
                service: getRecommendsLive,
                args: {
                    liveId: this.data.liveId
                }
            }).then(res => {
                let resData = res.data
                let {status} = resData
                wx.hideLoading()
                if (status == 200) {
                    let {data} = resData.retval
                    this.setData({
                        recommendsLive: [...data],
                        // getRecommendsLiveError: '',
                        getRecommendsLiveLoading: false
                    })
                    this.colseLivePop()    //关闭直播间的dom制作
                } else {
                    this.setData({
                        recommendsLive: [...data],
                        // getRecommendsLiveError: '',
                        getRecommendsLiveLoading: false
                    });
                    wx.showToast({
                        title: error.info || '网络异常',
                        icon: 'none'
                    })
                }
            }).catch((error) => {
                wx.showToast({
                    title: resData.info || '网络异常',
                    icon: 'none'
                })
                this.setData({
                    // getRecommendsLiveError: error.info || '网络异常',
                    getRecommendsLiveLoading: false
                })
                this.colseLivePop()    //“关闭直播间”的dom制
            })
        } else {
            this.colseLivePop()    //“关闭直播间”的dom制作
        }

    },
    /* TODO 直播活动*/
    showGift() {
        let {isGiftShow, winHeight} = this.data;
        let uid = wx.getStorageSync('user').uid
        wx.createSelectorQuery().select('#isGift').boundingClientRect().exec((dom) => {
            this.setData({
                isGiftShow: !isGiftShow,
                liveWinHeight: isGiftShow ? winHeight - 245 : winHeight - dom[0].height - 70,
            }, () => {
                eellyReqPromise({
                    service: getLiveActivityDoor,
                    args: {
                        liveId: this.data.liveId,
                        userId: uid ? uid : 0
                    }
                }).then(res => {
                    let {status, retval} = res.data
                    if (status === 200) {
                        this.setData({
                            activityList: retval.data
                        })
                    }
                })
            });
        });

    },
    showActivity() {
        let {isActivityShow, winHeight} = this.data;
        wx.createSelectorQuery().select('#activity').boundingClientRect().exec((dom) => {
            this.setData({
                isActivityShow: !isActivityShow,
                liveWinHeight: isActivityShow ? winHeight - 245 : winHeight - dom[0].height - 70,
            });
        });

    },
    // 去首页
    goHome() {
        wx.switchTab({
            url: '/pages/home/index'
        })
    },
    giftCountDownTimer: null,
    giftCountDown() {
        let {endTime} = this.data.roomInfo;
        let time = (endTime - (new Date().getTime() / 1000)) * 1000;
        if (time > 0) {
            time -= 1000;
            let h = parseInt(time / 1000 / 60 / 60 % 24, 10), //计算剩余的小时
                m = parseInt(time / 1000 / 60 % 60, 10),//计算剩余的分钟
                s = parseInt(time / 1000 % 60, 10);//计算剩余的秒数
            this.setData({
                timeObj: {
                    h: h < 10 ? `0${h}` : h,
                    m: m < 10 ? `0${m}` : m,
                    s: s < 10 ? `0${s}` : s
                }
            })
        } else {
            clearTimeout(this.giftCountDownTimer)
            return
        }
        this.giftCountDownTimer = setTimeout(() => this.giftCountDown(), 1000);
    },
    /*活动倒计时*/
    activityCountDownTimer: null,
    _activityCountDown(time) {
        if (time > 0) {
            time--
            this.setData({
                activityTime: time
            })
        } else {
            this.setData({
                activityTime: '去分享',
                activityDisabled: false
            })
            clearTimeout(this.activityCountDownTimer)
            return;
        }
        this.activityCountDownTimer = setTimeout(() => this._activityCountDown(time), 1000)
    },
    // 去直播中心
    goLiveCenter() {
        wx.switchTab({
            url: '/pages/goodsList/index'
        })
    },
    // 关闭卖家改价
    closeChangeGoodsPrice(e) {
        let {goodsid} = e.currentTarget.dataset, {isChangeGoodsPriceHide} = this.data;
        isChangeGoodsPriceHide[goodsid] = true;
        this.setData({
            isChangeGoodsPriceHide
        })
    },
    // 主播喊你领钱
    closeRegBag() {
        let {isRedBagShow} = this.data
        this.setData({
            isRedBagShow: true
        })
    }
});