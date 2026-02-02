import {
    StorageKey,
    mixBatchNoList
} from "../../utils/config"

Component({
    properties: {},
    data: {
        isShowDialog: false,
        type: '',
        list: [],
    },
    methods: {
        showDialog(type, options) {
            let list = [];
            if (type === 'job') {
                list = wx.getStorageSync(StorageKey.hisJob) || [];
            } else if (type === 'unit') {
                list = wx.getStorageSync(StorageKey.hisUnit) || [];
            } else if (type === 'env-unit') {
                list = (wx.getStorageSync(StorageKey.envHisUnit) || []).map(o => ({
                    ...o,
                    desc: o.unit
                }));
            } else if (type === 'env-address') {
                list = (wx.getStorageSync(StorageKey.envHisUnit) || []).map(o => o.address).filter(o => !!o)
            } else if (type === 'env-batchNo') {
                list = wx.getStorageSync(StorageKey.envBatchNo) || [];
                list = Array.from(new Set(list.concat(...mixBatchNoList))).slice(0, 50)
            } else if (type === 'env-name') {
                try {
                    list = (wx.getStorageSync(StorageKey.envSampleLabels) || {})[options || ''];
                } catch (error) {}
            } else if (type === 'stationList') {
                list = [{
                    id: '',
                    name: "全部"
                }].concat(wx.getStorageSync(StorageKey.stationList) || []).map(o => ({
                    ...o,
                    desc: o.name
                }))
            }
            this.setData({
                isShowDialog: true,
                type,
                list
            })
        },
        onTapRecord(e) {
            this.setData({
                isShowDialog: false
            })
            this.triggerEvent('onTapRecord', {
                type: this.data.type,
                value: e.target.dataset.item
            })
        },
    }
})