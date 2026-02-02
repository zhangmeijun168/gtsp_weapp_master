import wxp from "./wxp";
import { StorageKey, serverUrl } from './config'

const buildUrl = (resourceUrl) => `${serverUrl}${resourceUrl}`;

const addTokenAndOrganization = () => {
  const token = wx.getStorageSync(StorageKey.token) || "";
  return {
    Authorization: `Token ${token}`,
    'x-platform': 'weapp'
  };
};

const codeMessage = {
  200: "服务器成功返回请求的数据。",
  201: "新建或修改数据成功。",
  202: "一个请求已经进入后台排队（异步任务）。",
  204: "删除数据成功。",
  400: "发出的请求有错误，服务器没有进行新建或修改数据的操作。",
  401: "用户没有权限（令牌、用户名、密码错误）。",
  403: "用户得到授权，但是访问是被禁止的。",
  404: "发出的请求针对的是不存在的记录，服务器没有进行操作。",
  406: "请求的格式不可得。",
  410: "请求的资源被永久删除，且不会再得到的。",
  422: "当创建一个对象时，发生一个验证错误。",
  500: "服务器发生错误，请检查服务器。",
  502: "网关错误。",
  503: "服务不可用，服务器暂时过载或维护。",
  504: "网关超时。",
};

const checkStatus = (response) => {
  const { statusCode, data } = response;
  if (statusCode >= 200 && statusCode < 300) {
    return data;
  }
  const errortext = data.message || codeMessage[statusCode];
  const error = new Error(errortext);
  error.name = statusCode;
  error.response = response;
  throw error;
};

const onError = (error) => {
  // development debug
  console.log("Api ", error); // eslint-disable-line
  if (error.name === 401) {
    wx.setStorageSync(StorageKey.token, '')
    wx.reLaunch({
      url: "/pages/index/index",
    });
  }
  throw error;
};

export const request = (resourceUrl, options = {}) => {
  const url = buildUrl(resourceUrl);
  const { header, ...restOptions } = options;
  return wxp
    .request({
      url,
      header: { ...header, ...addTokenAndOrganization() },
      ...restOptions,
    })
    .then(checkStatus)
    .catch(onError);
};

export const uploadFile = (filePath, options = {}) => {
  const url = buildUrl("/files");
  const { header, formData, ...restOptions } = options;
  return wxp
    .uploadFile({
      url,
      filePath,
      name: "file",
      formData,
      header: { ...header, ...addTokenAndOrganization() },
      ...restOptions,
    })
    .then(checkStatus)
    .then((data) => JSON.parse(data))
    .catch(onError);
};
