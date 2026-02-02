/** ****************************************************************
 MIT License http://www.opensource.org/licenses/mit-license.php
 Author Mora <qiuzhongleiabc@126.com> (https://github.com/qiu8310)
****************************************************************** */
Object.defineProperty(exports, "__esModule", { value: true });
// / <reference path="../typing/app.d.ts" />
// / <reference path="../typing/behavior.d.ts" />
// / <reference path="../typing/component.d.ts" />
// / <reference path="../typing/page.d.ts" />
// / <reference path="../typing/wx.d.ts" />
require('./polyfill');

const __rest = function(s, e) {
  const t = {};
  for (var p in s)
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++)
      if (e.indexOf(p[i]) < 0) t[p[i]] = s[p[i]];
  return t;
};

const __assign =
  Object.assign ||
  function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (const p in s)
        if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }
    return t;
  };

function wxpromisify(func, context, callbackIndex) {
  if (callbackIndex === void 0) {
    callbackIndex = 0;
  }
  return function() {
    const args = [];
    for (let _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }
    return new Promise(function(resolve, reject) {
      const _a = args[callbackIndex] || {};
      const { success } = _a;
      const { fail } = _a;
      const { complete } = _a;
      const arg = __rest(_a, ["success", "fail", "complete"]);
      args[callbackIndex] = __assign({}, arg, {
        success(res) {
          resolve(res);
          if (success) success(res);
        },
        fail(err) {
          reject(err);
          if (fail) fail(err);
        },
        complete
      });
      func.call.apply(func, [context].concat(args));
    });
  };
}

const PROMISABLE = {
  FUNCS: [
    "request",
    "uploadFile",
    "downloadFile",
    "connectSocket",
    "sendSocketMessage",
    "closeSocket",
    "chooseImage",
    "previewImage",
    "getImageInfo",
    "saveImageToPhotosAlbum",
    "startRecord",
    "playVoice",
    "getBackgroundAudioPlayerState",
    "playBackgroundAudio",
    "seekBackgroundAudio",
    "getAvailableAudioSources",
    "chooseVideo",
    "saveVideoToPhotosAlbum",
    "loadFontFace",
    "saveFile",
    "getSavedFileList",
    "getSavedFileInfo",
    "removeSavedFile",
    "openDocument",
    "getFileInfo",
    "setStorage",
    "getStorage",
    "getStorageInfo",
    "removeStorage",
    "getLocation",
    "chooseLocation",
    "openLocation",
    "getSystemInfo",
    "getNetworkType",
    "setScreenBrightness",
    "getScreenBrightness",
    "vibrateLong",
    "vibrateShort",
    "startAccelerometer",
    "stopAccelerometer",
    "startCompass",
    "stopCompass",
    "makePhoneCall",
    "scanCode",
    "setClipboardData",
    "getClipboardData",
    "openBluetoothAdapter",
    "closeBluetoothAdapter",
    "getBluetoothAdapterState",
    "startBluetoothDevicesDiscovery",
    "stopBluetoothDevicesDiscovery",
    "getBluetoothDevices",
    "getConnectedBluetoothDevices",
    "createBLEConnection",
    "closeBLEConnection",
    "getBLEDeviceServices",
    "getBLEDeviceCharacteristics",
    "readBLECharacteristicValue",
    "writeBLECharacteristicValue",
    "notifyBLECharacteristicValueChange",
    "startBeaconDiscovery",
    "stopBeaconDiscovery",
    "getBeacons",
    "setKeepScreenOn",
    "addPhoneContact",
    "getHCEState",
    "startHCE",
    "stopHCE",
    "sendHCEMessage",
    "startWifi",
    "stopWifi",
    "connectWifi",
    "getWifiList",
    "setWifiList",
    "getConnectedWifi",
    "showToast",
    "showLoading",
    "showModal",
    "showActionSheet",
    "setNavigationBarTitle",
    "setNavigationBarColor",
    "setTabBarBadge",
    "removeTabBarBadge",
    "showTabBarRedDot",
    "hideTabBarRedDot",
    "setTabBarStyle",
    "setTabBarItem",
    "showTabBar",
    "hideTabBar",
    "setTopBarText",
    "navigateTo",
    "redirectTo",
    "reLaunch",
    "switchTab",
    "startPullDownRefresh",
    "getExtConfig",
    "login",
    "checkSession",
    "authorize",
    "getUserInfo",
    "requestPayment",
    "showShareMenu",
    "hideShareMenu",
    "updateShareMenu",
    "getShareInfo",
    "chooseAddress",
    "addCard",
    "openCard",
    "openSetting",
    "getSetting",
    "getWeRunData",
    "navigateToMiniProgram",
    "navigateBackMiniProgram",
    "chooseInvoiceTitle",
    "checkIsSupportSoterAuthentication",
    "startSoterAuthentication",
    "checkIsSoterEnrolledInDevice",
    "setEnableDebug",
    "chooseMessageFile"
  ],
  KLASS: { SocketTask: ["connectSocket", "send", "close"] }
};

const wxp = {};
Object.getOwnPropertyNames(wx).forEach(function(key) {
  const desc = Object.getOwnPropertyDescriptor(wx, key);
  if (desc) {
    if (PROMISABLE.FUNCS.indexOf(key) >= 0) {
      Object.defineProperty(wxp, key, {
        configurable: desc.configurable,
        enumerable: desc.enumerable,
        get() {
          // @ts-ignore
          return wxpromisify(wx[key], wx);
        }
      });
    } else {
      Object.defineProperty(wxp, key, desc);
    }
  }
});

exports.default = wxp;
