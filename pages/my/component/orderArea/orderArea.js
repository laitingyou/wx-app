// pages/my/component/orderArea.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        order:{
            type: Object,
            value: {},
            observer(newVal){
                this._filterData(newVal)
            }
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
      bot:{},
      btns:[
        {
          icon:'icon-shouhuoziliao',
          url:'1',
          text:'待付款',
          botLabel: 'needPay'
        },
        {
          icon:'icon-zan1',
          url:'2',
          text:'集赞中 待分享',
          botLabel: 'needShare'
        },
        {
          icon:'icon-clock-2',
          url:'3',
          text:'待发货',
          botLabel: 'needShipping'
        },
        {
          icon:'icon-tv',
          url:'4',
          text:'待收货',
          botLabel: 'needReceiving'
        },
        {
          icon:'icon-icon3',
          url:'5',
          text:'退款退货',
          botLabel: 'needRefund'
        }
      ]
    },
    created(){
        
    },
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    attached() {
        // this._filterData()
    },
    moved() { 
        
    },
    detached() { 
        
    },
    ready(){
        this._filterData()
    },
    /**
     * 组件的方法列表
     */
    /**
     * 组件的方法列表
     */
    methods: {
        _filterData(value){
            let order = value || this.properties.order
            if (Object.keys(order).length>0) {
                let newOrder = this._numberSet(order)
                this.setData({
                  bot:newOrder
                })
            }
        },
        /**
         * [_numberSet 对订单数进行处理，大于99的后面加个+]
         * @param  {Objcet} obj []
         * @return {Objcet}     []
         */
        _numberSet(obj){
            let arr = Object.keys(obj)
            let newObj = {}
            arr.forEach((item)=>{
                let num = obj[item]*1
                if (num>99) {
                    newObj[item] = num + '+'
                } else if(num == 0) {
                    newObj[item] = ''
                } else {
                    newObj[item] = num
                }
            })
            return newObj
        }
    }
})