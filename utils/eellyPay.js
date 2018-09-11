let {getPayOrderData, orderGoPay, sendSuccessOrder} = require('./interface/pay')

const { eellyReq, eellyReqPromise } = require("./eellyReq")


/**
 * [createOrder 创建订单]
 * 接口文本地址
 * https://servicemanage.eelly.test/common/index/view?node=842
 * @param  {Object} args []
 * @param  {Array}  args.goods [商品信息]
 * @param  {Number} args.goods.goodsId  [商品ID]
 * @param  {Number} args.goods.quantity [商品数量]
 * @param  {Number} args.goods.specId   [商品规格]
 * @param  {Object} args.userInfo               [用户信息]
 * @param  {Number} args.userInfo.addressId     [地址ID]
 * @param  {Number} args.userInfo.shippingId    [快递模板ID]
 * @param  {Number} args.userInfo.expressSelect [选择快递类型]
 * @param  {Number} args.userInfo.expressType   [是否可以到付,需要判断店铺是否设置了到付]
 * @param  {Number} args.couponsId [优惠券ID]
 * @param  {String} args.remark      [留言]
 * @param  {String} args.fromFlag    [支付来源]
 * @return {Funciton}  [Promise]
 */
function createOrder(args){    
    return new Promise((resolve, reject)=>{              
        eellyReqPromise({
            login: true,
            service: getPayOrderData,
            args: {
                data: args
            }
        })
        .then((res)=>{
            let {status, info, retval} = res.data
            if (status == 200) {    
                let {data, orderSns, billNo, orderIds} = retval.data.result
                resolve({data, orderSns, billNo, orderIds})                
            } else {
                reject({
                    type: 'getPayOrderDataFun',
                    info: info || '网络异常'
                })
            }
        })
        .catch((error)=>{   
            reject({
                type: 'getPayOrderDataFun',
                info: error.info || '支付失败'
            })
        })
    })
}
/**
 * [wxPay 微信支付]
 * @param  {Object} args         [所需参数]
 * @param  {Object} args.data    [微信支付参数]
 * @param  {Array}  args.orderSns [订单号]
 * @param  {Object} args.billNo  [交易号]
 * @return {Function}      [Promise]
 */
function wxPay(args){
    return new Promise((resolve, reject)=>{
        let {data, orderSns, billNo, orderIds} = args
        wx.requestPayment({
            ...data,
            success(res){
                // orderSns, billNo留给接口“校验订单是否完成”接口使用
                resolve({orderSns, billNo, orderIds})
                // 服务端懒，要求客户端发请求告诉它，已支付成功。
                eellyReq({
                    service: sendSuccessOrder,
                    args: {orderId: orderIds[0]} 
                })
            },
            fail(res){                
                let {errMsg} = res
                let info = '支付失败，请联系客服'
                let type = 'eellyPay'
                if (errMsg == 'requestPayment:fail cancel') {
                    type="giveUpPay"
                    info = '您已取消支付'
                }
                reject({
                    type,
                    info,
                    orderSns
                })
            }
        })    
    })    
}

/**
 * [createEellyPay 新建订单并支付]
 * 接口文本地址
 * https://servicemanage.eelly.test/common/index/view?node=842
 * @param  {Object} args []
 * @param  {Array}  args.goods [商品信息]
 * @param  {Number} args.goods.goodsId  [商品ID]
 * @param  {Number} args.goods.quantity [商品数量]
 * @param  {Number} args.goods.specId   [商品规格]
 * @param  {Object} args.userInfo               [用户信息]
 * @param  {Number} args.userInfo.addressId     [地址ID]
 * @param  {Number} args.userInfo.shippingId    [快递模板ID]
 * @param  {Number} args.userInfo.expressSelect [选择快递类型]
 * @param  {Number} args.userInfo.expressType   [是否可以到付,需要判断店铺是否设置了到付]
 * @param  {Number} args.couponsId      [优惠券ID]
 * @param  {String} args.remark      [留言]
 * @param  {String} args.fromFlag    [支付来源]
 * @return {Funciton}  [Promise]
 */
function createEellyPay(args){    
    return createOrder(args)
        .then((res)=>{             
            return wxPay(res)
        })
        /*.then((res)=>{
            return eellyCheckOrder(res)
        })*/
}

/**
 * [getEellyPay 传入订单编号，取得微信支付所要的数据]
 * @param  {Array}  orderSns  [订单编号]
 * @param  {Number} fromFlag  []
 */
function getEellyPay(orderSns, fromFlag){
    return new Promise((resolve, reject)=>{   
        let args = {
            orderSns
        }     
        if (fromFlag) {
            args.fromFlag = fromFlag
        }      
        eellyReqPromise({
            login: true,
            service: orderGoPay,
            args
        })
        .then((res)=>{
            let {status, info, retval} = res.data
            if (status == 200) {    
                let {data, orderSns, billNo, orderIds} = retval.data.result
                resolve({data, orderSns, billNo, orderIds})
            } else if(status != 707 || status != 708) {
                reject({
                    type: 'getEellyPay',
                    info: info || '网络异常'
                })
            }
        })
        .catch((error)=>{            
            reject({
                type: 'getEellyPay',
                info: '支付失败'
            })
        })
    })
}

/**
 * [eellyPay 传入订单编号，取得微信支付所要的数据]
 * @param  {Array} orderSns [订单编号]
 * @param  {Number} fromFlag  []
 */
function eellyPay(orderSns, fromFlag) {
    return getEellyPay(orderSns, fromFlag)
        .then((res)=>{             
            return wxPay(res)
        })
}

module.exports = { createEellyPay, eellyPay}