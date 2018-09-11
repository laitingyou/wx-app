const {eellyReqPromise} = require('../../../utils/eellyReq');
const {eellyPay} = require("../../../utils/eellyPay");

Page({


    data: {
        queryData: null
    },
     //仅退款
    goAfterSale(e){
        let {orderId,price,franking,flag} = this.data.queryData
        let {type} = e.currentTarget.dataset
        wx.navigateTo({
            url: `/money/pages/afterSale/index?orderId=${orderId}&price=${price}&type=${type}&franking=${franking}&flag=${flag}`
        })
    },
    onLoad(options) {
        this.setData({
            queryData : options
        })
    },

});