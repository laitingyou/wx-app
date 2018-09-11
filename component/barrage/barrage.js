const { eellyReqPromise, eellyReq } = require("../../utils/eellyReq")
const barrage = require('../../utils/interface/barrage')
const { getAuth } = require("../../utils/auth");
import md5 from '../../utils/md5'
const app = getApp()
Component({
  properties: {
    msg: {
      type: Object,
      value: {
        portraitUrl: '',
        msg: ''
      }
    },
    msgShow: {
      type: Boolean,
      value: false
    }
  },
  data: {
    isShareHide: false,
    emptyCount:0,  // 连续请求为空的次数,连续为空两次就停止请求
    lastData: null, // 上一次请求返回来的数据, 数据太多，转成MD5,方便比较
    sameCount: 0 // 连续请求回来的数据相同的次数,连续相同一次就停止请求
  },
  attached () {
    // 加个延迟，防止出现重复请求accessToken
    setTimeout(_ => {
      getAuth().then(res => {
        if(res) {
          this.startPlay()
        }
        this.setData({
          isShareHide: res
        })
      }).catch(err => {

      })
    }, 3000)


  },
  ready () {
  },
  methods: {
    /**
     * 弹幕
     */
    getBarrage (init) {
      eellyReqPromise({
        service: barrage.getBarrage
      }).then(res => {
        let msgList = res.data.retval.data, {lastData, sameCount} = this.data
        if (msgList.length === 0) return;
        if(lastData === md5(msgList)){
              this.setData({
                sameCount: ++sameCount
              })
        }
        app.globalData.barrageList = msgList
        this.setData({
          lastData : md5(msgList)
        })
        // init && this.startPlay(msgList)
      }).catch(err => {

      })
    },
    startPlay () {
      function goTimer () {
        let { emptyCount, sameCount } = this.data
        let timer = null, msgList = app.globalData.barrageList
        if(!msgList[0]){
          this.setData({
            emptyCount:++emptyCount
          })
          this.getBarrage()
        }else {
          this.setData({
            emptyCount: 0,
            sameCount: 0,
            msgShow: true,
            msg: app.globalData.barrageList.shift()
          })
        }
        if(emptyCount > 1 || sameCount>0) {
          goTimer = void (0)
        }
        clearTimeout(timer)
        timer = setTimeout(() => {
          this.setData({
            msgShow: false,
          })
          try{
            setTimeout(goTimer.bind(this), 3000)
          }catch (e){
            return
          }
        }, 6000)
      }
      goTimer.call(this)
    }
  }

})