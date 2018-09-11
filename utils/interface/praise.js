module.exports={
    /*获取所有数据*/
    invitationLike:{
        service_name:'Channel\\Service\\AppletService',
        method:'invitationLike'

    },
    /*点赞*/
    addOrderLike:{
        service_name:'Eelly\\SDK\\Order\\Api\\Like',
        method:'addOrderLikeNew'

    },
    // 获取随机直播
  getRandomLive:{
    service_name:'Eelly\\SDK\\Live\\Api\\Live',
    method:'getRandomLive'

  },

}