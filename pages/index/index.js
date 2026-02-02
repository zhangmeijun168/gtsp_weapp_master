//index.js
//获取应用实例
Page({
  data: {
    /** true登录, false未登录 */
    loginStatus: null,
  },
  onLoad: function () {
    const token = wx.getStorageSync('token');
    this.setData({
      loginStatus: !!token
    })
  },
  setLoginStatus: function (e) {
    this.setData({
      loginStatus: e.detail
    })
  }
})
