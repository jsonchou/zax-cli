import Vue from 'vue'
import VueRouter from 'vue-router'

import Index from '../components/Index.vue'

const router = new VueRouter({
    mode: 'hash', //history
    routes: [{
        path: '/',
        component: Index,
        name: 'index'
    }]
})

export default router