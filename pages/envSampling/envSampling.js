const moment = require('../../utils/moment.min');
const {
  createEnvSample,
  queryList,
  updateEnvSample,
} = require('../../services/envSampling');
import {
  StorageKey
} from '../../utils/config'
import util from '../../utils/util'

Page({
  data: {
    /** 混合数 */
    mixNum: 1,
    /** 当前样本编号采集数 */
    curNum: 1,

    formData: {
      source: 'WEAPP',
      type: '环境',
      quantity: 1,
      name: '',
      samplingDate: '',
      batchNo: '',
      unit: '',
      address: '',
      remark: '',
      id: null,
      number: ''
    },
    rules: [{
      name: 'number',
      rules: {
        required: true,
        message: '样本编号必填'
      },
    }, {
      name: 'name',
      rules: {
        required: true,
        message: '样本名称必填'
      },
    }, {
      name: 'quantity',
      rules: [{
        required: true,
        message: '采集数量必填'
      }, {
        number: true,
        message: '采集数量必填'
      }],
    }, {
      name: 'unit',
      rules: {
        required: true,
        message: '委托单位必填'
      },
    }, {
      name: 'samplingDate',
      rules: {
        required: true,
        message: '采样日期必填'
      },
    }, {
      name: 'address',
      rules: {
        required: true,
        message: '采样地址必填'
      }
    }, {
      name: 'batchNo',
      rules: {
        required: true,
        message: '送检批次必填'
      }
    }],
    typeOptions: [{
      name: '环境',
      value: '环境'
    }, {
      name: '外包装',
      value: '外包装'
    }, {
      name: '肉类',
      value: '肉类'
    }, {
      name: '水产品',
      value: '水产品'
    }],

    error: '',
    /** 环境样本列表长度 */
    envCount: 0,
    /** 试管编号列表长度 */
    tubeCount: 0,
  },
  initForm: {
    id: null,
    name: '',
    samplingDate: '',
    batchNo: '',
    unit: '',
    address: '',
    remark: ''
  },
  /** 环境样本列表 */
  envSampleList: [],
  /** 试管编号列表 */
  sampleNumberList: [],
  /** 防止用户频繁操作 */
  loading: 0,
  modifyFlag: false,
  /** 从相机回来 */
  camera: false,
  /** 目前采集点 */
  curStation: undefined,
  onLoad() {
    this.curStation = wx.getStorageSync(StorageKey.userCurStation(wx.getStorageSync(StorageKey.userId)))
    this.initForm = {
      ...this.initForm,
      samplingDate: wx.getStorageSync(StorageKey.samplingDate),
      batchNo: wx.getStorageSync(StorageKey.batchNo) || "",
      unit: wx.getStorageSync(StorageKey.unit) || "",
      address: wx.getStorageSync(StorageKey.address) || "",
      remark: wx.getStorageSync(StorageKey.remark) || ""
    }
  },
  onShow() {
    if (this.camera) {
      this.camera = false;
      return;
    }
    const envSampleList = wx.getStorageSync(StorageKey.envSampleList) || [];
    const sampleNumberList = wx.getStorageSync(StorageKey.envSampleNumberList) || []
    const number = wx.getStorageSync(StorageKey.envSampleNumber)
    const curNum = envSampleList.filter(o => o.number === number).length;

    let formData = {
      ...this.data.formData,
      ...this.initForm,
      number
    }

    const envModify = wx.getStorageSync(StorageKey.envModify)
    if (envModify) {
      this.modifyFlag = true;
      formData = {
        ...formData,
        id: envModify.id,
        name: envModify.name,
        address: envModify.address,
        batchNo: envModify.batchNo,
        number: envModify.number,
        remark: envModify.remark,
        samplingDate: util.formatTim(new Date(envModify.samplingDate)),
        type: envModify.type,
        unit: envModify.unit,
      }
      wx.setStorageSync(StorageKey.envModify, undefined)
    }

    this.envSampleList = envSampleList;
    this.sampleNumberList = sampleNumberList;
    this.setData({
      mixNum: wx.getStorageSync(StorageKey.mixNum),
      curNum,
      formData,
      envCount: envSampleList.length,
      tubeCount: sampleNumberList.length
    });
  },
  formInputChange(e) {
    const {
      field
    } = e.currentTarget.dataset;
    const {
      value
    } = e.detail;
    this.setData({
      [`formData.${field}`]: value,
    });
  },
  onSampleNumberChange(e) {
    const number = e.detail.value;
    wx.setStorageSync(StorageKey.envSampleNumber, number)
    const curNum = this.envSampleList
      .filter(r => r.number === number)
      .length;
    this.setData({
      curNum
    })
  },
  handleError(error) {
    if (error.toptipContent) {
      this.setData({
        ...error
      })
    } else {
      console.log(error)
      this.setData({
        toptipContent: '发生错误',
        toptipType: 'error'
      })
    }
  },
  scanSampleNumber() {
    const _this = this;
    _this.camera = true;
    wx.scanCode({
      success(res) {
        const number = res.result;
        const curNum = _this.envSampleList
          .filter(r => r.number === number)
          .length;
        wx.setStorageSync(StorageKey.envSampleNumber, number)
        _this.setData({
          'formData.number': number,
          curNum
        })
      },
      fail(res) {
        _this.setData({
          error: '识别无结果'
        })
      }
    })
  },
  openEnvNameList() {
    const child = this.selectComponent('#input-log-select');
    child.showDialog('env-name', this.data.formData.type)
  },
  openUnitList() {
    const child = this.selectComponent('#input-log-select');
    child.showDialog('env-unit')
  },
  openBatchNoList() {
    const child = this.selectComponent('#input-log-select');
    child.showDialog('env-batchNo')
  },
  openAddressList(e) {
    const child = this.selectComponent('#input-log-select');
    child.showDialog('env-address')
  },
  onTapRecord(e) {
    const {
      type,
      value
    } = e.detail
    this.setData({
      [`formData.${type.split('-')[1]}`]: value
    });
  },
  setTagInput(e) {
    const {
      field,
      name = ''
    } = e.currentTarget.dataset
    this.setData({
      [`formData.${field}`]: name,
    })
  },
  async submitForm() {
    if (new Date().getTime() - this.loading < 1500) {
      return;
    }
    this.loading = new Date().getTime()
    this.selectComponent('#form').validate(async (valid, errors) => {
      if (!valid) {
        const firstError = Object.keys(errors)
        if (firstError.length) {
          this.setData({
            error: errors[firstError[0]].message
          })
          return;
        }
      }

      const {
        number: tempNumber,
        samplingDate: tempSamplingDate,
        ...others
      } = this.data.formData;
      const number = String(tempNumber).trim();
      const samplingDate = moment(tempSamplingDate)
      const postData = {
        ...others,
        number,
        samplingDate,
        station: this.curStation
      }

      await new Promise((resolve, reject) => {
        let modalContent = '';
        const sampleNumberCount = this.envSampleList.filter(o => number === o.number && postData.id !== o.id).length

        if (sampleNumberCount >= this.data.mixNum) {
          modalContent += '样本编号' + number + '已采集' + sampleNumberCount + '次,'
        }
        if (modalContent) {
          wx.showModal({
            title: '提示',
            content: modalContent + '是否继续?',
            success: (res) => {
              if (res.confirm) {
                resolve(null)
              } else {
                reject(null)
              }
            },
          })
          return;
        } else {
          resolve(null)
        }
      })

      wx.showLoading({
        title: '校验中...',
        mask: true
      })
      const res_2 = await queryList({
        page: 1,
        limit: 1000,
        number
      })
      const diff = (res_2.data || []).map((r) => {
        if (r.id === postData.id) {
          return false;
        }
        //采集日期相差超过1天
        const rSamplingDate = r.samplingDate
        if (rSamplingDate && moment(rSamplingDate).diff(samplingDate, 'day') !== 0) {
          return true
        }

        return false
      }).some((r) => r) || false

      if (diff) {
        wx.hideLoading()
        this.setData({
          error: '样本编号已被使用, 无法保存',
        })
        return;
      }

      wx.showLoading({
        title: '保存中...',
        mask: true
      });

      try {
        let res;
        if (!postData.id) {
          // 创建环境样本
          res = await createEnvSample(postData)
          if (res && res.envSample && res.envSample.id) {
            postData.id = res.envSample.id
          }
        } else {
          // 更新环境样本信息
          res = await updateEnvSample(this.data.formData)
        }

        wx.hideLoading()
        wx.showToast({
          title: "采集完成",
          icon: "success",
          duration: 2000,
        });

        const modifyFlag = this.modifyFlag;

        const nextEnvSampleList = [...this.envSampleList]
        const eIndex = nextEnvSampleList.findIndex(s => s.id === postData.id)
        if (eIndex > -1) {
          nextEnvSampleList.splice(eIndex, 1)
        }
        nextEnvSampleList.unshift(postData)
        wx.setStorageSync(StorageKey.envSampleList, nextEnvSampleList)

        const nextSampleNumberList = nextEnvSampleList
          .map(o => o.number)
          .reduce((pre, cur) => {
            if (!pre.includes(cur)) {
              pre.push(cur)
            }
            return pre;
          }, []);
        wx.setStorageSync(StorageKey.envSampleNumberList, nextSampleNumberList);

        let curNum = nextEnvSampleList.filter(o => o.number === number).length;
        if (curNum >= this.data.mixNum && !this.modifyFlag) {
          curNum = 0;
          wx.setStorageSync(StorageKey.envSampleNumber, undefined)
        }

        const {
          type,
          name
        } = postData;
        const sampleLabels = wx.getStorageSync(StorageKey.envSampleLabels) || {};
        sampleLabels[type] = Array.from(new Set([name, ...(sampleLabels[type] || [])])).slice(0, 50);
        wx.setStorageSync(StorageKey.envSampleLabels, sampleLabels)

        this.envSampleList = nextEnvSampleList;
        this.sampleNumberList = nextSampleNumberList;
        this.modifyFlag = false;
        this.setData({
          curNum,
          formData: {
            ...this.data.formData,
            ...this.initForm,
            number: curNum === 0 ? null : number
          },
          envCount: nextEnvSampleList.length,
          tubeCount: nextSampleNumberList.length,
        })

        if (modifyFlag) {
          util.navigateToPage('pages/envStatistic/envStatistic', 'tab=env')
        }

      } catch (err) {
        wx.hideLoading()
        wx.showToast({
          title: '添加失败，请稍后重试',
          icon: 'error',
          duration: 2000,
        });
        throw err
      }
    })
  },
  generateNextSampleCode() {
    const generateFunc = (n) => {
      // 递增编号 如:0X100X99 递增后0X101X00. 0X101X00递增后：0X101X01
      const v = [];
      for (let i = 0; i < n.length; i += 1) {
        // 将字符串撤分放入数组
        v.push(n[i]);
      }

      for (let i = v.length - 1; i >= 0; i -= 1) {
        const num = Number(v[i])
        if (Number.isInteger(num)) {
          const x = num + 1;
          if (x > 9) {
            v[i] = 0;
          } else {
            // 到达这里已累加不用再循环
            v[i] = x;
            break;
          }
        }
      }
      return v.join('');
    };
    let curSampleNumber = this.data.formData.number
    if (!curSampleNumber) {
      curSampleNumber = this.sampleNumberList[0]
    }
    if (curSampleNumber) {
      const nextSampleNumber = generateFunc(curSampleNumber);
      const curNum = this.envSampleList
        .filter(r => r.number === nextSampleNumber)
        .length;
      wx.setStorageSync(StorageKey.envSampleNumber, nextSampleNumber)
      this.setData({
        ['formData.number']: nextSampleNumber,
        curNum
      })
    }
  },
})