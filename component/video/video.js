Component({
    /**
     * 组件的属性列表
     */
    properties: {
        src:{
            type:String,
            value:''
        },
        isShow:{
            type:Boolean,
            value:false
        },
        data:{
            type:Object,
            value:null
        }
    },
    /**
     * 组件的初始数据
     */
    data: {
        navShow:true
    },
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    attached() {
    },
    moved() {

    },
    detached() {
    },
    /**
     * 组件的方法列表
     */
    methods: {
        onClose(e){
            this.setData({
                isShow:false
            })
        },
        touchmove(){
            return false;
        },
        onEnded(){
            this.setData({
                navShow:false
            })
        },
        onPause(){
            this.setData({
                navShow:false
            })
        },
        onPlay(){
            this.setData({
                navShow:true
            })
        },
        onError(){
            this.setData({
                navShow:false
            })
        },
        onStop(){
        },
        onBuy(e){
            let {type}=e.currentTarget.dataset,
                {goodsId,originalPrice,specialPrice}=this.data.data
            wx.navigateTo({
                url:`/pages/goods/index?goodsId=${goodsId}&type=${type}`
            })
        }
    }
})
