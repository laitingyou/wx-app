// component/pop/pop.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        title: String
    },    
    /**
     * 组件的初始数据
     */
    data: {
        
    },
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    attached() {
        let {title} = this.properties
        this.setData({
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
        
    }
})
