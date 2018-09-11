Component({
    properties:{
        show:{
            type:Boolean,
            value:true,
            observer(n,o){
                if(!n){
                  this.triggerEvent('hideCallback')
                }
            }
        },
        closable:{
            type:Boolean,
            value:true
        },
        forbidClose:{
            type:Boolean,
            value:false
        }
    },
    options: {
        multipleSlots: true
    },
    methods:{
        onClose(){
             this.setData({
                show:false
            })
          this.triggerEvent('onClose')
        }
    }
})
