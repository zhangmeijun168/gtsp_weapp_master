// pages/login/login.js
import { getAuthPublicKey, login, verificationCode } from "../../services/user";
import { StorageKey } from "../../utils/config";
import WxmpRsa from "wxmp-rsa";

Component({
  /**
   * 页面的初始数据
   */
  data: {
    formData: {
      email: "",
      password: "",
      agreement: true,
    },
    rules: [
      {
        name: "email",
        rules: [
          { required: true, message: "请输入登录邮箱地址或手机号" },
          //{ email: true, message: "邮箱地址格式错误" },
        ],
      },
      {
        name: "password",
        rules: [
          {
            required: true,
            message: "请输入登录密码",
          },
          {
            minlength: 4,
            maxlength: 30,
            message: "请确认密码长度8-30位",
          },
        ],
      },
      /*{
        name: "verificationCode",
        rules: { required: true,maxlength: 6, minlength: 6, number:true, message: "请输入6位数字验证码" },
      },*/
    ],
  },
  attached() {
    const userKey = wx.getStorageSync(StorageKey.userKey);
    if (userKey) {
      this.setData({
        [`formData.email`]: userKey,
      });
    }
  },
  methods: {
    formInputChange(e) {
      const { field } = e.currentTarget.dataset;
      this.setData({
        [`formData.${field}`]: e.detail.value,
      });
    },
    checkboxChange(e) {
      const values = e.detail.value;
      this.setData({
        ["formData.agreement"]: values[0] === "agreement",
      });
    },
    submitForm() {
      this.selectComponent("#form").validate(async (valid, errors) => {
        if (!valid) {
          const firstError = Object.keys(errors);
          if (firstError.length) {
            this.setData({
              error: errors[firstError[0]].message,
            });
          }
          return;
        }
        const { email, password, agreement } = this.data.formData; //verificationCode

        if (!agreement) {
          return wx.showToast({
            icon: "none",
            title:
              "请您务必阅读并理解《用户协议》及《隐私协议》，同意后继续登录",
          });
        }

        const loginDto = await (async () => {
          const publicKey = await getAuthPublicKey().catch(() => null);
          if (publicKey) {
            const rsa = new WxmpRsa();
            rsa.setPublicKey(publicKey);
            return {
              email: rsa.encryptLong(email),
              password: rsa.encryptLong(password),
              fromWeapp: true,
            };
          } else {
            return {
              email,
              password,
              fromWeapp: true,
            };
          }
        })();

        wx.showLoading({
          title: "登录中",
          icon: "loading",
        });

        login(loginDto) //verificationCode
          .then((resData) => {
            const {
              success,
              user,
              message: messageText,
              needChangePwd,
            } = resData;
            wx.hideLoading();
            if (success) {
              wx.setStorageSync(StorageKey.token, user.token);
              wx.setStorageSync(StorageKey.userKey, email);
              wx.setStorageSync(StorageKey.userId, user.id);
              const loginRedirect = () => {
                this.triggerEvent("setLoginStatus", true);
              };
              if (needChangePwd) {
                wx.showModal({
                  content: "您的密码已过期，请尽快修改",
                  confirmText: "关闭",
                  showCancel: false,
                  success(res) {
                    if (res.confirm) {
                      loginRedirect();
                    }
                  },
                });
              } else {
                loginRedirect();
              }
            } else {
              this.setData({
                error: messageText,
              });
            }
          })
          .catch((e) => {
            this.setData({
              error: "通讯异常",
            });
            wx.hideLoading();
          });
      });
    },
  },
});

// btnCodeTxt: "发送验证码",
// btnCodeDisabled: false,
// timer: '',
// countDownNum: 60,

// 发送校验码
// sendVerificationCode() {
//   const { email } = this.data.formData;
//   if (email === undefined || email.trim().length === 0) {
//     this.setData({
//       error: "请输入邮箱地址或手机号",
//     });
//     return;
//   }
//   let countDownNum = this.data.countDownNum;
//   let that = this;
//   that.setData({
//     btnCodeDisabled: true,
//     timer: setInterval(function () {
//       countDownNum--;
//       that.setData({
//         btnCodeTxt: "倒计时" + countDownNum + "秒",
//       })
//       if (countDownNum === 0) {
//         clearInterval(that.data.timer);
//         that.setData({
//           btnCodeTxt: "发送验证码",
//           btnCodeDisabled: false,
//         })
//       }
//     }, 1000)
//   });

//   wx.showLoading({
//     title: '发送验证码...',
//     icon: 'loading',
//   })
//   verificationCode({ email })
//     .then((resData) => {
//       wx.hideLoading();
//       if (resData.statusCode) {
//         // 发送错误
//         clearInterval(that.data.timer);
//         this.setData({
//           error: resData.message ? resData.message : resData.error,
//           btnCodeTxt: "发送验证码",
//           btnCodeDisabled: false
//         });
//       } else {
//         // 发送成功
//         // const { phoneNumber } = resData;
//         wx.showToast({
//           title: '验证码已发送',
//           icon: 'success',
//           mask: true,
//           duration: 2000
//         });
//       }
//     })
//     .catch((e) => {
//       clearInterval(that.data.timer);
//       this.setData({
//         error: e.message ? e.message : "短信验证码发送失败",
//         btnCodeTxt: "发送验证码",
//         btnCodeDisabled: false
//       });
//       wx.hideLoading();
//     });
// },
