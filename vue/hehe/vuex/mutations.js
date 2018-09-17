import {set } from 'vue'
import * as types from './mutation-types'

export default {
    [types.PAGE_NAME](state, name) {
        state.pageName = name;
    },
    [types.POP_STATUS](state, tag, status) {
        if (status) {
            _zax.ui.mask.show(() => {
                state.popStatus[tag] = status;
            });
        } else {
            _zax.ui.mask.hide(() => {
                state.popStatus[tag] = status;
            });
        }
    },
    [types.OPPS_STATUS](state, tag, status) {
        state.oppsStatus[tag] = status;
    },
    [types.USER_CODE](state, code) {
        state.userCode = code;
    },
    [types.USER_BTN](state, code) {
        state.userBtn = code;
    },
    [types.USER_TYPE](state, type) {
        state.userType = type;
    },
    [types.DEVICE_TYPE](state, dvc) {
        state.deviceType = dvc;
    },
    [types.WEIXIN_MASK](state, status) {
        state.weixinMask = status;
    },
    [types.LOTTERY_INFO](state, tag, status) {
        state.lotteryInfo[tag] = status;
    },
    [types.ACTIVITY_CODE](state, status) {
        state.activityCode = status;
    }
}