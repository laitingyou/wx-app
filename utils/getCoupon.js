const {getMinUserCouponList} =require('./interface/preferential')
/**
 * 获取优惠券信息，每次请求都会跑这个函数
 * @param r   请求函数
 * @param c    回调函数
 */
let getCoupon=function (r,c,page=1,limit=1) {
    //判断是否登录了，登录了就直接请求，否则不做处理
    if(wx.getStorageSync('user')){
        r({
            service:getMinUserCouponList,
            args:{
                userId:wx.getStorageSync('user').uid,
                page,
                limit
            },
            success(res){
                if(res.data.status==200){
                    let {data}=res.data.retval.data;
                    if(data.couponNum==0) return
                    wx.setTabBarBadge({
                        index: 2,
                        text: data.couponNum+'张'
                    })
                    wx.setStorageSync('couponInfo', data)
                    c&&c(data)
                }

            }
        })
    }

}
module.exports={
    getCoupon
}