const {
    appGetGoodsDetail,

} = require('../../utils/interface/detail')
/*const { subtract } = require("../../utils/floatNumber")
const { fillZero } = require("../../utils/util")*/
const {eellyReqPromise, eellyReq} = require("../../utils/eellyReq")
Component({
    properties:{
        itemData:{
            type:Object,
            value:{
                goodsImg:'',
                goodsName:'',
                originalPrice:89,
                specialPrice:9.9,
                orderCount:8,
                specialPrice: 0
            }
        },
        extendClass:{
            type:Object,
            value:{
                height:'itemHeight',
                bgcolor:'itembg'
            }
        },
        videoShow:{
            type:Boolean,
            value:false
        },
        currentVideo:{
            type:String,
            value:''
        }
    },

    data:{
    },
    attached(){        
        /*let {itemData} = this.properties      
        let {originalPrice, specialPrice} = itemData
        let sparePrice = subtract(originalPrice, specialPrice)  
        itemData.sparePrice = fillZero(sparePrice)      
        // console.log(originalPrice, specialPrice, sparePrice, fillZero(sparePrice))
        this.setData({
            itemData
        })*/
    },
    methods:{
      
        onError(e){
            // console.log(e)
        },
        enterDetail(e){
            let itemData=this.data.itemData
            eellyReqPromise({
                service: appGetGoodsDetail,
                args: {
                    goodsId:itemData.goodsId
                }
            }).then(res=>{
                wx.setStorageSync('this_goods',res)
            }).catch(err=>{
                wx.showToast({
                    title:err.info,
                    icon:'none'
                })
            })

            wx.setStorageSync('tmp_goods',itemData)
            wx.navigateTo({
                url: e.currentTarget.dataset.url+'&isPreload=true'
            })

        },
        videoPlay(e){
            let {videoUrl,originalPrice,specialPrice,goodsId}=this.data.itemData
            wx.navigateTo({
                url: `/other/pages/video/index?src=${videoUrl}&originalPrice=${originalPrice}&specialPrice=${specialPrice}&goodsId=${goodsId}&btn=true`
            })
        }
    }
})