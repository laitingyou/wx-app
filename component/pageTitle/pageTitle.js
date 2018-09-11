const App = getApp()
const {tabBarList} = App

// 用于创建动画
let animation 

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        // 文字颜色
        color: {
            type: String,
            value: '#fff'
        },
        // 标题背景
        background: {
            type: String,
            value: '#FF4069'
        },
        // 标题
        title: {
            type: String,
            value: '',
            observer(newVal, oldVal){
                if (newVal != oldVal) {
                    this.setTitle(newVal)
                }
            }
        }, 
        // 是否显示左侧返回按钮
        hasback: {
            type: Boolean,
            value: true
        },
        // 是否显示分割线
        border: {
            type: Boolean,
            value: false
        },
        // 给title转的样式，传什么就给title加什么class,现在只有了center
        defaultstyle: {
            type: String,
            value: ''
        },
        // 动画名称，在下面的methods中创建
        animationname: {
            type: String,
            value: '',
            observer(newVal){                
                this[newVal] && this[newVal]()
            }
        },
        /**
         * 设置动画的值，可以设置以下参数：
         * duration        动画持续时间，单位ms
         * timingFunction  定义动画的效果
         * delay           动画延迟时间，单位 ms
         * transformOrigin 设置transform-origin
         */
        animationopt: {
            type: Object,
            value: {
                duration: 200
            }
        }
    },    
    /**
     * 组件的初始数据
     */
    data: {
        // 动画数据
        animationData: {}
    },
    created(){
        // 创建动画
        let {animationopt} = this.properties
        animation = wx.createAnimation(animationopt)
    },
    attached() {
        let {color, background, title, hasback, defaultstyle} = this.properties
        this.setData({
            color, 
            background,
            title,
            hasback,
            defaultstyle
        })
    },
    moved() {
    },
    detached() {
    },
    externalClasses: ['pageTitle','styleSheet'],
    /**
     * 组件的方法列表
     */
    methods: {
        // 点击返回上一页
        _goBack(){
            let pages = getCurrentPages()
            let pagesLength = pages.length
            if(pagesLength>1){
                let lastPage = pages[pagesLength - 2 ]
                let {options} = lastPage
                let optionsKeys = Object.keys(options)
                let backUrl = '/'+lastPage.route //要返回的页面
                
                // 判断要返回的页面是不是tabBar 页面
                let isTabBarList = tabBarList.findIndex(function(value) {
                    return value == backUrl;
                })
                // 要返回的页面是tabBar用switchTab进行跳转
                if (isTabBarList >= 0) {
                    wx.switchTab({
                        url: backUrl
                    })
                } else {
                    wx.navigateBack({
                        delta: 1
                    })
                }
                
            }else {
                // 只有一个页面，跳回首页
                wx.switchTab({
                    url: '/pages/home/index'
                })
            }  
        },
        setTitle(title){
            this.setData({title})
        },
        // 运行动画
        // 淡出
        fadeOut(){            
            animation.opacity(0).height(0).step()
            // animation.scaleY(0).step()
            this.setData({
                animationData: animation.export()
            })
        },
        // 淡入
        fadeIn(){
            animation.height(70).step()
            animation.opacity(1).step()
            this.setData({
                animationData: animation.export()
            })
        }
    }
})
