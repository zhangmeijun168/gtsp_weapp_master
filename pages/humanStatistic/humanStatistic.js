// pages/humanStatistic/humanStatistic.js
import {
    StorageKey
} from "../../utils/config";
import {
    queryReservationById,
    invalidReservation
} from '../../services/reservation'
import {
    navigateToPage
} from "../../utils/util.js";
const util = require("../../utils/util.js");

Page({
    data: {
        tab: '',
        humanCount: 0,
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
    reservationList: [],
    /** 读取存储中 样本编号 */
    sampleNumberList: [],
    /** 防止用户频繁操作 */
    loading: 0,
    onLoad(e) {
        this.routeParam = e;
    },
    onShow() {
        this.loadData(this.data.tab || this.routeParam.tab || 'tube')
    },
    async loadData(tab) {
        const humanList = wx.getStorageSync(StorageKey.reservationList) || [];
        const sampleNumberList = wx.getStorageSync(StorageKey.sampleNumberList) || [];
        this.reservationList = humanList;
        this.sampleNumberList = sampleNumberList;

        const tubeStatistic = []
        sampleNumberList.forEach(sampleNumber => {
            const num = humanList.filter(reservation => reservation.sampleNumber === sampleNumber).length
            const index = tubeStatistic.findIndex(o => o.num === num)
            if (index < 0) {
                tubeStatistic.push({
                    num,
                    numDesc: num === 1 ? '单混' : `${num}混1`,
                    sampleNumbers: [sampleNumber]
                })
            } else {
                tubeStatistic[index].sampleNumbers.push(sampleNumber)
            }
        })

        let nextData = {
            tab,
            tubeCount: sampleNumberList.length,
            humanCount: humanList.length,
            tubeStatistic: tubeStatistic.map(obj => {
                return {
                    ...obj,
                    detailCount: Number(obj.num) * Number(obj.sampleNumbers.length)
                }
            }).sort((a, b) => a.num - b.num),
        }

        if (tab === 'human') {
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
            success: (res) => {
                if (!res.confirm) {
                    return;
                }

                this.reservationList = [];
                this.sampleNumberList = [];
                this.lastMatchIndex = 0;
                this.setData({
                    tubeStatistic: [],
                    tubeCount: 0,
                    humanCount: 0,
                    displayedLogs: [],
                })

                wx.setStorageSync(StorageKey.reservationList, []);
                wx.setStorageSync(StorageKey.sampleNumberList, []);
                wx.setStorageSync(StorageKey.reservationIdList, []);

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

        if (nextTab === 'human') {
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
        const sampleNumberList = this.sampleNumberList;
        let reservationList = this.reservationList;
        if (searchInput) {
            reservationList = reservationList.filter(r => {
                return (r.name || "").includes(searchInput) ||
                    (r.identityNumber || '').includes(searchInput) ||
                    (r.sampleNumber || '').includes(searchInput)
            })
        }
        while (index < sampleNumberList.length && recordNum < 30) {
            const sampleNumber = sampleNumberList[index];
            const reservations = reservationList.filter(o => o.sampleNumber === sampleNumber).map(o => {
                return {
                    ...o,
                    identityNumber: util.idNoDesensitization(o.identityNumber)
                }
            })
            if (reservations.length > 0) {
                displayedLogs.push({
                    sampleNumber,
                    reservations
                })
                recordNum += reservations.length;
            }
            index += 1;
        }

        this.lastMatchIndex = index
        const data = {
            displayedLogs,
            searchInput,
            tab: 'human'
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
    logsReachBottom() {
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
        let reservationList = this.reservationList;
        if (searchInput) {
            reservationList = reservationList.filter(r => {
                return (r.name || "").includes(searchInput) ||
                    (r.identityNumber || '').includes(searchInput) ||
                    (r.sampleNumber || '').includes(searchInput)
            })
        }
        let recordNum = 0
        const displayedLogs = [...this.data.displayedLogs];
        while (index < sampleNumberList.length && recordNum < 30) {
            const sampleNumber = sampleNumberList[index];
            const reservations = reservationList
                .filter(o => o.sampleNumber === sampleNumber)
                .map(o => {
                    return {
                        ...o,
                        identityNumber: util.idNoDesensitization(o.identityNumber)
                    }
                })
            if (reservations.length > 0) {
                displayedLogs.push({
                    sampleNumber,
                    reservations
                })
                recordNum += reservations.length;
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
        const reservationId = e.currentTarget.dataset.id;
        wx.showLoading({
            title: '查询中...',
            mask: true
        })
        queryReservationById(reservationId)
            .then(res => {
                wx.hideLoading();
                if (['PROCESSING'].includes(res.status) && ['UNPAID', 'PAID'].includes(res.paymentStatus)) {
                    wx.showModal({
                        title: '提示',
                        content: '确认废弃该' + res.name + '的预约?',
                        success: (modalRes) => {
                            if (!modalRes.confirm) {
                                return;
                            }
                            invalidReservation(reservationId).then(invalidRes => {
                                wx.showToast({
                                    title: "操作成功",
                                    icon: "success",
                                    duration: 2000,
                                });

                                const nextReservationList = that.reservationList.filter(o => o.id !== res.id)
                                wx.setStorageSync(StorageKey.reservationList, nextReservationList);

                                let nextSampleNumberList = that.sampleNumberList;
                                const index = nextReservationList.findIndex(o => o.sampleNumber === res.sampleNumber);
                                if (index < 0) {
                                    nextSampleNumberList = nextSampleNumberList.filter(n => n !== res.sampleNumber)
                                    wx.setStorageSync(StorageKey.sampleNumberList, nextSampleNumberList)
                                }

                                that.loadData('human')
                            }).catch((error) => {
                                wx.showToast({
                                    title: "操作失败",
                                    icon: "error",
                                    duration: 2000,
                                });
                            })
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

        wx.showLoading({
            title: '查询中...',
            mask: true
        })
        const reservationId = e.currentTarget.dataset.id;
        queryReservationById(reservationId)
            .then(res => {
                wx.hideLoading();
                if (["NEW", 'PROCESSING'].includes(res.status) && ['UNPAID', 'PAID'].includes(res.paymentStatus)) {
                    wx.setStorageSync(StorageKey.humanModify, res)
                    navigateToPage('pages/humanSampling/humanSampling')
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
})