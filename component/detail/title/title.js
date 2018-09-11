Component({

    properties: {
        info:{
            type:Object,
            value:{}
        },
        couponList:{
            type:Array,
            value:[]
        }
    },
    options: {
        multipleSlots: true
    },

    data: {},


    methods: {
        getCoupon(){
            this.triggerEvent('getCoupon')
        }
    }
})
