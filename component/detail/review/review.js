Component({

    properties: {
        info:{
            type:Object,
            value:{

            },
            observer(n,o){
                if(n&&n.data.length>0){
                    n.data.map((item,index)=>{
                        item.user_name=item.user_name.replace(/(^\S).*?(\S$)/,'$1***$2')
                    })
                    this.setData({
                        data:n
                    })
                }
            }
        }
    },
    options: {
        multipleSlots: true
    },

    data: {
        data:{}
    },


    methods: {

    }
})
