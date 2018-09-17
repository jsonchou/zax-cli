<template>
  <div class="teamplate-index">
    家庭保障计划数据获取活动
  </div>
</template>

<script>
import bus from '../api/eventBus';
import {
  setPageName,
  setUserCode,
  setUserType,
  setPopStatus,
  setUserBtn,
  setOppsStatus,
  setLotteryInfo,
  setWeixinMask,
  setActivityCode
} from '../vuex/actions'
import {
  userCode,
  userType,
  pageName,
  oppsStatus,
  lotteryInfo,
  popStatus,
  deviceType,
  activityCode
} from '../vuex/getters'
export default {
  components: {},
  data() {
    return {
    }
  },
  vuex: {
    getters: {
      userCode,
      userType,
      pageName,
      deviceType,
      oppsStatus,
      lotteryInfo,
      popStatus,
      activityCode
    },
    actions: {
      setUserType,
      setUserBtn,
      setUserCode,
      setOppsStatus,
      setLotteryInfo,
      setWeixinMask,
      setPageName,
      setPopStatus,
      setActivityCode
    }
  },
  watch: {

  },
  filters: {

  },
  methods: {
    onPop(e) {
      let me = this;
      let tag = e.target.dataset.tag;
      this.setPopStatus(tag, true);
    }
  },
  created() {
    let me = this;
  },
  mounted() {
    let me = this;
  },
  updated() {
    //console.log('index updated');
  },

  destroyed() {
    let me = this;
    me.setPopStatus('login', false);
    //优惠券 弹窗
    me.setWeixinMask(false);
    clearInterval(lampTimer);
  }
}
</script>