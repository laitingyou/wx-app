Component({
    properties:{
      hidden:{
            type: Boolean,
            value: true,
            observer(n){
              this.setData({
                modalHidden:n
              })
            }
        }
    },
    data:{
      modalHidden: true
    },
    options: {
    },
    methods:{
      closeModel(){
        this.setData({
          modalHidden:true
        })
        this.triggerEvent('onClose', true)
      }
    }
})
