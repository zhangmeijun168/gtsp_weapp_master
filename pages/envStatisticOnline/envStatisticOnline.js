// pages/envStatisticOnline/envStatisticOnline.js
import {
    StorageKey
} from "../../utils/config"
import {
    queryOnlineList
} from '../../services/envSampling'
const moment = require('../../utils/moment.min')

Page({
    data: {
        dateStr: '',
        showList: [],
        tubeCount: 0,
        entityCount: 0,
        stationName: '',
        stationList: [],
        stationId: '',

        /** 明细页 */
        showDetail: false,
        unitDesc: '',
        detailList: [],
    },
    userId: '',
    loading: 0,
    statisticData: [],
    unitDetails: [],
    currntPage: 0,
    pageSize: 20,
    onLoad() {
        this.userId = wx.getStorageSync(StorageKey.userId);
        const stationList = wx.getStorageSync(StorageKey.stationList);
        const curStationId = wx.getStorageSync(StorageKey.userCurStation(this.userId))
        const curStationObj = stationList.find(o => o.id === curStationId) || {};
        this.curStation = curStationObj.id
        this.setData({
            dateStr: moment().format('YYYY-MM-DD'),
            stationList: stationList,
            stationName: curStationObj.name,
            stationId: curStationObj.id
        })
        this.fetchData()
    },
    async fetchData() {
        const prefix = this.data.dateStr;
        wx.showLoading({
            title: '加载中',
        })
        try {
            const data = await queryOnlineList({
                samplingDateStart: moment(prefix + " 00:00:00").utc().format('YYYY-MM-DD HH:mm:ss'),
                samplingDateEnd: moment(prefix + ' 23:59:59').utc().format('YYYY-MM-DD HH:mm:ss'),
                reservationOprId: this.userId,
                station: this.data.stationId
            })

            const sampleNumberMix = [];
            const unitSampleNumber = [];
            (data || []).forEach((env) => {
                const sampleNumberIndex = sampleNumberMix.findIndex(o => o.sampleNumber === env.number);
                if (sampleNumberIndex > -1) {
                    sampleNumberMix[sampleNumberIndex].count += 1
                } else {
                    sampleNumberMix.push({
                        sampleNumber: env.number,
                        count: 1
                    })
                }

                const unitIndex = unitSampleNumber.findIndex(o => o.unit === env.unit);
                if (unitIndex > -1) {
                    const sampleNumbers = unitSampleNumber[unitIndex].sampleNumbers
                    const sampleNumberIndex = sampleNumbers.findIndex(p => p.sampleNumber === env.number);
                    if (sampleNumberIndex > -1) {
                        sampleNumbers[sampleNumberIndex].objs.push(env)
                    } else {
                        sampleNumbers.push({
                            sampleNumber: env.number,
                            objs: [env]
                        })
                    }
                } else {
                    unitSampleNumber.push({
                        unit: env.unit,
                        sampleNumbers: [{
                            sampleNumber: env.number,
                            objs: [env]
                        }]
                    })
                }
            })

            this.statisticData = unitSampleNumber.map((o) => {
                let tubeCount = 0;
                let entityCount = 0;
                const mix = o.sampleNumbers.map(p => {
                    return {
                        ...p,
                        mixCount: sampleNumberMix.find(q => q.sampleNumber === p.sampleNumber).count
                    }
                }).reduce((prev, curr) => {
                    const {
                        mixCount,
                        ...others
                    } = curr
                    const mixIndex = prev.findIndex(p => p.mixCount === mixCount)
                    if (mixIndex > -1) {
                        prev[mixIndex].sampleNumbers.push(others)
                        prev[mixIndex].entityCount += others.objs.length
                    } else {
                        prev.push({
                            mixCount,
                            mixDesc: mixCount === 1 ? '单混' : (mixCount + "混"),
                            sampleNumbers: [others],
                            entityCount: others.objs.length
                        })
                    }
                    tubeCount++;
                    entityCount += others.objs.length;
                    return prev;
                }, []).sort((a, b) => a.mixCount - b.mixCount)

                return {
                    unit: o.unit,
                    tubeCount,
                    entityCount,
                    mix
                }
            })
            this.setData({
                showList: this.statisticData,
                tubeCount: sampleNumberMix.length,
                entityCount: (data || []).length
            })
            // console.log(this.statisticData)
            wx.hideLoading()
        } catch (error) {
            console.log(error)
            wx.hideLoading({})
            wx.showToast({
                title: '通讯异常',
                icon: 'error'
            })
        }
    },
    refreshData() {
        const time = new Date().getTime()
        if (time - this.loading < 1500) {
            return;
        }
        this.loading = time;
        this.fetchData()
    },
    onDateChange(e) {
        this.setData({
            dateStr: e.detail.value
        })
        this.fetchData()
    },
    openDetail(e) {
        const time = new Date().getTime()
        if (time - this.loading < 1500) {
            return;
        }
        const unit = e.currentTarget.dataset.unit;
        const obj = this.statisticData.find(o => o.unit === unit)
        this.unitDetails = obj.mix.reduce((prev, curr) => {
            const {
                mixCount,
                mixDesc,
                sampleNumbers,
            } = curr;

            sampleNumbers.forEach(p => {
                prev.push({
                    sampleNumber: p.sampleNumber,
                    objs: p.objs,
                    mixCount,
                    mixDesc,
                })
            })

            return prev;
        }, []).sort((a, b) => {
            if (a.mixCount !== b.mixCount) {
                return a.mixCount - b.mixCount
            }
            return a.sampleNumber > b.sampleNumber
        })

        this.loadDetail(unit || '无单位')
    },
    loadDetail(unit) {
        this.setData({
            detailList: this.unitDetails,
            showDetail: true,
            unit: unit || this.data.unit
        })
    },
    onChangeStation(e) {
        const station = this.data.stationList[e.detail.value];
        this.setData({
            stationName: station.name,
            stationId: station.id
        });
        this.fetchData()
    },
})