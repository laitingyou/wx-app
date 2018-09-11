// pages/live/component/inLive.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        item: {
            type: Object,
            value: {},
        }
    },
    /**
     * 组件的初始数据
     */
    data: {

    },
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    attached: function () {
        this.filterData()
    },
    moved: function () { },
    detached: function () { },
    /**
     * 组件的方法列表
     */
    methods: {
        filterData() {
            let { item } = this.properties
            let { liveId, image, title, addressName, goodsCount, goodsList } = item
            if (goodsList.length > 3) {
                goodsList.length = 3
            }
            let obj = { liveId, image, title, addressName, goodsCount, goodsList }
            obj.liveUrl = '/pages/liveDetails/index?liveId=' + liveId
            this.setData(obj)
        }
    }
})
