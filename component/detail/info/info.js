// pages/goods/component/gooInfo/goodsInfo.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    info: {
      type: 'Object',
      default: {}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },
  // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
  attached: function() {
    this.filterData()
    // 设置价格和倒计时
    this.setPriceAndTime()
  },
  moved: function() {},
  detached: function() {},
  /**
   * 组件的方法列表
   */
  methods: {
    // 过滤并处理数据，把字符串传成数组如“1”传成1,
    /**
     * filterData 过滤并处理数据，
     * 把字符串传成数组如“1”传成1
     * 判断店铺是否关闭，商品是否下架 
     */
    filterData() {
      let {
        ifShow,
        closed,
        isSupplier,
        goodsName,
        unit
      } = this.properties.info
      let newInfo = {
        lockUpText: (function(){ 
          switch (closed) { // 店铺状态 店铺状态(0=正常，1=禁售，2=店铺关闭，3=店铺挂起，4=店铺暂停营业)
            case '1':
              return '对不起，该商品已经禁售';
              break;
            case '2':
              return '对不起，该店铺关闭';
              break;
            case '3':
              return '店铺挂起';
              break;
            case '4':
              return '店铺暂停营业';
              break;
            default:
              //没有处理
          }
          switch (ifShow) { // (0 下架 1 上架 2 自动下架 3 等待上架 4 自动上架 5 卖家已删除)
            case '0':
            case '2':
              return '对不起，该商品已经下架';
              break;
            case '3':
              return '对不起，该商品正等待上架';
              break;
            case '5':
              return '对不起，该商品卖家已删除';
              break;
            default:
              return null;
          }
        })(),
        closed: closed * 1,
        isSupplier: (isSupplier == '1') ? true : false,
        goodsName,
        unit
      }
      this.setData({ ...newInfo
      })
    },
    // 设置产品价格和活动时间
    setPriceAndTime() {
      let { priceData } = this.properties.info
      let { price_detail, priceRange } = priceData
      // 活动倒计时
      let expireTime = 0
      //如果有活动
      if (price_detail) {
        //活动的剩余时间
        let expireTime = price_detail.expire_time;
        // 运行倒计时 
        this.changeExpireTime(expireTime)
        let oldPriceDate = (function() {
          if (priceRange.length > 1) {
            var temporaryArr = []; //临时数组
            for (var i = priceRange.length - 1; i >= 0; i--) {
              temporaryArr.push(priceRange[i].price);
            }
            return '￥' + Math.min.apply(null, temporaryArr) + '-' + Math.max.apply(null, temporaryArr);
          } else {
            return '￥' + priceRange[0].price
          }
        })();
        //原价                        
        this.setData({
          priceData: [{
            "price": priceDetail.price,
            "show": priceRange[0].show || 1
          }],
          oldPriceDate: oldPriceDate
        });
      } else {
        // 没有活动价格取原价
        this.setData({
          priceData: priceRange, //价格数据
        })
      }
    },
    /**
     * [changeExpireTime 活动剩余时间]
     * @param  {[number]} timeDate [秒数]
     * @return {[string]}          [倒计时文字]
     */
    changeExpireTime: function(timeDate) {
      var that = this,
        newTimeDate = timeDate,
        fun;

      function checkTime(i) { //个单数补0   
        return i < 10 ? "0" + i : i;
      };

      function timeFun() {
        var dd = parseInt(newTimeDate / 60 / 60 / 24, 10), //计算剩余的天数  
          hh = parseInt(newTimeDate / 60 / 60 % 24, 10), //计算剩余的小时数  
          mm = parseInt(newTimeDate / 60 % 60, 10), //计算剩余的分钟数  
          ss = parseInt(newTimeDate % 60, 10); //计算剩余的秒数 

        dd = checkTime(dd);
        hh = checkTime(hh);
        mm = checkTime(mm);
        ss = checkTime(ss);
        that.setData({
          expireTime: newTimeDate,
          expireTimeText: '剩余时间' + dd + '天' + hh + '小时' + mm + '分钟' + ss + '秒'
        });
        if (newTimeDate < 1000) {
          clearTimeout(timeFun);
          return false;
        }
        newTimeDate -= 1;
        fun = setTimeout(function() {
          timeFun();
        }, 1000);
      };
      timeFun();
    },
  }
})