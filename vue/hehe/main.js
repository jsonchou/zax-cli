import Vue from 'vue'
import VueRouter from 'vue-router'
import store from './vuex/store'

import App from './components/App.vue'

import config from './api/config'
import service from './api/service'

import router from './router/__routerMode__'

config.bizOrigin = _util.url.get('bizOrigin') || _util.url.get('bizorigin') || 'APP517dxzp';
config.activityCode = _util.url.get('activityCode') || _util.url.get('activitycode') || 'cpgj';
config.appUrl += config.bizOrigin;

//全局注入
Vue.prototype.cfg = config
Vue.prototype.service = service

Vue.config.devtools = config.debug

Vue.use(VueRouter)

//how to regist a config to global?

//载入spa环境配置
config.bizOrigin = _util.url.get('bizOrigin') || _util.url.get('bizorigin') || 'APP517dxzp';
config.activityCode = _util.url.get('activityCode') || _util.url.get('activitycode') || 'cpgj';
config.appUrl += config.bizOrigin;

router.beforeEach((to, from, next) => {
    //let ck = _zax.cookie.get(vconfig.prefix + 'openindex');
    _zax.ui.mask.hide();
    $('.ui-confirm').remove();
    //$('.ui-confirm').removeClass('ui-confirm-on');
    // if (ck) {
    //     if (to.name !== 'index' && to.name !== 'award') {
    //         next({
    //             path: '/index'
    //         });
    //     }else{
    //         next();
    //     }
    // } else {
    //     next();
    // }

    //scroll to top
    // window.scrollTo(0, 0)
    next();
});

router.afterEach((to, from) => {
    // window.scrollTo(0, 0);
    window._za && window._za.pushData(); //ilog pv uv 统计
    window.bridge && window.bridge.invoke({});
    window.bridge && window.bridge.ready((boot) => {
        boot.onJSInvokeResult('1', document.title);
    });
});

window.router = router;
window.Vue = Vue;

new Vue({
    store,
    router,
    render: h => h(App),
}).$mount('#app');