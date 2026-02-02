import {
    StorageKey
} from '../../utils/config'
import util from '../../utils/util'

const defaultConfig = {
    /** 混合模式, radio选项 */
    mixMode: '',
    /** 自定义混合数 */
    selfDefinedNum: '',
    /** 样本采集日期 */
    samplingDate: util.formatTim(new Date()),
    /** 单位 */
    unit: '',
    /** 地址 */
    address: '',
    /** 送检批次 */
    batchNo: '',
    /** 备注 */
    remark: '',
}

Page({
    data: {
        /** 表单错误信息 */
        errors: '',
        /** 表单校验规则 */
        mixConfigRule: [{
            name: 'mixMode',
            rules: [{
                validator(rule, value, n, allValues) {
                    if (!value) {
                        return '请选择采集模式'
                    }
                    if (value === 'selfDefined') {
                        if (!allValues.selfDefinedNum) {
                            return '请填写混合数'
                        }
                        const num = Number(allValues.selfDefinedNum);
                        if (!Number.isInteger(num) || num <= 0) {
                            return '请确认混合数为正整数'
                        }
                    }
                }
            }]
        }, {
            name: 'batchNo',
            rules: [{
                required: true,
                message: "请输入送检批次"
            }, ]
        }, {
            name: 'unit',
            rules: [{
                required: true,
                message: "请选输入送检单位"
            }, ]
        }],
        /** 表单数据 */
        mixConfigForm: {
            ...defaultConfig
        },
        /** 汇总计数 */
        envCount: 0,
        tubeCount: 0,
    },
    onLoad() {},
    onShow() {
        const envSampleList = wx.getStorageSync(StorageKey.envSampleList) || [];
        const envSampleNumberList = wx.getStorageSync(StorageKey.envSampleNumberList) || [];
        this.setData({
            envCount: envSampleList.length,
            tubeCount: envSampleNumberList.length,
        })
    },
    clearForm() {
        this.setData({
            mixConfigForm: {
                ...defaultConfig
            },
        })
    },
    formFieldChange(e) {
        const {
            field
        } = e.currentTarget.dataset;
        const {
            value
        } = e.detail;
        const nextData = {
            [`mixConfigForm.${field}`]: value,
        };
        this.setData(nextData);
    },
    openBatchNoList() {
        const child = this.selectComponent('#input-log-select');
        child.showDialog('env-batchNo')
    },
    openUnitList() {
        const child = this.selectComponent('#input-log-select');
        child.showDialog('env-unit')
    },
    openAddressList() {
        const child = this.selectComponent('#input-log-select');
        child.showDialog('env-address')
    },
    setTagInput(e) {
        const {
            field,
            name = ''
        } = e.currentTarget.dataset
        this.setData({
            [`mixConfigForm.${field}`]: name
        })
    },
    onTapRecord(e) {
        const {
            type,
            value
        } = e.detail
        if (type === 'env-unit') {
            this.setData({
                [`mixConfigForm.unit`]: value.unit,
                [`mixConfigForm.address`]: value.address
            });
        } else {
            this.setData({
                [`mixConfigForm.${type.split('-')[1]}`]: value,
            })
        }
    },
    goNextStep() {
        this.selectComponent('#mix-config').validate((valid, errors) => {
            if (!valid) {
                const firstError = Object.keys(errors);
                if (firstError.length) {
                    this.setData({
                        error: errors[firstError[0]].message
                    })
                }
                return;
            }

            const mixNum = this.data.mixConfigForm.mixMode === 'selfDefined' ? Number(this.data.mixConfigForm.selfDefinedNum) : Number(this.data.mixConfigForm.mixMode);
            wx.setStorageSync(StorageKey.mixNum, mixNum)

            const samplingDate = this.data.mixConfigForm.samplingDate;
            wx.setStorageSync(StorageKey.samplingDate, samplingDate)
            const batchNo = this.data.mixConfigForm.batchNo;
            wx.setStorageSync(StorageKey.batchNo, batchNo)
            const unit = this.data.mixConfigForm.unit;
            wx.setStorageSync(StorageKey.unit, unit)
            const address = this.data.mixConfigForm.address;
            wx.setStorageSync(StorageKey.address, address)
            const remark = this.data.mixConfigForm.remark;
            wx.setStorageSync(StorageKey.remark, remark)
            wx.setStorageSync(StorageKey.envSampleNumber, '')

            if (unit) {
                // 保存单位至本地存储
                const hisUnit = wx.getStorageSync(StorageKey.envHisUnit) || []
                const index = hisUnit.findIndex(o => o.unit === unit)
                if (index > -1) {
                    hisUnit.splice(index, 1)
                }
                hisUnit.unshift({
                    unit,
                    address
                })
                wx.setStorageSync(StorageKey.envHisUnit, hisUnit.slice(0, 50));
            }

            if (batchNo) {
                const batchNoList = wx.getStorageSync(StorageKey.envBatchNo) || []
                const nextBatchNo = Array.from(new Set([batchNo, ...batchNoList])).slice(0, 50)
                wx.setStorageSync(StorageKey.envBatchNo, nextBatchNo)
            }

            wx.navigateTo({
                url: '/pages/envSampling/envSampling',
            })
        })
    }
})