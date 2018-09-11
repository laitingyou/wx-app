Component({
    /**
     * 组件的属性列表
     */
    properties: {
        list: {
            type: Array,
            value: []
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        adListTitle: '',
        adListIndex: 1,
        adList: [],
        // 开始触屏的位置，用于判断触屏是否向左滑以启动运画
        startClientX: 0,
        // 动画结束次数，用于判断三个动完是否都结束
        animationEndTime: 0,
        // 动画已停止
        isNotAnimation: true
    },
    attached() {
        let {
            list
        } = this.properties
        let that = this
        // 数据要3条多余的去掉，少的复制第一个
        let listLength = list.length         
        if (listLength > 0) {
            let adList = []
            for (let i = 0; i <= 2; i++) {
                let item = list[i] || {...list[0]}
                item.animationClassName = ''
                item.num = i + 1                
                adList.push(item)
            }  
            this.setData({
                adList,
                adListTitle: adList[0].title
            })            
            setTimeout(()=>{
                this.autoPlay() //自动播放
            }, 3000)  
        }
                       
    },
    /**
     * 组件的方法列表
     */
    methods: {
        autoPlayFun: null,
        autoPlay() {
            let {
                adList,
                isNotAnimation
            } = this.data
            if (isNotAnimation) {
                adList.map(function(item, index) {
                    item.animationClassName = 'adAnimation' + index                
                    return item;
                })
                this.setData({
                    adList
                })    
            }
            
        },
        /**
         * [bindStart 手指触摸动作开始]
         * 
         */
        bindStart(event) {
            let {
                clientX
            } = event.changedTouches[0]
            this.setData({
                startClientX: clientX
            })
        },
        /**
         * [bindEnd 手指触摸动作结束]
         * 
         */
        bindEnd(event) {
            let {
                clientX
            } = event.changedTouches[0]
            let {
                startClientX,
                animationEndTime,
                adList
            } = this.data
            // 动画未进行或已停止
            let isNotAnimation = (animationEndTime == 0 || animationEndTime >= adList.length)
            // x轴移动距离
            let distanceX = startClientX - clientX
            if (distanceX > 35 && isNotAnimation) {
                clearTimeout(this.autoPlayFun)
                adList.map(function(item, index) {
                    item.animationClassName = 'adAnimation' + index
                    return item
                })
                this.setData({
                    adList,
                    isNotAnimation: false
                })
            }
        },
        /**
         * [bindCancel 手指触摸动作被打断，如来电提醒，弹窗]
         * 
         */
        bindCancel(event) {            
            adList.map(function(item){
                item.animationClassName = ''                    
                return item
            })            
            this.setData({
                adList,
                isNotAnimation: true
            })
        },
        /**
         * [bindAnimationEnd 动画结束]
         * 
         */
        bindAnimationEnd(event) {
            let {animationEndTime, adList} = this.data
            if (animationEndTime < 2) {
                animationEndTime += 1
                this.setData({
                    animationEndTime
                })
            } else if(animationEndTime = 2)  {
                animationEndTime = 0
                let firstData = adList.shift()
                adList.push(firstData)
                let adListIndex = adList[0].num
                let adListTitle = adList[0].title
                adList.map(function(item){
                    item.animationClassName = ''                    
                    return item
                })
                this.setData({
                    animationEndTime: 0,
                    adList,
                    adListIndex,
                    adListTitle,
                    isNotAnimation: true
                })
                this.autoPlayFun = setTimeout(()=>{
                    clearTimeout(this.autoPlayFun)
                    this.autoPlay() //自动播放下一张
                }, 3000)
            }
        },
        // 打开计算器
        calculator(){
            this.triggerEvent('calculator', {})
        },
        // 拿用户信息
        getuser(event){
            this.triggerEvent('getuser', event)
        }
    }   
})