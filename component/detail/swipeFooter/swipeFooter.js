Component({

    properties: {
        info:{
            type:Object,
            value:{

            },
            observer(n,o){
                // this.onTimer(n.expire_time||0)
            }
        }
    },
    options: {
        multipleSlots: true
    },

    data: {
        dd:0,
        hh:0,
        mm:0,
        ss:0,
        timer:null
    },

    attached(){
        // this.onTimer(this.info.expire_time)
    },
    methods: {

    }
})
