const {host} = require('../../../utils/config')
const {_countDown} = require('../../../utils/util')
Page({
    /**
     * 页面的初始数据
     */
    data: {
        monDataTotal: 1, //总页数
        monDataLoading: false, 
        monDataPage: 1,
        monDataEnd: false,
        monData: [],
        wedDataTotal: 1, //总页数
        wedDataLoading: false,
        wedDataPage: 1,
        wedDataEnd: false,
        wedData: [],
        type: 1,
        endTime: 0,
        monStartTime: '',
        wedStartTime: '',
        hh: '00',
        mm: '00',
        ss: '00'
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        let that = this
        this.getBanner() //取横幅
        this.getList({
            page: 1
        })
        this.getList2({
            page: 1
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {


    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {
        
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {
        this._init()
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    },   
    /*触底加载*/
    onReachBottom(){
        let {type, monDataPage, wedDataPage} = this.data
        if (type == 1) {
            this.getList({page: monDataPage})
        } else {
            this.getList2({page: wedDataPage})
        }
    },
    /** 取banner图 */
    getBanner(){
        let that = this
        wx.request({
            url: `https://www.eelly.${host}/index.php`, //仅为示例，并非真实的接口地址
            data: {
                app: 'activity',
                act: 'getClearanceAdvert'
            },
            header: {
                'content-type': 'application/json' // 默认值
            },
            success(res) {
                let {data} = res
                data = data.replace(/^\(([\s\S]*)\)$/, "$1")
                data = JSON.parse(data)
                that.setData({
                    banner: data.image || ''
                })
            }
        })
    },
    // 切换选项卡
    changeType(){
        let {type} = this.data
        this.setData({
            type: (type == 1) ? 2 : 1
        })
    },
    /**
     * [activityStart 算出是星期几和时间]
     * @param  {Number} time [毫秒数]
     * @return {String}      [星期几和几时]
     */
    activityStart(time) {
        let date = new Date(time);
        let weekday = date.getDay();
        let Hours = date.getHours();
        let week = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
        let week_day = week[weekday];
        return (week_day + Hours + ":00")
    },
    /**/
    getList({page = 1}){ 
        let {monDataTotal, monDataLoading} = this.data
        let that = this
        if (this.data.monDataLoading || page > monDataTotal) {
            return false
        }   
        this.setData({
            monDataLoading: true
        })

        wx.request({
            url: `https://www.eelly.${host}/index.php`, //
            data: {
                app: 'activity',
                act: 'tenClearanceInterface',
                page_per: 10,
                type: 1,
                page
            },
            header: {
                'content-type': 'application/json' // 默认值
            },
            success(res) {
                let {data} = res
                if (data == '([])') {
                    that.setData({
                        monDataEnd: true
                    })
                    return false
                }
                data = data.replace(/^\(([\s\S]*)\)$/, "$1")
                data = JSON.parse(data)                
                let {goods_list, start_time, end_time, total} = data                
                let {endTime, monStartTime} = that.data
                if (!monStartTime) {
                    that.setData({
                        monStartTime: that.activityStart(start_time * 1000)
                    })
                }
                if (!endTime && end_time) {
                    _countDown(end_time * 1000, function(hh, mm, ss){
                        that.setData({hh, mm, ss})
                    })
                }
                let {monData} = that.data
                if (goods_list.length <= 0) {
                    that.setData({
                        monDataEnd: true
                    })
                } else {
                    goods_list.map(function(item) {
                        item.price = item.price.replace(/\&yen;/, '')
                        item.goodsId = item.goods_url.match(/([0-9]+)(?=\.html)/g)
                        return item;
                    })
                    monData = [...monData, ...goods_list]
                    that.setData({                    
                        monDataPage: page + 1,
                        monData,
                        monDataTotal: total
                    })    
                }
            },
            fail(){
                wx.showToast({
                    icon: 'none',
                    title: '网络异常'
                })
            },
            complete(){                
                that.setData({
                    monDataLoading: false
                })
            }
        })
    },
    getList2({page = 1}){ 
        let {wedDataTotal, wedDataLoading} = this.data
        let that = this
        if (this.data.wedDataLoading || page > wedDataTotal) {
            return false
        }   
        this.setData({
            wedDataLoading: true
        })        

        wx.request({
            url: `https://www.eelly.${host}/index.php`, //仅为示例，并非真实的接口地址
            data: {
                app: 'activity',
                act: 'tenClearanceInterface',
                page_per: 10,
                type: 2,
                page
            },
            header: {
                'content-type': 'application/json' // 默认值
            },
            success(res) {
                let {data} = res
                if (data == '([])') {
                    that.setData({
                        wedDataEnd: true
                    })
                    return false
                }
                data = data.replace(/^\(([\s\S]*)\)$/, "$1")
                data = JSON.parse(data)
                let {goods_list, start_time, end_time, total} = data
                let {startTime, endTime} = that.data                               
                let {wedData, wedStartTime} = that.data
                if (!wedStartTime) {
                    that.setData({
                        wedStartTime: that.activityStart(start_time * 1000)
                    })
                }
                if (goods_list.length <= 0) {
                    that.setData({
                        wedDataEnd: true
                    })
                } else {
                    goods_list.map(function(item) {
                        item.price = item.price.replace(/\&yen;/, '')
                        item.goodsId = item.goods_url.match(/([0-9]+)(?=\.html)/g)
                        return item;
                    })
                    wedData = [...wedData, ...goods_list]
                    that.setData({
                        wedDataLoading: false,
                        wedDataPage: page + 1,
                        wedData,
                        wedDataTotal: total
                    })
                }
            },
            fail(){
                wx.showToast({
                    icon: 'none',
                    title: '网络异常'
                })
            },
            complete(){                
                that.setData({
                    wedDataLoading: false
                })                
            }
        })
    },
    
})