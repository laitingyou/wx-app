var app = getApp();
Page({
    data: {
        src:'',
        isShow:false,
        data:null,
        navShow:true,
        params:{},
        timer:0,
        videoObj:{}
    },
    onLoad(params) {
        let videoObj=wx.createVideoContext('video',this)
        this.setData({
            params,
            src:params.src,
            videoObj
        })
        videoObj.requestFullScreen()
    },
    onClose(e){
       wx.navigateBack()
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
            navShow:true,
        })


    },
    onError(){
        this.setData({
            navShow:false
        })
    },
    onStop(){
        if(this.data.navShow){
            this.setData({
                navShow:false
            })
            this.data.videoObj.pause()
        }else {
            this.setData({
                navShow:true
            })
            this.data.videoObj.play()
        }
        // clearTimeout(this.data.timer)
        // this.setData({
        //     navShow:false,
        //     timer:setTimeout(()=>{
        //             this.setData({
        //                 navShow:true
        //             })
        //         },2000)
        // })

    },
    onBuy(e){
        let {type}=e.currentTarget.dataset,
            {goodsId}=this.data.params
        wx.redirectTo({
            url:`/pages/goods/index?goodsId=${goodsId}&type=${type}`
        })
    }
})