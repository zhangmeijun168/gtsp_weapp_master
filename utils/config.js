export const serverUrl = "http://192.168.2.154:5000/api";
export const roles = [{
  name: "管理员",
  value: "ROOT",
}, {
  name: "站点组",
  value: "STATION",
}, {
  name: "采集组",
  value: "COLLECTION",
}, {
  name: "报告组",
  value: "REPORT",
}, {
  name: "财务组",
  value: "FINANCE",
}, {
  name: "查询组",
  value: "QUERY",
}, {
  name: "合作方",
  value: "PARTNER",
}];


export const mixBatchNoList = [
  "第一批",
  "第二批",
  "第三批",
  "第四批",
  "第五批",
  "第六批",
  "第七批",
  "第八批",
  "第九批",
  "第十批",
];

export const CSampleSubType = [{
  value: '口咽拭子',
  name: '口咽拭子'
}, {
  value: '鼻咽拭子',
  name: '鼻咽拭子'
}]

export const CReservationType = [{
  value: '个人',
  name: '个人'
}, {
  value: '团体',
  name: '团体'
}]

export class StorageKey {
  /** 登录用户token */
  static token = "token";
  /** 登录用户账号 */
  static userKey = "userKey";
  /** 登录用户id */
  static userId = "userId";
  /** 用户采集点列表 */
  static stationList = "stationList";
  /** 样本编号前缀 */
  static sampleNumberPrefix = "sampleNumberPrefix";
  /** 当前选中的采集点 */
  static userCurStation = (userId) => `${userId}-stationId"`;
  /** 混合数 */
  static mixNum = "mixNum";
  /** 预录入, 采集日期, 貌似只有环境采集在用 */
  static samplingDate = "samplingDate";
  /** 预录入, 地址 */
  static address = "address";
  /** 预录入, 单位 */
  static unit = "unit";
  /** 预录入, 批次 */
  static batchNo = "batchNo";
  /** 预录入, 备注 */
  static remark = "remark";
  /** 历史, 人体采集, 单位 */
  static hisUnit = "hisUnit";
  /** 历史, 环境采集, 单位  */
  static envHisUnit = "envHisUnit";
  /** 历史, 环境采集, 批次 */
  static envBatchNo = 'envBatchNo';
  /** 预录入, 岗位 */
  static job = "job";
  /** 历史, 岗位 */
  static hisJob = "hisJob";
  /** 人体采集, 采集类型 */
  static type = "type";
  /** 人体采集, 样本类型 */
  static sampleSubType = "sampleSubType";

  /** 人体采集, 当前登记的样本编号 */
  static sampleNumber = "sampleNumber";
  /** 人体采集样本编号List */
  static sampleNumberList = "sampleNumberList";
  /** 人体采集/预约List */
  static reservationList = "reservationList";
  /** 人体采集 修改暂存 */
  static humanModify = 'humanModify';

  /** 环境样本采集, 当前的样本编号 */
  static envSampleNumber = "envSampleNumber";
  /** 环境样本编号List */
  static envSampleNumberList = "envSampleNumberList";
  /** 环境样本List */
  static envSampleList = "envSampleList";
  /** 样本名称 历史记录 */
  static envSampleLabels = "sampleLabels";
  /** 人体采集 修改暂存 */
  static envModify = 'envModify';

  /** 弃用 */
  static reservationIdList = "reservationIdList";
  /** 弃用 */
  static submitForm = "submitForm";
}