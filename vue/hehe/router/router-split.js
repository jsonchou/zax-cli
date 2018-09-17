import Vue from 'vue'
import VueRouter from 'vue-router'

const router = new VueRouter({
    mode: 'hash', //history
    routes: [{
        path: '/',
        component: () =>
            import (
                /* webpackChunkName: "__spaBuildDir__/index" */
                /* webpackMode: "lazy" */
                '../components/Index.vue'),
        name: 'index'
    }]
})

export default router