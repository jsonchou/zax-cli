<template>
    <div class="template-weixin-mask" @click="onCloseMask" :class="[weixinMask?'template-weixin-mask-on':'']" >
        <img  src="//static.zhongan.com/website/assets/subject/vue/20161221/assets/images/weixin-mask.png" alt="">
    </div>
</template>

<script>
    import {
        setWeixinMask,
    } from '../../vuex/actions'
    import {
        weixinMask,
    } from '../../vuex/getters'
    export default {
        data() {
            return {
                
            }
        },
        vuex: {
            getters: {
                weixinMask,
            },
            actions: {
                setWeixinMask,
            }
        },
        methods: {
            onCloseMask(e) {
                _zax.ui.mask.hide();
                this.setWeixinMask(false);
            }
        }
    }
</script>