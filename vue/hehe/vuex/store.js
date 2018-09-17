import Vue from 'vue'
//import Vuex from '../../../src'
import Vuex from 'vuex'
import mutations from './mutations'
//import createLogger from 'vuex/dist/logger'

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        pageName: null,
        weixinMask: false,
        deviceType: null,
        userCode: null, //null,1, check user login status
        userType: false, //true 老用户 false 新用户 
        userBtn: 'act1', //act1,act2,act3,act4,act5
        activityCode: 'SSXLHDZY', //设置活动code 默认为主会场
        oppsStatus: {
            defaultTimes: 0, //默认次数
            subjoinTimes: 0, //新增次数
            totalTimes: 0, //总共次数
            usedTimes: 0, //已使用次数
            tempTimes: 0 //零时次数
        },
        shareInfo: {
            link: '', //暂未使用store=>shareInfo全局信息
            title: '',
            richTitle: '',
            desc: '',
            imgUrl: '',
        },
        lotteryInfo: {
            activityCode: "dasdas",
            code: 0,
            lotteryDetailId: 0,
            message: "",
            moduleDetailId: 0,
            offerPackageProCode: "",
            prizeCode: "",
            prizeName: "",
            result: "",
        },
        popStatus: {
            'bind': false, //绑定你的奖励弹窗
            'login': false, //login pop box
            'rule': false, //总则
            'lottery': false, //优惠券 弹窗
            'address': false,
            'relation': false, //选择关系
            'register': false, //已登记信息
            'late': false, //来晚了
            'other': false, //海报分享调用弹窗
            'upsRule': false, //ups rule
            'thank': false,
            'notred': false,
            'integral': false,
            'gussRule': false
        }
    },
    mutations,
    //plugins: process.env.NODE_ENV !== 'production' ? [createLogger()] : []
})