module.exports = {
    /**
     * [adDataMap 广告数据处理]
     * @param  {[Array]} arr [未处理过的数组，结构复杂很多没用的字段]
     * @return {[Array]}     [处理过的数组，里面由{openType, url, image, title}组成]
     */
    adDataMap(arr = []) {
        // 小程序页面
        let pagesData = {
            24: {
                path: '/activity/pages/003/index'
            },
            25: {
                path: '/pages/home/index',
                query: 'calculator=1'
            },
            26: {
                path: '/pages/home/index',
                query: 'type=share',
                openType: 'switchTab'
            },
            26: {
                path: '/pages/home/index',
                query: 'type=share',
                openType: 'switchTab'
            },
            27: {
                path: '/activity/pages/001/index'
            },
            28: {
                path: '/activity/pages/002/index'
            }
        }
        let newArr = []
        arr.forEach(function (item) {
            let {
                content: {
                    category = '',
                    odst = ''

                },
                title,
                type,
                linkType,
                image,
                contentUrl
            } = item
            let openType = 'navigateTo'
            let url = ''
            switch (type * 1) {
                // 商品分类
                case 1:
                    url = '/pages/goodsPage/index?category=' + category + '&cateName=' + title + '&odst=' +odst
                    break;
                // 小程序页面    
                case 2:
                    let pagesDataItem = pagesData[linkType]
                    if (pagesDataItem) {
                        let {path, query, openType: newOpenType} = pagesData[linkType]
                        url = query ? `${path}?${query}` : path
                        openType = newOpenType || openType
                    }
                    break;
                // 网页连接
                case 3:
                    let webUrl = encodeURIComponent(contentUrl)
                    url = `/other/pages/web/index?url=${webUrl}`

                    break;
                default:
            }
            if (url) {
                newArr.push({
                    openType,
                    url,
                    image,
                    title
                })
            }
        })
        return newArr
    }
}
