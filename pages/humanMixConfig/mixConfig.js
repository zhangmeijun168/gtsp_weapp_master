import {
    StorageKey,
    CReservationType,
    CSampleSubType
} from '../../utils/config'

const defaultConfig = {
    /** 预约类型 */
    type: '团体',
    /** 混合模式, radio选项 */
    mixMode: '',
    /** 自定义混合数 */
    selfDefinedNum: '',
    /** 样本采集日期 */
    samplingDate: null,
    /** 单位 */
    unit: '',
    /** 岗位 */
    job: '',
    /** 地址 */
    address: '',
    /** 样本类型 */
    sampleSubType: '口咽拭子'
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
            name: 'unit',
            rules: [{
                validator(rule, value, _a, form) {
                    if (!value && form.type === '团体') {
                        return '请填写单位'
                    }
                }
            }]
        }],
        /** 表单数据 */
        mixConfigForm: {
            ...defaultConfig
        },
        /** 预约类型列表 */
        typeOptions: CReservationType,
        sampleSubType: CSampleSubType,
        /** 汇总计数 */
        reservationCount: 0,
        tubeCount: 0,
    },
    onLoad() {},
    onShow() {
        const reservationList = wx.getStorageSync(StorageKey.reservationList) || [];
        const tubeList = wx.getStorageSync(StorageKey.sampleNumberList) || [];
        this.setData({
            reservationCount: reservationList.length,
            tubeCount: tubeList.length,
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

        // if (field === 'type') {
        //     nextData[`mixConfigForm.unit`] = ''
        // }
        this.setData(nextData);
    },
    openUnitList() {
        const child = this.selectComponent('#input-log-select');
        child.showDialog('unit')
    },
    onTapRecord(e) {
        const {
            type,
            value
        } = e.detail
        this.setData({
            "mixConfigForm.unit": value
        });
    },
    setTagInput(e) {
        const {
            field,
            name = ''
        } = e.currentTarget.dataset
        this.setData({
            [`mixConfigForm.${field}`]: name,
        })
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

            // let paramStr = "mixNum=" + this.data.mixNumList[this.data.mixConfigForm.mixNum].value;
            // paramStr += "&type=" + this.data.mixConfigForm.type;

            const mixNum = this.data.mixConfigForm.mixMode === 'selfDefined' ? Number(this.data.mixConfigForm.selfDefinedNum) : Number(this.data.mixConfigForm.mixMode);
            wx.setStorageSync(StorageKey.mixNum, mixNum)
            wx.setStorageSync(StorageKey.type, this.data.mixConfigForm.type)

            // const samplingDate = this.data.mixConfigForm.samplingDate;
            // wx.setStorageSync(StorageKey.samplingDate, samplingDate)
            // if (samplingDate) {
            //     paramStr += "&samplingDate=" + this.data.mixConfigForm.samplingDate
            // }
            const unit = this.data.mixConfigForm.unit;
            wx.setStorageSync(StorageKey.unit, unit)
            if (unit && this.data.mixConfigForm.type === '团体') {
                // paramStr += "&unit=" + unit

                // 保存单位/岗位至本地存储
                const hisUnit = wx.getStorageSync(StorageKey.hisUnit) || []
                const nextHisUnit = Array.from(new Set([unit, ...hisUnit])).slice(0, 50)
                wx.setStorageSync(StorageKey.hisUnit, nextHisUnit);
            }

            const job = this.data.mixConfigForm.job;
            wx.setStorageSync(StorageKey.job, job)
            if (job) {
                // paramStr += "&job=" + job

                // 保存单位/岗位至本地存储
                const hisJob = wx.getStorageSync(StorageKey.hisJob) || []
                const nextHisJob = Array.from(new Set([job, ...hisJob])).slice(0, 50)
                wx.setStorageSync(StorageKey.hisJob, nextHisJob)
            }

            const address = this.data.mixConfigForm.address;
            wx.setStorageSync(StorageKey.address, address)

            const sampleSubType = this.data.mixConfigForm.sampleSubType;
            wx.setStorageSync(StorageKey.sampleSubType, sampleSubType)

            // if (address) {
            //     paramStr += "&address=" + address;
            // }
            wx.setStorageSync(StorageKey.submitForm, [])
            wx.setStorageSync(StorageKey.sampleNumber, '')
            wx.navigateTo({
                url: '/pages/humanSampling/humanSampling',
            })
        })
    }
})