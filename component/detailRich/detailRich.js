// component/detailRich/detailRich.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    html: {
      type: String,
      default: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    imgList: []
  },
  // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
  attached(){
    let detailsArr = []
    let {html} = this.properties
    if(Object.prototype.toString.call(html) == "[object String]") {
      html.replace(/<img [^>]*src=['"]([^'"]+)[^>]*>/gi, function (match, capture) {
        detailsArr.push(capture)
      })
    }
    
    this.setData({
      imgList: detailsArr
    })
  },
  moved(){},
  detached(){},
  /**
   * 组件的方法列表
   */
  methods: {
    
  }
})
