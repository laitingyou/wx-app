// 请求地址
const {host} = require('../../../utils/config');
const urlMap = {
    bannerUrl: `https://www.eelly.${host}/index.php?app=activity&act=getClearanceAdvert&type=12`,
    listUrl: `https://www.eelly.${host}/index.php?app=activity&act=summerClearanceInterface&order=sort_order`
};
Page({
    /**
     * 页面的初始数据
     */
    data: {
        promoBannerData: null,// banner 数据
        promoListData: [],// 列表数据
        isLoading: {
            show: false, // 显示loading
            text: '' // 显示loading文案
        }
    },
    /**
     * 生命周期函数--监听页面加载
     */
    page: 1,// 页数
    onLoad(options) {
        this.initAllData()
    },
    /**
     * @TODO  [初始化全部数据数据]
     */
    initAllData() {
        wx.showLoading({
            title: '加载中...',
        });
        return Promise.all([this.getPromoBanner(), this.getPromoListData(this.page)])
            .then(([promoBannerData, promoListData]) => {
                wx.hideLoading();
                this.page += 1;
                this.setData({
                    promoBannerData,
                    promoListData
                })
            }).catch(err => {
                wx.showToast({
                    icon: 'none',
                    title: err || '未知错误'
                })
            })
    },
    /**
     * @TODO  [获取banner数据]
     */
    getPromoBanner() {
        return new Promise((resolve, reject) => {
            wx.request({
                url: urlMap.bannerUrl,
                success({statusCode, data, errMsg}) {
                    if (statusCode === 200) {
                        data = data.replace(/^\(([\s\S]*)\)$/, "$1")
                        data = JSON.parse(data)
                        resolve(data)
                    } else {
                        reject(errMsg)
                    }
                }
            })
        })
    },
    /**
     * @TODO  [获取清仓列表数据]
     * @param {Number} page [页数]
     */
    getPromoListData(page) {
        return new Promise((resolve, reject) => {
            wx.request({
                url: urlMap.listUrl,
                data: {
                    act_id: 9891,
                    page
                },
                success({statusCode, data, errMsg}) {
                    if (statusCode === 200) {
                        resolve(JSON.parse(data.slice(1, data.length - 1)))
                    } else {
                        reject(errMsg)
                    }
                },
                fail(err) {
                    wx.showToast({
                        icon: 'none',
                        title: err || '网络异常'
                    })
                }
            })
        })
    },
    /**
     * @TODO  [跳转商品详情页面]
     * @param {Number} goodsId [商品Id]
     */
    goDetail(e) {
        let {goodsid} = e.currentTarget.dataset
        wx.navigateTo({
            url: `/pages/goods/index?goodsId=${goodsid}`
        })
    },
    /**
     * @TODO  [下拉刷新列表数据]
     */
    onReachBottom() {
        let {page_total} = this.data.promoListData.page_list;
        this.setData({
            isLoading: {
                show: true,
                text: '正在加载...'
            }
        });
        if (this.page > page_total) {
            this.setData({
                isLoading: {
                    show: true,
                    text: '没有更多数据啦'
                }
            })
        } else {
            this.getPromoListData(this.page).then(res => {
                this.page++;
                this.data.promoListData.list = this.data.promoListData.list.concat(res.list);
                this.data.promoListData.page_list = res.page_list;
                this.setData({
                    promoListData: this.data.promoListData,
                    isLoading: {
                        show: false,
                        text: ''
                    }
                })
            }).catch(err => {
                wx.showToast({
                    icon: 'none',
                    title: err
                })
            })
        }
    }
});