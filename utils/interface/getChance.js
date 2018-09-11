/*"一元领取"接口*/

let service_name = 'Eelly\\SDK\\Activity\\Api\\ActivityOneyuan'

module.exports = {
    // 添加或修改收货地址
    getChanceStat: {
        service_name,
        method: 'getOneyuanDetailTimes'
    },
    getChanceList: {
        service_name,
        method: 'getUseOneyuanListData'
    }
}