import {
  addSample,
} from "../../services/mtReicieve";

Page({
  data: {
    error: '',
    /** 填写的表单 */
    defaultForm: {
      barCode: undefined,
      remark: undefined
    },
    // 初始值
    initInfo: {
      barCode: undefined,
      remark: undefined
    },
    defaultFormRule: [{
      name: 'barCode',
      rules: {
        validator: function (rule, value) {
          if (!value || value.length < 15) {
            return '样本编号长度不符合'
          }
        }
      },
    }],
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
  /** 扫描管号 */
  scanBarCode() {
    const that = this;
    return new Promise((resolve, reject) => {
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
    }).then((barCode) => {
      return new Promise((resolve, reject) => {
        that.setData({
          [`defaultForm.barCode`]: barCode,
        })
        resolve();
      })
    }).catch(error => {})
  },
  submitOne() {
    this.validateDefaultForm(() => {
      this.postReservations(this.data.defaultForm)
    });
  },
  validateDefaultForm(callback) {
    this.selectComponent('#defaultForm').validate((valid, errors) => {
      if (!valid) {
        const firstError = Object.keys(errors);
        if (firstError.length) {
          this.setData({
            error: errors[firstError[0]].message
          })
        }
        return;
      }
      callback()
    })
  },
  async postReservations(data) {
    if (!data.remark) {
      delete data.remark
    }
    addSample({
      data
    }).then(() => {
      wx.showToast({
        title: "提交成功",
        icon: "success",
        duration: 1500,
      });
      this.setData({
        defaultForm: {
          ...this.initInfo,
        },
      })
    }).catch((err) => {
      wx.showToast({
        title: err.response?.data.message,
        icon: "error",
        duration: 1500,
      });
    }).finally(() => {})
  },
})