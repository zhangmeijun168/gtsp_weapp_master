const moment = require('../../utils/moment.min');
const util = require("../../utils/util.js");
import {
  CReservationType,
  CSampleSubType,
  StorageKey
} from '../../utils/config';
import {
  queryReservations,
  queryReservationById,
  queryReservationsList,
  saveReservations,
  addReservations,
  getPreRegistration,
} from "../../services/reservation";
import {
  navigateToPage
} from '../../utils/util.js';

Page({
  data: {
    /** 混合数 */
    mixNum: 1,
    /** 当前样本编号采集数 */
    curNum: 1,

    /** 填写的表单 */
    defaultForm: {
      samplingDate: undefined,
      sampleNumber: undefined,
      id: undefined,
      name: undefined,
      identityNumber: undefined,
      phone: undefined,
      birthday: undefined,
      gender: 'MALE',
      unit: undefined,
      job: undefined,
      highRisk14th: "false",
      signs: "false",
      address: undefined,
      remark: undefined,
      type: undefined,
      paymentStatus: undefined,
      freeIdentity: undefined,
      sampleSubType: undefined,
    },
    defaultFormRule: [{
      name: "sampleNumber",
      rules: [{
        required: true,
        message: "样本编号必填",
      }, {
        validator(rule, value) {
          const sampleNumberPrefix = wx.getStorageSync(StorageKey.sampleNumberPrefix);
          if (
            Array.isArray(sampleNumberPrefix) &&
            sampleNumberPrefix.length > 0 &&
            !sampleNumberPrefix.some((i) => value && value.startsWith(i))
          ) {
            return '样本编号前缀与预设不相符，请重新填写'
          }
        }
      }],
    }, {
      name: 'name',
      rules: {
        required: true,
        message: "姓名必填",
      },
    }, {
      name: "identityNumber",
      rules: [{
        required: true,
        message: "证件号码必填",
      }, {
        validator(rule, value) {
          if (value.length < 5) {
            return '证件号码最少5个字符'
          }
        }
      }],
    }, {
      name: 'phone',
      rules: [{
        required: true,
        message: "联系电话必填",
      }, {
        validator(rule, value) {
          const pass = /^1[3456789]\d{9}$/.test(value)
          if (!pass) {
            return '联系电话格式不正确'
          }
        }
      }]
    }, {
      name: "gender",
      rules: {
        required: true,
        message: "性别必填",
      },
    }, {
      name: "birthday",
      rules: {
        required: true,
        message: "出生日期必填",
      },
    }, {
      name: "highRisk14th",
      rules: {
        required: true,
        message: "14日是否经停高危区必选",
      },
    }, {
      name: "signs",
      rules: {
        required: true,
        message: "体征必选",
      },
    }],

    toptipContent: '',
    toptipType: 'error',

    /** 预约类型列表 */
    typeOptions: CReservationType,
    sampleSubType: CSampleSubType,
    genderItem: [{
      name: "男",
      value: "MALE",
    }, {
      name: "女",
      value: "FEMALE",
    }],
    yesOrNo: [{
      name: "是",
      value: "true",
    }, {
      name: "否",
      value: "false",
    }],

    /** 预约列表长度 */
    humanCount: 0,
    /** 试管编号列表长度 */
    tubeCount: 0,
  },
  /** 修改标志位 */
  modifyFlag: false,
  /** 防止用户频繁操作 */
  loading: 0,
  /** 当前选择车站id */
  curStation: '',
  /** 预约列表 */
  reservationList: [],
  /** 试管编号列表 */
  sampleNumberList: [],
  /** 从相机回来 */
  camera: false,
  /** 表单初始值 */
  initInfo: {
    id: undefined,
    name: undefined,
    identityNumber: undefined,
    phone: undefined,
    birthday: undefined,
    gender: 'MALE',
    unit: undefined,
    job: undefined,
    highRisk14th: "false",
    signs: "false",
    address: undefined,
    remark: undefined,
    type: undefined,
    paymentStatus: undefined,
    freeIdentity: undefined,
    sampleSubType: undefined
  },

  onLoad() {
    const passParam = {
      // samplingDate: options.samplingDate ? options.samplingDate : moment().format('YYYY-MM-DD'),
      unit: wx.getStorageSync(StorageKey.unit) || null,
      job: wx.getStorageSync(StorageKey.job) || null,
      address: wx.getStorageSync(StorageKey.address) || null,
      type: wx.getStorageSync(StorageKey.type),
      sampleSubType: wx.getStorageSync(StorageKey.sampleSubType) || '口咽拭子'
    }
    this.initInfo = {
      ...this.initInfo,
      ...passParam
    };
    this.curStation = wx.getStorageSync(StorageKey.userCurStation(wx.getStorageSync(StorageKey.userId)))
  },
  onShow() {
    if (this.camera) {
      this.camera = false;
      return;
    }
    const reservationList = wx.getStorageSync(StorageKey.reservationList) || [];
    const sampleNumberList = wx.getStorageSync(StorageKey.sampleNumberList) || [];
    const sampleNumber = wx.getStorageSync(StorageKey.sampleNumber)

    const curNum = reservationList.filter(o => o.sampleNumber === sampleNumber).length;
    let defaultForm = {
      ...this.data.defaultForm,
      ...this.initInfo,
      sampleNumber,
    };

    const humanModify = wx.getStorageSync(StorageKey.humanModify)
    if (humanModify) {
      this.modifyFlag = true;
      defaultForm = {
        ...defaultForm,
        id: humanModify.id,
        name: humanModify.name,
        identityNumber: humanModify.identityNumber,
        phone: humanModify.phone || this.initInfo.phone,
        birthday: util.formatTim(new Date(humanModify.birthday)) || this.initInfo.birthday,
        gender: humanModify.gender || this.initInfo.gender,
        unit: humanModify.unit || this.initInfo.unit,
        job: humanModify.job || this.initInfo.job,
        highRisk14th: humanModify.highRisk14th + "" || this.initInfo.highRisk14th,
        signs: humanModify.signs + "" || this.initInfo.signs,
        address: humanModify.address || this.initInfo.address,
        remark: humanModify.remark || this.initInfo.remark,
        type: humanModify.type || this.initInfo.type,
        sampleSubType: humanModify.sampleSubType || this.initInfo.sampleSubType,
        paymentStatus: humanModify.paymentStatus,
        freeIdentity: humanModify.freeIdentity,
        sampleNumber: humanModify.sampleNumber
      }
      wx.setStorageSync(StorageKey.humanModify, undefined)
    }

    this.reservationList = reservationList;
    this.sampleNumberList = sampleNumberList;
    this.setData({
      mixNum: wx.getStorageSync(StorageKey.mixNum),
      curNum,
      defaultForm,
      tubeCount: sampleNumberList.length,
      humanCount: reservationList.length,
    })
  },
  defaultFormChange(e) {
    const {
      field
    } = e.currentTarget.dataset;
    const {
      value
    } = e.detail;
    this.setData({
      [`defaultForm.${field}`]: value
    });
  },
  onSampleNumberChange(e) {
    const sampleNumber = e.detail.value;
    wx.setStorageSync(StorageKey.sampleNumber, sampleNumber)
    const curNum = this.reservationList
      .filter(r => r.sampleNumber === sampleNumber)
      .length;
    this.setData({
      curNum
    })
  },
  setDefaultForm(resData, others = {}) {
    const that = this;
    const nextData = {
      defaultForm: {
        ...that.data.defaultForm,
        id: resData.id,
        name: resData.name,
        identityNumber: resData.identityNumber,
        phone: resData.phone || that.initInfo.phone,
        birthday: util.formatTim(new Date(resData.birthday)) || that.initInfo.birthday,
        gender: resData.gender || that.initInfo.gender,
        // 元基-单位和岗位以配置的默认值优先; 元码-单位和岗位以用户填写的值优先
        unit: resData.unit || that.initInfo.unit,
        job: resData.job || that.initInfo.job,
        highRisk14th: resData.highRisk14th + "" || that.initInfo.highRisk14th,
        signs: resData.signs + "" || that.initInfo.signs,
        address: resData.address || that.initInfo.address,
        remark: resData.remark || that.initInfo.remark,
        type: resData.type || that.initInfo.type,
        sampleSubType: that.initInfo.sampleSubType || resData.sampleSubType,
        paymentStatus: resData.paymentStatus,
        freeIdentity: resData.freeIdentity
      },
      ...others
    }
    if (others.sampleNumber) {
      nextData.defaultForm.sampleNumber = others.sampleNumber
    }
    that.setData(nextData);
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
  /** 扫描样本编号 */
  scanSampleNumber() {
    const that = this;
    return new Promise((resolve, reject) => {
      this.camera = true;
      wx.scanCode({
        success(res) {
          resolve(res.result)
        },
        fail() {
          reject({
            toptipContent: '识别无结果',
            toptipType: 'error'
          })
        }
      })
    }).then((sampleNumber) => {
      return new Promise((resolve, reject) => {
        const sampleNumberPrefix = wx.getStorageSync(StorageKey.sampleNumberPrefix);
        const notMatch = Array.isArray(sampleNumberPrefix) &&
          sampleNumberPrefix.length > 0 &&
          !sampleNumberPrefix.some((i) => sampleNumber.startsWith(i))
        if (notMatch) {
          reject({
            toptipContent: '样本编号前缀与预设不相符，请重新扫码',
            toptipType: 'error',
          });
        }
        const curNum = that.reservationList
          .filter(r => r.sampleNumber === sampleNumber)
          .length;
        wx.setStorageSync(StorageKey.sampleNumber, sampleNumber)
        that.setData({
          [`defaultForm.sampleNumber`]: sampleNumber,
          curNum
        })
        resolve();
      })
    }).catch(error => {
      that.handleError(error)
    })
  },
  /** 扫描身份证 */
  scanIDCard() {
    const that = this;
    return new Promise((resolve, reject) => {
      this.camera = true;
      //  选择图片
      wx.chooseImage({
        count: 1,
        success(res) {
          resolve(res.tempFilePaths[0])
        },
        fail() {
          reject({
            toptipContent: "身份证识别失败",
            toptipType: "error",
          });
        }
      })
    }).then(async (filePath) => {
      wx.showLoading({
        title: "识别中...",
        mask: true,
      });
      try {
        // 查询身份证信息
        return await wx.serviceMarket
          .invokeService({
            service: "wx79ac3de8be320b71", // '固定为服务商OCR的appid，非小程序appid',
            api: "OcrAllInOne",
            data: {
              img_url: new wx.serviceMarket.CDN({
                type: "filePath",
                filePath,
              }),
              data_type: 3,
              ocr_type: 1,
            },
          })
      } catch (error) {
        throw {
          toptipContent: "身份证识别失败",
          toptipType: "error",
        }
      }
    }).then(async (res) => {
      // console.log(res)
      // 表单赋值
      const resIdCard = res.data.idcard_res;
      that.setData({
        defaultForm: {
          ...that.data.defaultForm,
          identityNumber: resIdCard.id.text,
          address: resIdCard.address.text,
          birthday: resIdCard.birth.text,
          gender: resIdCard.gender.text === "男" ? "MALE" : "FEMALE",
          name: resIdCard.name.text,
        },
      });
      that.getReservations();
    }).catch(error => {
      wx.hideLoading();
      that.handleError(error)
    })
  },
  isSameStation(reservation) {
    if (reservation.station.id !== this.curStation) {
      this.setData({
        toptipContent: '预约采集站: ' + reservation.station.name,
        toptipType: 'info',
      })
      return false;
    }
    return true;
  },
  getReservations() {
    var that = this;
    if (!that.data.defaultForm.name || !that.data.defaultForm.identityNumber) {
      this.setData({
        toptipContent: '请先输入姓名/证件号码进行查询',
        toptipType: "error"
      });
      wx.hideLoading({})
      return;
    }
    wx.showLoading({
      title: "查询中...",
      mask: true,
    });
    return new Promise((resolve, reject) => {
        queryReservations({
          status: 'NEW',
          name: that.data.defaultForm.name,
          identityNumber: that.data.defaultForm.identityNumber,
        }).then(res => {
          resolve(res)
        }).catch(() => {
          reject({
            toptipContent: "查询失败",
            toptipType: "error",
          })
        })
      })
      .then(async (resData) => {
        wx.hideLoading()
        resData.data = (resData.data || []).filter((reservation) => {
          if (['UNPAID', 'PAID'].includes(reservation.paymentStatus)) {
            return true;
          }
          return false
        })
        if (resData.data.length <= 0) {
          throw {
            toptipContent: "无预约信息",
            toptipType: "error",
          }
        } else if (resData.data.length === 1) {
          const obj = resData.data[0];
          that.isSameStation(obj)
          that.setDefaultForm(obj)
        } else {
          wx.showActionSheet({
            itemList: resData.data.map(o => {
              const appointment = (o.appointment ?
                util.formatTim(new Date(o.appointment)) : null);
              const paidStatus = o.paymentStatus === 'PAID' ? '已支付' : o.freeIdentity ? '免费' : null;
              const mark = [appointment, paidStatus].filter(o => !!o).join('/');
              return o.tName + (mark ? `（${mark}）` : '')
            }).slice(0, 6),
            success(res) {
              const obj = resData.data[res.tapIndex];
              that.isSameStation(obj)
              that.setDefaultForm(obj)
            }
          })
        }
      })
      .catch((error) => {
        wx.hideLoading()
        that.handleError(error)
      });
  },
  getPreRegistrationNo(result) {
    try {
      const objMeta = JSON.parse(result);
      if (objMeta.type === 'pre-registration') {
        return objMeta.no;
      }
    } catch {
      return null;
    }
  },
  scanReserveId() {
    const that = this;
    return new Promise((resolve, reject) => {
      this.camera = true;
      wx.scanCode({
        onlyFromCamera: false,
        success(res) {
          resolve(res)
        },
        fail() {
          reject({
            toptipContent: '未能识别到预约码',
            toptipType: 'error',
          })
        }
      })
    }).then(async res => {
      const {
        result
      } = res;
      if (null != that.getPreRegistrationNo(result) || isNaN(+result)) {
        throw {
          toptipContent: "未能识别到预约码",
          toptipType: "error",
        }
      }
      wx.showLoading({
        title: '识别中...',
        mask: true
      })
      try {
        return await queryReservationById(Number(result))
      } catch (error) {
        throw {
          toptipContent: "查询失败",
          toptipType: "error",
        }
      }
    }).then(async (resData) => {
      wx.hideLoading();
      if (
        resData &&
        resData.status === "NEW" && ['UNPAID', 'PAID'].includes(resData.paymentStatus)
      ) {
        that.isSameStation(resData)
        that.setDefaultForm(resData);
      } else {
        throw {
          toptipContent: "查无数据",
          toptipType: "error",
        }
      }
    }).catch((error) => {
      wx.hideLoading();
      that.handleError(error)
    });
  },
  scanPreRegistration() {
    const that = this;
    return new Promise((resolve, reject) => {
      this.camera = true;
      wx.scanCode({
        onlyFromCamera: false,
        success(res) {
          resolve(res)
        },
        field() {
          reject({
            toptipContent: "未能识别到预登记码",
            toptipType: "error",
          })
        }
      });
    }).then(async (res) => {
      const {
        result
      } = res;
      const no = that.getPreRegistrationNo(result)
      if (null == no) {
        throw {
          toptipContent: '未能识别到预登记码',
          toptipType: 'error',
        }
      }
      wx.showLoading({
        title: '识别中...',
        mask: true
      })
      try {
        return await getPreRegistration(no);
      } catch (error) {
        throw {
          toptipContent: '查询失败',
          toptipType: 'error',
        }
      }
    }).then(async (resData) => {
      wx.hideLoading();
      that.setDefaultForm({
        name: resData.name,
        identityNumber: resData.identityNumber,
        idCardType: resData.idCardType,
        gender: resData.gender,
        age: resData.age,
        birthday: resData.birthday,
        address: resData.address,
        phone: resData.phone,
        unit: resData.unit,
      });
    }).catch(error => {
      wx.hideLoading();
      that.handleError(error)
    })
  },
  openUnitList(e) {
    const child = this.selectComponent('#input-log-select');
    const {
      type
    } = e.currentTarget.dataset;
    child.showDialog(type)
  },
  onTapRecord(e) {
    const {
      type,
      value
    } = e.detail
    this.setData({
      [`defaultForm.${type}`]: value
    });
  },
  setTagInput(e) {
    const {
      field,
      name = ''
    } = e.currentTarget.dataset
    this.setData({
      [`defaultForm.${field}`]: name,
    })
  },
  submitOne() {
    if (new Date().getTime() - this.loading < 1500) {
      return;
    }
    this.loading = new Date().getTime()
    this.validateDefaultForm(() => {
      this.postReservations([this.data.defaultForm])
    });
  },
  validateDefaultForm(callback) {
    this.selectComponent('#defaultForm').validate((valid, errors) => {
      if (!valid) {
        const firstError = Object.keys(errors);
        if (firstError.length) {
          this.setData({
            toptipContent: errors[firstError[0]].message,
            toptipType: "error"
          });
        }
        return;
      }

      // 保存单位/岗位至本地存储
      const job = this.data.defaultForm.job;
      if (job) {
        const hisJob = wx.getStorageSync(StorageKey.hisJob) || []
        const nextHisJob = Array.from(new Set([job, ...hisJob])).slice(0, 50)
        wx.setStorageSync(StorageKey.hisJob, nextHisJob)
      }

      // 保存单位/岗位至本地存储
      const unit = this.data.defaultForm.unit;
      if (unit) {
        const hisUnit = wx.getStorageSync(StorageKey.hisUnit) || []
        const nextHisUnit = Array.from(new Set([unit, ...hisUnit])).slice(0, 50)
        wx.setStorageSync(StorageKey.hisUnit, nextHisUnit)
      }
      let modalContent = '';
      // 查询该样本编号有无对应当前预约人信息
      const samePerson = this.reservationList.filter(reservation => {
        return reservation.name === this.data.defaultForm.name &&
          reservation.identityNumber === this.data.defaultForm.identityNumber
      })
      if (samePerson && samePerson.length > 0 && !this.modifyFlag) {
        modalContent += '采集历史中已存在该预约人信息,'
      }

      const sampleNumber = String(this.data.defaultForm.sampleNumber).trim()
      const sampleNumberCount = this.reservationList.filter(reservation => {
        return reservation.sampleNumber === sampleNumber &&
          reservation.id !== this.data.defaultForm.id
      }).length
      if (sampleNumberCount >= this.data.mixNum) {
        modalContent += '样本编号' + sampleNumber + '已采集' + sampleNumberCount + '人,'
      }

      if (modalContent) {
        wx.showModal({
          title: '提示',
          content: modalContent + '是否继续?',
          success: (res) => {
            if (res.confirm) {
              callback()
            }
          },
        })
      } else {
        callback()
      }
    })
  },
  async postReservations(reservations) {
    wx.showLoading({
      title: '校验中...',
      mask: true
    })
    const stationId = this.curStation;
    const last = reservations[reservations.length - 1];
    const sampleNumber = String(last.sampleNumber).trim();
    const samplingDate = moment();
    const reservationIds = reservations.map(r => r.id)
    try {
      const response = await queryReservationsList({
        sampleNumber
      })
      const diff = (response || []).map((r) => {
        // 相同id不判
        if (reservationIds.includes(r.id)) {
          return false
        }

        // 作废不判
        if (r.status === 'INVALID') {
          return false;
        }

        //采集日期相差超过1天
        const rSamplingDate = r.samplingDate
        if (rSamplingDate && moment(rSamplingDate).diff(samplingDate, 'day') !== 0) {
          return true
        }

        // 不同采集点
        const rStationId = r.station.id
        if (rStationId !== stationId) {
          return true
        }

        return false
      }).some((r) => r) || false

      if (diff) {
        wx.hideLoading()
        this.setData({
          toptipContent: '样本编号已被使用, 无法保存',
          toptipType: 'error',
        })
        return;
      }

    } catch (errror) {
      this.setData({
        toptipContent: "请求中断",
        toptipType: "error"
      });
    }

    wx.showLoading({
      title: "保存中...",
      mask: true,
    });

    // 采样时间界面不显示, 取当前时刻, 并且需要精确到时,分,秒
    const nextReservationList = [...this.reservationList]
    for (const reservation of reservations) {
      const {
        paymentStatus,
        freeIdentity,
        ...others
      } = reservation;
      const postData = {
        ...others,
        highRisk14th: reservation.highRisk14th === 'true',
        signs: reservation.signs === 'true',
        sampleNumber,
        samplingDate,
        status: 'PROCESSING',
        station: stationId
      }
      try {
        if (reservation.id) {
          await saveReservations(postData)
        } else {
          const _res = await addReservations({
            ...postData,
            appointment: samplingDate,
            station: stationId
          })
          if (_res && _res.reservation && _res.reservation.reservation && _res.reservation.reservation.id) {
            reservation.id = _res.reservation.reservation.id
          }
        }

        const rIndex = nextReservationList.findIndex(o => o.id === reservation.id)
        if (rIndex > -1) {
          nextReservationList.splice(rIndex, 1)
        }
        nextReservationList.unshift({
          id: reservation.id,
          name: reservation.name,
          identityNumber: reservation.identityNumber,
          sampleNumber: sampleNumber
        });
        wx.setStorageSync(StorageKey.reservationList, nextReservationList);
      } catch (error) {
        wx.hideLoading()
        this.setData({
          toptipContent: error.message,
          toptipType: 'error',
        })
        throw error;
      }
    }

    const nextSampleNumberList = nextReservationList
      .map(reservation => reservation.sampleNumber)
      .reduce((pre, cur) => {
        if (!pre.includes(cur)) {
          pre.push(cur)
        }
        return pre;
      }, []);
    wx.setStorageSync(StorageKey.sampleNumberList, nextSampleNumberList);

    wx.hideLoading()
    wx.showToast({
      title: "采集完成",
      icon: "success",
      duration: 2000,
    });

    const modifyFlag = this.modifyFlag;
    let curNum = nextReservationList.filter(o => o.sampleNumber === sampleNumber).length;
    if (curNum >= this.data.mixNum) {
      curNum = 0;
      wx.setStorageSync(StorageKey.sampleNumber, undefined)
    }
    this.modifyFlag = false
    this.reservationList = nextReservationList
    this.sampleNumberList = nextSampleNumberList
    this.setData({
      curNum,
      defaultForm: {
        ...this.initInfo,
        sampleNumber: curNum === 0 ? null : sampleNumber
      },
      humanCount: nextReservationList.length,
      tubeCount: nextSampleNumberList.length,
    })

    if (modifyFlag) {
      navigateToPage('pages/humanStatistic/humanStatistic', 'tab=human')
    }
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
    let curSampleNumber = this.data.defaultForm.sampleNumber;
    if (!curSampleNumber) {
      curSampleNumber = this.sampleNumberList[0]
    }
    if (curSampleNumber) {
      const nextSampleNumber = generateFunc(curSampleNumber);
      const curNum = this.reservationList
        .filter(r => r.sampleNumber === nextSampleNumber)
        .length;
      wx.setStorageSync(StorageKey.sampleNumber, nextSampleNumber)
      this.setData({
        ['defaultForm.sampleNumber']: nextSampleNumber,
        curNum
      })
    }
  },
})