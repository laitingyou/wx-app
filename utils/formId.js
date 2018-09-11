const { eellyReqPromise } = require("./eellyReq")
const messagesService = require('./interface/messagesService')

function sendFromId (formId){
	if (!wx.getStorageSync('user')) {
		return Promise.reject({
			type: 'sendFromId',
			info: '未登录'
		})
	} else if(!/^[0-9a-zA-Z]+$/g.test(formId)) {
		return Promise.reject({
			type: 'sendFromId',
			info: 'formId格式错误'
		})
	} else {
		return eellyReqPromise({
		    login:true,
		    service: messagesService.addFormId,
		    args:{
		        formId
		    }
		})
	}
	
}
module.exports = { sendFromId }