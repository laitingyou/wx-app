const {eellyReqPromise} = require("../../utils/eellyReq")
const {addSubscribe} = require('../../utils/interface/live')
const {sendFromId} = require('../../utils/formId')
const {format} = require('../../utils/util')
const App = getApp()

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        item: {
            type: Object,
            value: {}
        },
        isShow: {
            type: Boolean,
            value: false
        }
    },
    externalClasses: ['onePending'],
    /**
     * 组件的初始数据
     */
    data: {},
    attached() {
        let {item} = this.properties
        item.time = format(new Date(item.scheduleTime * 1000), 'MM月dd')
        this.setData(item)
    },
    /**
     * 组件的方法列表
     */
    methods: {
        /**
         * [getDateString 传入秒数返回字符串“X时X日”]
         * @param  {number} second [秒数]
         * @return {string}        [description]
         */
        getTimeString(second) {
            let _newDate = new Date(second * 1000),
                _hour = _newDate.getHours(),
                _minute = _newDate.getMinutes(),
                str = (_hour > 9 ? _hour : '0' + _hour) + ':' + (_minute > 9 ? _minute : '0' + _minute);

            return str;
        },
        // 判断到预告页还是直播
        _goToLive() {
            let {liveId, scheduleTime} = this.data
            let liveUrl = '/live/pages/liveGoods/index?liveId=' + liveId
            // 直播已开始
            /*if (Date.now()/1000 >= scheduleTime*1) {
                liveUrl = '/pages/liveDetails/index?liveId=' + liveId
            } */
            wx.navigateTo({
                url: liveUrl,
            })
        },
        // 点击订阅
        _clickAddSubscribe(event) {
            if (this.data.isSubscribe) {
                return false
            }
            App.eellyLoginBtn(event.detail)
                .then((res) => {
                    this._addSubscribe()
                })
                .catch((error) => {
                    wx.showToast({
                        title: error.info || '网络异常',
                        icon: 'none'
                    })
                })
        },
        // 存formId
        _formSubmit(event) {
            this.setData({
                formId: event.detail.formId
            })
        },
        // 订阅        
        _addSubscribe() {
            let that = this
            let {liveId, formId} = this.data
            wx.showLoading({
                mask: true,
                title: '加载中……'
            })

            eellyReqPromise({
                service: addSubscribe,
                args: {liveId},
                login: true
            })
                .then((res) => {
                    wx.hideLoading()
                    let {status, info, retval} = res.data
                    if (status == 200 && retval) {
                        that.setData({
                            isSubscribe: true
                        })
                        wx.showToast({
                            title: '订阅成功',
                            icon: 'success',
                            duration: 2500
                        })
                        // 给服务端发formId
                        sendFromId(formId)
                            .then((res) => {
                                this.setData({
                                    formId: ''
                                })
                            })
                    } else {
                        wx.showToast({
                            title: info,
                            icon: 'none',
                            duration: 2500
                        })
                    }
                })
                .catch((error) => {
                    wx.hideLoading()
                    wx.showToast({
                        title: '网络异常',
                        icon: 'none',
                        duration: 2500
                    })
                })
        }
    }
})
