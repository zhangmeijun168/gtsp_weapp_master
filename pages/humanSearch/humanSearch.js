const util = require("../../utils/util.js");
import {
    queryReservations,
    queryReservationById,
} from "../../services/reservation";

Page({
    /**
     * 页面的初始数据
     */
    data: {
        defaultForm: {
            name: null,
            identityNumber: null,
        },
        searchResult: []
    },
    defaultFormChange(e) {
        const { field } = e.currentTarget.dataset;
        const { value } = e.detail;
        this.setData({ [`defaultForm.${field}`]: value });
    },
    scanIDCard() {
        const that = this;
        //  选择图片
        wx.chooseImage({
            count: 1,
            success: function (res) {
                wx.showLoading({
                    title: "识别中...",
                    mask: true,
                });
                wx.serviceMarket
                    .invokeService({
                        service: "wx79ac3de8be320b71", // '固定为服务商OCR的appid，非小程序appid',
                        api: "OcrAllInOne",
                        data: {
                            img_url: new wx.serviceMarket.CDN({
                                type: "filePath",
                                filePath: res.tempFilePaths[0],
                            }),
                            data_type: 3,
                            ocr_type: 1,
                        },
                    })
                    .then((res) => {
                        const resIdCard = res.data.idcard_res;
                        that.setData({
                            defaultForm: {
                                identityNumber: resIdCard.id.text,
                                name: resIdCard.name.text,
                            },
                        });
                        that.queryReservation();
                        wx.hideLoading();
                    })
                    .catch((err) => {
                        wx.showToast({
                            title: "身份证识别失败",
                            icon: "error",
                            duration: 2000,
                        });
                        wx.hideLoading();
                    })
            },
        });
    },
    scanReserveId() {
        const that = this;
        this.setData({ searchResult: [] })
        wx.scanCode({
            onlyFromCamera: false,
            success: async function (res) {
                wx.showLoading({
                    title: '识别中...',
                    mask: true
                })
                const { result } = res;
                queryReservationById(Number(result))
                    .then((resData) => {
                        if (
                            resData &&
                            resData.status !== "COMPLETED"
                        ) {
                            that.setData({
                                defaultForm: {
                                    name: resData.name,
                                    identityNumber: resData.identityNumber,
                                },
                                searchResult: [{
                                    ...resData,
                                    appointment: resData.appointment ?
                                        util.formatTim(new Date(resData.appointment)) : "无",
                                }]
                            });
                            wx.hideLoading();
                        } else {
                            wx.showToast({
                                title: "查无数据",
                                icon: "error",
                                duration: 2000,
                            });
                        }
                    })
                    .catch((error) => {
                        console.log(error)
                        wx.showToast({
                            title: "查询失败",
                            icon: "error",
                            duration: 2000,
                        });
                    });
            }
        })
    },
    queryReservation() {
        const that = this;
        this.setData({ searchResult: [] })
        queryReservations({
            status: "NEW",
            ...that.data.defaultForm,
        })
            .then((resData) => {
                if (
                    resData.total > 0 &&
                    Array.isArray(resData.data) &&
                    resData.data.length > 0
                ) {
                    const list = resData.data;
                    that.setData({
                        searchResult: list.map((o) => {
                            return {
                                ...o,
                                appointment: o.appointment ?
                                    util.formatTim(new Date(o.appointment)) : "无",
                            }
                        }),
                    });
                    wx.hideLoading();
                } else {
                    wx.hideLoading();
                    wx.showToast({
                        title: "查无预约记录",
                        icon: "error",
                        duration: 2000,
                    });
                }
            })
            .catch(() => {
                wx.showToast({
                    title: "查询预约失败",
                    icon: "error",
                    duration: 2000,
                });
            });
    },
    cleanAll() {
        this.setData({ defaultForm: { name: null, identityNumber: null }, searchResult: [] })
    },
})