//index.js
//获取应用实例
import {
  user
} from "../../services/user";
import {
  queryStations
} from "../../services/station";
import {
  StorageKey,
  roles as DICT_ROLES
} from '../../utils/config'

Component({
  data: {
    userId: "",
    phoneNumber: "",
    nickname: "",
    roleText: "",
    station: "",
    stations: "",
    stationIndex: 0,
  },
  attached() {
    wx.showLoading({
      title: '加载中...',
      icon: ''
    })
    Promise.all([queryStations(), user()])
      .then((resData) => {
        const {
          stations: allStations
        } = resData[0];
        const {
          id: userId,
          phoneNumber,
          nickname,
          station,
          stations = "",
          roles,
        } = resData[1];

        const roleList = roles.split(",");
        const stationList = (
          stations ||
          (station && station.id + "") ||
          ""
        ).split(",");
        let userStations = allStations || [];
        if (Array.isArray(roleList) && (roleList.includes('STATION') || roleList.includes('PARTNER'))) {
          userStations = userStations.filter((s) =>
            stationList.includes(`${s.id}`)
          );
        }

        if (userStations.length < 0) {
          wx.hideLoading()
          wx.showToast({
            title: '未配置采集点',
            icon: 'error',
            mask: true
          })
          this.triggerEvent('setLoginStatus', false);
          return;
        }

        // 如果没有默认，index设0， 如果设的默认已经从stations里删掉，查出来是-1，还是要设成0
        let userStationIndex = 0;
        var localStationId = wx.getStorageSync(StorageKey.userCurStation(userId));
        if (localStationId) {
          userStationIndex = Math.max(
            userStations.findIndex((s) => s.id === localStationId),
            0
          );
        }
        const userStation = userStations[userStationIndex];
        wx.setStorageSync(StorageKey.sampleNumberPrefix, userStation.sampleNumberPrefix);
        wx.setStorageSync(StorageKey.userCurStation(userId), userStation.id)
        wx.setStorageSync(StorageKey.stationList, userStations)

        this.setData({
          userId,
          phoneNumber,
          nickname,
          roleText: DICT_ROLES.filter((i) => roles.includes(i.value))
            .map((i) => i.name)
            .join(", "),
          station: userStation,
          stations: userStations,
          stationIndex: userStationIndex,
        });
        wx.hideLoading()

      })
      .catch((error) => {
        wx.hideLoading()
        console.log(error)
        this.triggerEvent('setLoginStatus', false)
      })
  },

  methods: {
    loginOut() {
      wx.setStorageSync(StorageKey.token, '');
      this.triggerEvent('setLoginStatus', false)
    },
    onChangeUserStation(e) {
      const station = this.data.stations[e.detail.value];
      wx.setStorageSync(StorageKey.userCurStation(this.data.userId), station.id);
      wx.setStorageSync(StorageKey.sampleNumberPrefix, station.sampleNumberPrefix);
      this.setData({
        station,
        stationIndex: e.detail.value,
      });
    },
  }
});