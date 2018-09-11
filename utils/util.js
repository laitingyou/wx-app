var utiles = {
    /**
     * [randomNum 取随机字符串]
     * @param  {[number]} arg [要取字符串的位数]
     * @return {[string]}     [返回随机的字符串]
     */
    randomNum: function (arg) {
        var chars = '0123456789abcdefhijkmnprstwxyzABCDEFGHJKMNPQRSTWXYZ',
            len = chars.length,
            str = '';
        for (var i = arg - 1; i >= 0; i--) {
            str += chars.charAt(Math.floor(Math.random() * len));
        }
        return str;
    },

    /**
     * [urlTo 页面跳转 防止页面栈超过10个无法使用，如果链接等于页面栈中的地址，就用 navigateBack]
     * @param  {[string]}  options.path  [要跳转的地址，必填。以 '/' 开头的全路径]
     * @param  {[object]}  options.query [要跳转页面的参数]
     * @param  {[string]}  options.type  [打开页面的方式navigateTo、redirectTo、reLaunchTo，默认redirectTo]
     */
    urlTo: function (options) {
        var current = options.current,
            query = options.query,
            path = options.path,
            newPath = query ? (path + '?' + utiles.param(query)) : path, //要跳转的路径
            allPage = getCurrentPages(), //页面栈
            type = (allPage >= 10 || !options.type) ? 'redirectTo' : options.type, // 打开方式
            pageArr = []; //从页面栈里取的路径
        for (let i = 0, leg = allPage.length; i < leg; i++) {
            let pageData = allPage[i].data,
                itemPath = (Object.keys(pageData.query).length > 0) ? (pageData.path + '?' + utiles.param(pageData.query)) : pageData.path;
            if (newPath == itemPath) { // 页面栈中含有这个页面就用 navigateBack 返回这个页面
                wx.navigateBack({
                    delta: leg - 1 - i
                });
                return false;
            }
        }
        wx[type]({
            url: path
        });
    },
    /**
     * [backTo 返回栈中的页面]
     * @param  {String} url [页面路径]
     */
    backTo(url){
        // 历史页面
        let page = getCurrentPages()
        let pageLength = page.length
        let delta = 1
        for (let i = 0; i < page.length; i++) {
            let item = page[i]
            if (item.route == url) {
                delta = pageLength - 1 - i
                if (delta < 1) {
                    delta = 1
                }
                break
            }
        }        
        wx.navigateBack({
            delta
        })
    },
    /**
     * [format 格式化时间]
     * @param  {number} date [毫秒数]
     * @param  {String} fmt  [要格式化的字符例如： yy-MM-dd hh:mm:ss]
     * @return {String}      [时间，如： 2018-9-10 10:20:20]
     */
    format(date, fmt) {
        if (!date.getMonth) {
            date = new Date(date)
        }
        let o = {
            "M+": date.getMonth() + 1,                 //月份
            "d+": date.getDate(),                    //日
            "h+": date.getHours(),                   //小时
            "m+": date.getMinutes(),                 //分
            "s+": date.getSeconds(),                 //秒
            "q+": Math.floor((date.getMonth() + 3) / 3), //季度
            "S": date.getMilliseconds()             //毫秒
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        for (let k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }
        return fmt;
    },
    /**
     * [trim 去除字符串首尾空格]
     * @param  {String} str [传入可以有首尾空格的字符串]
     * @return {String}     [返回去除首尾空格的字符串]
     */
    trim(str){
        return str.replace(/(^\s*)|(\s*$)/g,"") 
    },
    /**
     * [priceToString 把价格传为何留两位小数的字符串]
     * @param  {Number} price [价格]
     * @return {String}       [处理好的字符串]
     */
    priceToString(price){
        let priceArr = price.toString().split('.')
        if (priceArr.length > 1) {
            let decimals = priceArr[1] 
            if (decimals.length < 2) {
                return price + '0'
            } else {
                return price
            }
        } else {
            return price + '.00'
        }
    },
    /**
     * [createdTime 时间转换]
     * @param  {Number} value [时间]
     * @return {String}       [处理好的字符串]
     */
    createdTime (value) {
        let newD = new Date(), //今天
            newDVal = newD * 1,
            d_ms = value * 1000, //布发日期的毫秒数
            d = new Date(d_ms),
            dif = newDVal - d * 1, //今天与发布时间之差（毫秒数）
            backVal = '';

        if (dif < 1000 * 60) {
            backVal = (parseInt(dif / 1000) || 1) + '秒前';
        } else if (dif < 1000 * 60 * 60) {
            backVal = (parseInt(dif / (1000 * 60)) || 1) + '分钟前';
        } else if (dif < 1000 * 60 * 60 * 24) {
            backVal = (parseInt(dif / (1000 * 60 * 60)) || 1) + '小时前';
        } else if (dif < 1000 * 60 * 60 * 24 * 7) {
            backVal = (parseInt(dif / (1000 * 60 * 60 * 24)) || 1) + '天前';
        } else if (dif < 1000 * 60 * 60 * 24 * 7 * 4) {
            backVal = (parseInt(dif / (1000 * 60 * 60 * 24 * 7)) || 1) + '周前';
        } else if (dif < 1000 * 60 * 60 * 24 * 30) {
            backVal = '本月';
        } else if (dif < 1000 * 60 * 60 * 24 * 30 * 12) {
            backVal = (parseInt(dif / (1000 * 60 * 60 * 24 * 30)) || 1) + '月前';
        } else {
            backVal = d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日' + d.getHours() + '时' + d.getMinutes() + '分';
        }
        return backVal;
    },
    createdTimeRight (value) {
        let newD = new Date() * 1, //今天 毫秒数
            d = new Date(value * 1000) * 1, //发布时间 毫秒数
            hours = new Date().getHours(),
            minutes = new Date().getMinutes(),
            seconds = new Date().getSeconds(),
            backVal = '';

        let nowseconds = (hours * 60 * 60 + minutes * 60 + seconds) * 1000, //今天到昨天的秒数
            yesterday = newD - nowseconds,
            b_yesterday = newD - nowseconds - (24 * 60 * 60 * 1000),
            bb_yesterday = newD - nowseconds - (24 * 60 * 60 * 2 * 1000);
        if (yesterday < d) { //发布时间大于昨天的时间
            backVal = '今天';
        } else if (b_yesterday < d) {
            backVal = '昨天';
        } else if (bb_yesterday < d) {
            backVal = '前天';
        } else {
            backVal = '';
        }
        return backVal;
    }, 
    /**
     * [_countDown description]
     * @param  {number}   _time    [毫秒数]
     * @param  {Function} callback [回调，参数中可得到时分秒 hh，mm，ss]
     */
    _countDown(_time, callback){
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
            /*that.setData({
                timeText: `${hh}小时${mm}分${ss}秒`
            })*/
            callback && callback(hh, mm, ss)
            if (difference >= 1000) {
                _countDownSetTimeOut = setTimeout(()=>{
                    difference -= 1000
                    countDown()
                }, 1000)    
            }
        }
        countDown()
    },  
    /**
     * [getQRcodeScene 取二维码里的Scene参数]
     * @param  {String} url [二维码里的scene，必填]
     * @param  {String} key [要取值的key名，非改填]
     * @return {Object}     [不填key返回对象，填key返回它的vlue]
     */
    getQRcodeScene(scene, key){
        let str = decodeURIComponent(scene)
        let obj = {}
        let num = str.indexOf('?') + 1
        str = str.substr(num)
        let arr = str.split('&')
        for (let i = arr.length - 1; i >= 0; i--) {
            let item = arr[i]
            let hasValue = item.indexOf('=')
            if (hasValue > 0) {
                let itemArr = item.split('=')
                obj[itemArr[0]] = itemArr[1]
            } else {
                obj[item] = ''
            }
        }
        if (key) {
            return obj[key]
        } else {
            return obj
        }
    },
    routerTo(option , method = 'navigateTo') {
      let {url} = option.currentTarget.dataset
      wx[method]({
        url
      })
    },
    /**
     * [fillZero 价格补零]
     * @param  {Number} price [价格]
     * @return {String}       [补零后的字符串]
     */
    fillZero(price){
        let priceStr = price.toString()
        if (priceStr.indexOf('.') > -1) {
            let arr = priceStr.split('.')
            let num = arr[1]*1
            num = num < 10 ? num + "0" : num;
            return  `${arr[0]}.${num}`

        }else {
            return priceStr + '.00'
        }
    }
}
module.exports = utiles;