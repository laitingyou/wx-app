module.exports = {
  /*获取优惠券*/
  getMinUserCouponList: {
    service_name: 'Active\\Service\\Coupon\\CouponService',
    method: 'getMinUserCouponList'

  },
  getAppletUserCouponList: {
    service_name: 'Active\\Service\\Coupon\\CouponService',
    method: 'getAppletUserCouponList'
  },
  /*签到*/
  getMinRedPackage: {
    service_name: 'Active\\Service\\Coupon\\CouponService',
    method: 'getMinRedPackage'
  },
  /* 优惠券基本信息*/
  getCouponSummaryData: {
    service_name: 'Active\\Service\\Coupon\\CouponService',
    method: 'getCouponSummaryData'
  }

}