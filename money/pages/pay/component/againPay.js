const {eellyPay} = require("../../../../utils/eellyPay")

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        show: {
            type: Boolean,
            value: false
        },
        price: {
            type: String,
            value: '' 
        },
        coupon: {
            type: String,
            value: '' 
        },
        order: {
            type: Array,
            value: [] 
        },
        time: {
            type: Number,
            value: 0 
        } 
    },
    /**
     * 组件的初始数据
     */
    data: {
        loading: false
    },
    created() {

    },
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    attached() {
        let {show, price, coupon, order, time} = this.properties        
        this.setData({
            show,
            coupon: coupon*1 || 0
        })        
        if (time) {
            /*this.setData({
                _time: time + 86400000
            })*/
            this._countDown(time + 86400000)
        } else {
            this.setData({
                timeText: '24小时'
            })
        }
    },
    moved() {

    },
    detached() {

    },
    ready() {

    },
    /**
     * 组件的方法列表
     */
    methods: {
        /**
         * [successLeave 支付成功后页面跳转]
         * @param  {Number} roderId [订单ID必转]
         */
        successLeave(roderId){
            if (roderId) {
                let payGoods = wx.getStorageSync('payGoods')
                let {spelling} = payGoods
                if (spelling) {
                    // 跳转到“集赞”页
                    wx.redirectTo({
                        url: '/pages/praise/index?orderId='+ roderId 
                    })    
                } else {
                    // 跳转到“订单”页
                    wx.redirectTo({
                        url: '/money/pages/orderDetails/index?orderId='+ roderId 
                    })
                }
            }
        },
        _countDown(_time){
            let _countDownSetTimeOut =  null            
            let difference = _time - new Date()*1
            let that = this
            /**
             * [checkTime 不足两位的前面补0]
             * @param  {Number} i []
             * @return {String}   []
             */        
            function checkTime(i){  
                return i < 10 ? "0" + i : i;
            }
            function countDown(){
                let hh = checkTime(parseInt(difference / 1000 / 60 / 60 % 24, 10)) , //计算剩余的小时数  
                    mm = checkTime(parseInt(difference / 1000 / 60 % 60, 10)) ,      //计算剩余的分钟数  
                    ss = checkTime(parseInt(difference / 1000 % 60, 10)) ;           //计算剩余的秒数  
                that.setData({
                    timeText: `${hh}小时${mm}分${ss}秒`
                })
                if (difference >= 1000) {
                    _countDownSetTimeOut = setTimeout(()=>{
                        difference -= 1000
                        countDown()
                    }, 1000)    
                }
            }
            countDown()
        },
        _colse(){
            this.setData({
                show: false
            })
            clearTimeout(this._countDownSetTimeOut)
        }
    }
})