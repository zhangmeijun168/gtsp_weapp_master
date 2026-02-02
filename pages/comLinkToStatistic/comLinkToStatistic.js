Component({
    properties: {
        pageType: {
            type: String,
            value: 'human'
        },
        tubeCount: {
            type: Number,
            value: 0
        },
        humanCount: {
            type: Number,
            value: 0
        },
        envCount: {
            type: Number,
            value: 0
        },
    },
    data: {},
    lifetimes: {
        attached() { }
    },
    pageLifetimes: {
        show() { }
    },
    methods: {
        showSubmitList() {
            let url = '/pages/humanStatistic/humanStatistic'
            if (this.data.pageType === 'env') {
                url = '/pages/envStatistic/envStatistic'
            }
            wx.navigateTo({
                url
            })
        }
    }
})