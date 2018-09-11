Component({
    properties:{
        value:{
            type:Number,
            value:1,
            observer(n,o){

                this.triggerEvent('onChange', n)
            }
        },
        min:{
            type:Number,
            value:1,
            observer(){

            }
        },
        max:{
            type:Number,
            value:10000,
            observer(){

            }
        },

    },
    data:{
    },
    methods:{
        onChange(e){
            let {value,min,max} = this.data
            if(e.detail.value==0) return
            if(e.type==='input'){
                this.setData({
                    value:e.detail.value
                })
            }else {
                if(value===min && e.currentTarget.dataset.type===-1) return;
                if(value===max && e.currentTarget.dataset.type===1) return;
                this.setData({
                    value:this.data.value+e.currentTarget.dataset.type
                })
            }

        },
        bindblur(e){
            if(e.detail.value<this.data.min || !e.detail['value']){
                this.setData({
                    value:this.data.min
                })
            }
            if(e.detail.value>this.data.max || !e.detail['value']){
                this.setData({
                    value:this.data.max
                })
            }

        }
    }
})
