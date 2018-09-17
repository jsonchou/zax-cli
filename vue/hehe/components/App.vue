<template>
    <div class="template-inner" :class="'page-current-'+pageName">
        <div id="app" class="sp-box">
            <pop></pop>
            <weixin-mask></weixin-mask>
            <router-view></router-view>
        </div>
    </div>
</template>

<script>
// (function(root) {
//     root._tt_config = true;
//     var ta = document.createElement('script');
//     ta.type = 'text/javascript';
//     ta.async = true;
//     ta.src = document.location.protocol + '//' + 's3.pstatp.com/bytecom/resource/track_log/src/toutiao-track-log.js';
//     ta.onerror = function() {
//         var request = new XMLHttpRequest();
//         var web_url = window.encodeURIComponent(window.location.href);
//         var js_url = ta.src;
//         var url = '//ad.toutiao.com/link_monitor/cdn_failed?web_url=' + web_url + '&js_url=' + js_url + '&convert_id=69070806985';
//         request.open('GET', url, true);
//         request.send(null);
//     }
//     var s = document.getElementsByTagName('script')[0];
//     s.parentNode.insertBefore(ta, s);
// })(window);

import WeixinMask from './common/WeixinMask.vue'
import Pop from './Pop.vue'
import {
    pageName,
    popStatus,
    activityCode,
    userCode,
    deviceType,
} from '../vuex/getters'
import {
    setPopStatus,
    setUserCode,
    setActivityCode,
    setWeixinMask,
    setDeviceType,
} from '../vuex/actions'
export default {
    data() {
        return {

        }
    },
    vuex: {
        getters: {
            pageName,
            deviceType,
            popStatus,
            userCode,
            activityCode
        },
        actions: {
            setWeixinMask,
            setPopStatus,
            setDeviceType,
            setUserCode,
            setActivityCode
        }
    },
    components: {
        Pop,
        WeixinMask
    },
    computed: {

    },
    methods: {
        loadIlog(cb) {
            _zax.use(['ilog'], () => {
                //console.log('ilog loaded');
                cb && cb();
            });
        },
        loadShare(cb) {
            let me = this;
            if (_zax.device.weixin || _zax.device.app) {
                _zax.use(['share'], () => {
                    cb && cb();
                });
            }
        },
    },
    created() {
        let me = this;
        me.service.shareConfig(me, (cfg) => {
            me.loadShare();
        });
        me.setUserCode(_zax.cookie.get(me.cfg.token));


        //set device type
        if (_zax.device.weixin) {
            me.setDeviceType('weixin');
        } else if (_zax.device.app) {
            me.setDeviceType('app');
        } else {
            me.setDeviceType('');
        }

        me.loadIlog(() => {

        });

    },
    mounted() {
        let me = this;
        if (_zax.device.app || _zax.device.weixin) {
            $('.template-header').remove();
        }
        me.setActivityCode("SSXLHDZY");
        setTimeout(() => {
            $('.sj-temp').remove();
        }, 5000)
        _zax.biz.antifraud(true, 'pointman', 'webactivity', me.cfg.env, me.cfg.activityCode, () => { });

    },
    updated() {
        let me = this;
    },
    beforeDestory() {
        let me = this;
        _util.localStorage.remove("msgIdx")
        _util.localStorage.remove("txtIdx")
        me.setPopStatus('coupon', false);
        me.setPopStatus('bind', false);
        me.setWeixinMask(false);
    }
}
</script>