// component/pop/pop.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        show: {
            type: Boolean,
            value: false
        },
        closable: {
            type: Boolean,
            value: false
        },
        bottomButton:{
            type:Boolean,
            value:true
        },
        title: {
            type: String,
            value: ''
        },
        okText: {
            type: String,
            value: '确定'
        },
        ok: {
            type: Function,
            value: function () {
            }
        },
        cancel: {
            type: Function,
            value: function () {
            }
        }
    },
    options: {
        multipleSlots: true
    },
    /**
     * 组件的初始数据
     */
    data: {},
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    attached() {
        let {show, okText, title} = this.properties
        this.setData({
            show,
            okText,
            title
        })
    },
    moved() {
    },
    detached() {
    },
    /**
     * 组件的方法列表
     */
    methods: {
        closeFun() {
            this.setData({
                show: false
            })
            this.triggerEvent('cancel')
            // let {cancel} = this.properties
            // cancel && cancel()
        },
        okFun() {
            this.closeFun()
            // let {ok} = this.properties
            // ok && ok()
        },
        touchmove(){
            return false;
        }
    }
})
