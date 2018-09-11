const host = 'com'

const hostObj = {
    dev: 'https://mall.eelly.dev',
    test: 'https://mall.eelly.test',
    cn: 'https://mall.eelly.cn',
    com: 'https://mall.eelly.com',
}

const appIdObj = {
    dev: '6a2Bjc$*ZCDH_ab2*&',
    test: '6a2Bjc$*ZCDH_ab2*&',
    cn: 'HxBt362fwem&YhbrKp',
    com: 'HxBt362fwem&YhbrKp',
}
const appSecretObj = {
    dev: '6#P!T3bNhc$7P!j$Tx4nJ$CBXGEfFhBk',
    test: '6#P!T3bNhc$7P!j$Tx4nJ$CBXGEfFhBk',
    cn: 'F^6KTni82fb-iNM^c%SsyA3p_#QpwG*2',
    com: 'F^6KTni82fb-iNM^c%SsyA3p_#QpwG*2',
}
const liveConfigObj ={
    dev : '6d5ae52067f6a01c028fa5bc6dbf6fdf',
    test:'6d5ae52067f6a01c028fa5bc6dbf6fdf',   
    cn:'b24b7321c7cc856ad7baa144b11b96b1',
    com:'b24b7321c7cc856ad7baa144b11b96b1'
}


const hostUrl = hostObj[host]
// 用于小程序之间跳转navigator组件里的version属性
// const navigatorVersion = (host == 'test') ? 'develop' : 'trial'
const navigatorVersion = 'develop'

/**
 * baseUrl 接口域名
 * webUrl 内嵌页面域名
 */
module.exports = {
    host,
    baseUrl: hostUrl + '/service.php',
    timeUrl: hostUrl + '/api/time/',
    appId: appIdObj[host],
    appSecret: appSecretObj[host],
    asecretKey: '%HdoQqwI3sQ3bBnaLReX^hMp',
    appKey : liveConfigObj[host],// 云信key
    version: 131,
    clientName: 'wechat_blty',
    navigatorVersion
}