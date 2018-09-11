const { eellyReq, eellyReqPromise } = require("../../../../../utils/eellyReq")
const { addSubscribe } = require('../../../../../utils/interface/live')

const App = getApp()

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        item: {
            type: Object,
            value: {}
        }
    },
    /**
     * 组件的初始数据
     */
    data: {

    },
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    attached: function () {
        this.filterData()
    },
    moved: function () { },
    detached: function () { },
    /**
     * 组件的方法列表
     */
    methods: {
        filterData() {
            let { item } = this.properties
            let { liveId, image, title, userName, addressName, portraitUrl, storeId, isSubscribe, goodsCount, goodsList, scheduleTime } = item

            if (goodsList.length > 3) {
                goodsList.length = 3
            }
            let obj = { liveId, image, title, userName, addressName, portraitUrl, storeId, isSubscribe, goodsCount, goodsList, scheduleTime }
            obj.liveUrl = '/live/pages/liveGoods/index?liveId=' + liveId
            obj.day = this.getDateString(scheduleTime)
            obj.time = this.getTimeString(scheduleTime)
            this.setData(obj)
        },
        /**
         * [getDateString 传入秒数返回字符串“X月X日”]
         * @param  {number} second [秒数]
         * @return {string}        [description]
         */
        getDateString(second) {
            let newDate = new Date(second * 1000)
            return `${newDate.getMonth() + 1}月${newDate.getDate()}日`
        },
        /**
         * [getDateString 传入秒数返回字符串“X时X日”]
         * @param  {number} second [秒数]
         * @return {string}        [description]
         */
        getTimeString(second) {
            let _newDate = new Date(second * 1000),
                _hour = _newDate.getHours(),
                _minute = _newDate.getMinutes(),
                str = (_hour > 9 ? _hour : '0' + _hour) + ':' + (_minute > 9 ? _minute : '0' + _minute) + '开播';
            return str;
        },
        // 点击订阅
        _clickAddSubscribe(event){
            App.eellyLoginBtn(event.detail)
                .then((res)=>{
                    this._addSubscribe()
                })
                .catch((error) => {                    
                    wx.showToast({
                        title: error.info || '网络异常',
                        icon: 'none'
                    })
                })
        },
        // 订阅        
        _addSubscribe() {
            let that = this
            let { liveId } = this.data
            wx.showLoading({
                mask: true,
                title: '加载中……'
            })
            
            eellyReqPromise({
                service: addSubscribe,
                args: { liveId },
                login: true
            })
                .then((res) => {
                    wx.hideLoading()
                    let { status, info, retval } = res.data
                    if (status == 200 && retval) {
                        that.setData({
                            isSubscribe: true
                        })
                        wx.showToast({
                            title: '订阅成功',
                            icon: 'success',
                            duration: 2500
                        })
                    } else if (status != 701 || status != 707 || status != 708) {
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
        },
        // 判断到预告页还是直播
        _goToLive(){
            let {liveId, scheduleTime} = this.data
            let liveUrl = '/live/pages/liveGoods/index?liveId=' + liveId
            // 直播已开始
            if (Date.now()/1000 >= scheduleTime*1) {
                liveUrl = '/pages/liveDetails/index?liveId=' + liveId
            } 
            wx.navigateTo({
                url: liveUrl,
            })
        }
    }
})