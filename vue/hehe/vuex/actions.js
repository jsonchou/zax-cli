import * as types from './mutation-types'

//设置页面名称
export const setPageName = ({ dispatch }, name) => {
    dispatch(types.PAGE_NAME, name);
    dispatch(types.WEIXIN_MASK, false);
    if (name === 'award') {
        $('html').addClass('html-on');
    } else {
        $('html').removeClass('html-on');
    }
}

//设置弹窗状态
export const setPopStatus = ({ dispatch }, tag, status) => {

    if (_zax.device.app && tag == 'login' && status == true) {
        //弹出app默认登录框，app拦截
        dispatch(types.POP_STATUS, tag, false); //强制返回时，继续拦截
        location.href = "https://login.zhongan.com/mobile/login.htm?sourceApp=8&target=" + location.href;
        return;
    }

    dispatch(types.POP_STATUS, tag, status);
}

//设置领取的奖项类型
export const setUserCode = ({ dispatch }, code) => {
    dispatch(types.USER_CODE, code)
}

export const setUserType = ({ dispatch }, code) => {
    dispatch(types.USER_TYPE, code)
}

export const setUserBtn = ({ dispatch }, code) => {
    dispatch(types.USER_BTN, code)
}

//设置设备类型
export const setDeviceType = ({ dispatch }, dvc) => {
    dispatch(types.DEVICE_TYPE, dvc)
}

//设置微信遮罩层
export const setWeixinMask = ({ dispatch }, status) => {
    dispatch(types.WEIXIN_MASK, status)
}

//设置抽奖次数状态
export const setOppsStatus = ({ dispatch }, tag, status) => {
    dispatch(types.OPPS_STATUS, tag, status);
}

//设置当前中奖信息
export const setLotteryInfo = ({ dispatch }, tag, status) => {
    dispatch(types.LOTTERY_INFO, tag, status);
}

//设置活动CODE信息
export const setActivityCode = ({ dispatch }, status) => {
    dispatch(types.ACTIVITY_CODE, status);
}