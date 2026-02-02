// pages/envStatistic/envStatistic.js
import {
    StorageKey
} from "../../utils/config";
import {
    findOne,
    deleteEnvSample
} from '../../services/envSampling'
import {
    navigateToPage
} from "../../utils/util.js";

Page({
    data: {
        tab: '',
        envCount: 0,
        tubeCount: 0,
        tubeStatistic: {},
        searchInput: '',
        displayedLogs: [],
    },
    /** 路由传入的参数 */
    routeParam: {
        tab: ''
    },
    /** 最后一条样本编号index */
    lastMatchIndex: 0,
    /** 读取存储 预约信息 */
    envSampleList: [],
    /** 读取存储中 样本编号 */
    sampleNumberList: [],
    /** 防止用户频繁操作 */
    loading: 0,
    onLoad(e) {
        this.routeParam = e;
    },
    onShow: function () {
        this.loadData(this.data.tab || this.routeParam.tab || 'tube')
    },
    async loadData(tab) {
        const envSampleList = wx.getStorageSync(StorageKey.envSampleList) || [];
        const sampleNumberList = wx.getStorageSync(StorageKey.envSampleNumberList) || [];
        this.envSampleList = envSampleList;
        this.sampleNumberList = sampleNumberList;

        const tubeStatistic = []
        sampleNumberList.forEach(number => {
            const num = envSampleList.filter(o => o.number === number).length
            const index = tubeStatistic.findIndex(o => o.num === num)
            if (index < 0) {
                tubeStatistic.push({
                    num,
                    numDesc: num === 1 ? '单混' : `${num}混1`,
                    sampleNumbers: [number]
                })
            } else {
                tubeStatistic[index].sampleNumbers.push(number)
            }
        })

        let nextData = {
            tab,
            tubeCount: sampleNumberList.length,
            envCount: envSampleList.length,
            tubeStatistic: tubeStatistic.map(obj => {
                return {
                    ...obj,
                    detailCount: Number(obj.num) * Number(obj.sampleNumbers.length)
                }
            }).sort((a, b) => a.num - b.num),
        }

        if (tab === 'env') {
            nextData = {
                ...nextData,
                ...this.displayLogList(this.data.searchInput, true)
            }
        }

        this.setData(nextData);
    },
    clearCount() {
        wx.showModal({
            title: '清空汇总',
            success: async (res) => {
                if (!res.confirm) {
                    return;
                }

                this.envSampleList = [];
                this.sampleNumberList = [];
                this.lastMatchIndex = 0;

                this.setData({
                    tubeCount: 0,
                    envCount: 0,
                    tubeStatistic: [],
                    displayedLogs: []
                })

                wx.setStorageSync(StorageKey.envSampleList, []);
                wx.setStorageSync(StorageKey.envSampleNumberList, []);

                wx.showToast({
                    title: '完成',
                    icon: 'success'
                })
            }
        })
    },
    changeTab(e) {
        const nextTab = e.currentTarget.dataset.tab;
        if (nextTab === this.data.tab) {
            return;
        }

        if (nextTab === 'env') {
            this.displayLogList(this.data.searchInput)
        } else {
            this.setData({
                tab: nextTab
            })
        }
    },
    displayLogList(searchText, returnData = false) {
        let searchInput = '';
        if (typeof searchText === 'string') {
            searchInput = searchText
        }
        let index = 0;
        let recordNum = 0
        const displayedLogs = [];
        let envSampleList = this.envSampleList;
        if (searchInput) {
            envSampleList = envSampleList.filter(r => {
                return (r.name || '').includes(searchInput) ||
                    (r.number || '').includes(searchInput) ||
                    (r.unit || '').includes(searchInput)
            })
        }

        const sampleNumberList = this.sampleNumberList;
        while (index < sampleNumberList.length && recordNum < 30) {
            const number = sampleNumberList[index];
            const envSamples = envSampleList.filter(o => o.number === number)
            if (envSamples.length > 0) {
                const unitGroup = envSamples.reduce((prev, cur) => {
                    const index = prev.findIndex(o => o.unit === cur.unit)
                    if (index > -1) {
                        prev[index].envSamples.push(cur)
                    } else {
                        prev.push({
                            unit: cur.unit,
                            number,
                            envSamples: [cur]
                        })
                    }
                    return prev
                }, []);
                displayedLogs.push(...unitGroup)
                recordNum += envSamples.length;
            }
            index += 1;
        }

        this.lastMatchIndex = index
        const data = {
            displayedLogs,
            searchInput,
            tab: 'env'
        };
        if (returnData) {
            return data
        } else {
            this.setData(data)
        }
    },
    changeSearchInput(e) {
        this.setData({
            searchInput: e.detail.value
        })
    },
    searchLogs() {
        this.displayLogList(this.data.searchInput)
    },
    clearSearch() {
        this.displayLogList()
    },
    logsReachBottom(e) {
        if (new Date().getTime() - this.loading < 1500) {
            return;
        }
        this.loading = new Date().getTime()
        if (this.lastMatchIndex >= this.sampleNumberList.length) {
            wx.showToast({
                title: '已经到底了～',
                duration: 1000,
                icon: 'none'
            });
            return;
        }

        let index = this.lastMatchIndex;
        const searchInput = this.data.searchInput
        const sampleNumberList = this.sampleNumberList;
        let envSampleList = this.envSampleList;
        if (searchInput) {
            envSampleList = envSampleList.filter(r => {
                return (r.name || '').includes(searchInput) ||
                    (r.number || '').includes(searchInput) ||
                    (r.unit || '').includes(searchInput)
            })
        }
        let recordNum = 0
        const displayedLogs = [...this.data.displayedLogs];
        while (index < this.sampleNumberList.length && recordNum < 30) {
            const number = sampleNumberList[index];
            const envSamples = envSampleList.filter(o => o.number === number)
            if (envSamples.length > 0) {

                const unitGroup = envSamples.reduce((prev, cur) => {
                    const index = prev.findIndex(o => o.unit === cur.unit)
                    if (index > -1) {
                        prev[index].envSamples.push(cur)
                    } else {
                        prev.push({
                            unit: cur.unit,
                            number,
                            envSamples: [cur]
                        })
                    }
                    return prev
                }, []);
                displayedLogs.push(...unitGroup)
                recordNum += envSamples.length;
            }
            index += 1;
        }
        this.lastMatchIndex = index
        this.setData({
            displayedLogs,
        })
    },
    invalidReservation(e) {
        if (new Date().getTime() - this.loading < 1500) {
            return;
        }
        this.loading = new Date().getTime();

        var that = this;
        const envSampleId = e.currentTarget.dataset.id;
        wx.showLoading({
            title: '查询中...',
            mask: true
        })
        findOne(envSampleId)
            .then(res => {
                wx.hideLoading();
                if (['PROCESSING'].includes(res.status)) {
                    wx.showModal({
                        title: '提示',
                        content: '确认废弃' + res.name + '的记录?',
                        success: (modalRes) => {
                            if (modalRes.confirm) {
                                deleteEnvSample(envSampleId).then(invalidRes => {
                                    wx.showToast({
                                        title: "操作成功",
                                        icon: "success",
                                        duration: 2000,
                                    });

                                    const nextEnvSampleList = that.envSampleList.filter(o => o.id !== res.id)
                                    wx.setStorageSync(StorageKey.envSampleList, nextEnvSampleList);

                                    let nextSampleNumberList = that.sampleNumberList;
                                    const index = nextEnvSampleList.findIndex(o => o.number === res.number);
                                    if (index < 0) {
                                        nextSampleNumberList = nextSampleNumberList.filter(n => n !== res.number)
                                        wx.setStorageSync(StorageKey.envSampleNumberList, nextSampleNumberList)
                                    }
                                    that.loadData('env')
                                }).catch((error) => {
                                    wx.showToast({
                                        title: "操作失败",
                                        icon: "error",
                                        duration: 2000,
                                    });
                                })
                            }
                        },
                    })
                } else {
                    wx.showToast({
                        title: "预约状态无法修改",
                        icon: "error",
                        duration: 2000,
                    });
                }
            })
            .catch((error) => {
                wx.hideLoading();
                wx.showToast({
                    title: "查询失败",
                    icon: "error",
                    duration: 2000,
                });
            })
    },
    modifyReservation(e) {
        if (new Date().getTime() - this.loading < 1500) {
            return;
        }
        this.loading = new Date().getTime();

        const envSampleId = e.currentTarget.dataset.id;
        wx.showLoading({
            title: '查询中...',
            mask: true
        })
        findOne(envSampleId)
            .then(res => {
                wx.hideLoading();
                if (["NEW", 'PROCESSING'].includes(res.status)) {
                    wx.setStorageSync(StorageKey.envModify, res)
                    navigateToPage('pages/envSampling/envSampling')
                } else {
                    wx.showToast({
                        title: "预约状态无法修改",
                        icon: "error",
                        duration: 2000,
                    });
                }
            })
            .catch((error) => {
                wx.hideLoading();
                console.log(error)
                wx.showToast({
                    title: "查询失败",
                    icon: "error",
                    duration: 2000,
                });
            })
    },
})