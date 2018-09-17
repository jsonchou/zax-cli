const sysinfo = 'server api crashed';

export default {
    shareConfig(me, cb) {
        // console.log(me.activityCode)
        //分享前置信息
        if (_zax.device.app || _zax.device.weixin) {
            let wxcb = {
                success: function (res) {},
                cancel: function (res) {
                    //_zax.ui.toast('cancel:' + JSON.stringify(res) + _zax.cookie.get('zaLoginCookieKey'));
                    //_zax.ui.confirm('如果收到，表示JS桥接cancel没问题');
                },
                complete: function (res) {
                    //_zax.ui.toast('complete:' + JSON.stringify(res) + _zax.cookie.get('zaLoginCookieKey'));
                    _zax.ui.mask.hide();
                    me.setWeixinMask(false);
                },
            };
            $.ajax({
                url: '/baseScreen/getShareLink.json',
                type: 'POST',
                dataType: 'json',
                data: {
                    afs_scene: $('#afs_scene').val(),
                    afs_token: $('#afs_token').val(),
                    activityCode: me.cfg.activityCode,
                },
            }).done((res) => {
                if (res && res.status == 1) {
                    window._za_share_config = {
                        link: res.link,
                        title: res.title,
                        richTitle: '',
                        desc: res.desc,
                        imgUrl: res.imgUrl,
                    }
                    console.log(window._za_share_config);
                }
                window._za_app_config = $.extend(window._za_share_config || {}, wxcb);
                window._za_share_config = $.extend(window._za_share_config || {}, wxcb);
                //Object.assign not support in lower android device
                cb && cb();
            }).fail((res) => {
                me.cfg.debug ? _zax.ui.toast(sysinfo) : console.log(res);
            });
        }
    },
    userLogin(me, mobile, code, cb) {
        //通用登录
        $.ajax({
            url: '/otp/otpLoginAndRegisterScreen/otpLoginAndRegister.json',
            type: 'POST',
            dataType: 'json',
            data: {
                afs_scene: $('#afs_scene').val(),
                afs_token: $('#afs_token').val(),
                activityCode: me.cfg.activityCode,
                bizOrigin: me.cfg.bizOrigin,
                moduleKey: '',
                mobilePhone: mobile,
                smsCode: code,
            },
        }).done((res) => {
            if (res) {
                if (res.isSuccess) {
                    me.setUserCode(_zax.cookie.get('zaLoginCookieKey'));
                    me.setPopStatus('login', false);
                    //_zax.ui.toast("登录成功");
                    if (me.pageName == 'spree' || me.pageName == 'index') {
                        me.service.checkUser(me, mobile, cb)
                    } else if (me.pageName == 'ups') {
                        //重新调用抽奖红包接口
                        me.service.upsDraw(me, cb)
                    }
                } else {
                    _zax.ui.toast(res.msg || res.message);
                }
            }
        }).fail((res) => {
            me.cfg.debug ? _zax.ui.toast(sysinfo) : console.log(res);
        });
    },
    sendVerifyCode(me, mobile) {
        //获取验证码
        $.ajax({
            url: '/common/messageScreen/sendCodeMsg.json',
            type: 'POST',
            dataType: 'json',
            data: {
                afs_scene: $('#afs_scene').val(),
                afs_token: $('#afs_token').val(),
                bizOrigin: me.cfg.bizOrigin,
                activityCode: me.cfg.activityCode,
                moduleKey: '',
                mobilePhone: mobile,
            }
        }).done((res) => {
            if (res) {
                _zax.ui.toast(res.msg || res.message);
            }
        }).fail((res) => {
            me.cfg.debug ? _zax.ui.toast(sysinfo) : console.log(res);
        });
    },
}