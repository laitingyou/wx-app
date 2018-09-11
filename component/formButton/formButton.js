const {eellyReq} = require("../../utils/eellyReq")
const messagesService = require('../../utils/interface/messagesService')
const { sendFromId } = require('../../utils/formId')
Component({
    /**
     * 组件的属性列表
     */
    properties: {

    },
    /**
     * 组件的初始数据
     */
    data: {
        
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
        bindsubmit(e){            
            // 给服务端发formId
            sendFromId(e.detail.formId)

            this.triggerEvent('submit',e)
        }
    }
})
