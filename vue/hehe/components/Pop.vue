<template>
  <div class="template-pop">
  </div>
</template>

<script>
import bus from '../api/eventBus'
import {
  popStatus,
  deviceType,
  pageName,
  userType,
  userBtn,
  userCode,
  lotteryInfo
} from '../vuex/getters'
import {
  setUserType,
  setWeixinMask,
  setUserCode,
  setUserBtn,
  setPopStatus,
  setLotteryInfo,
} from '../vuex/actions'
export default {
  data() {
    return {
      ticker: '获取验证码',
      verifycode: '',
      username: '',
      mobile: '',
      rdm1: Math.floor(Math.random() * 5),
      rdm2: Math.floor(Math.random() * 4),
      prizeCode: '',
      prizeId: '',
      prizeName: '',
    }
  },
  vuex: {
    getters: {
      userCode,
      userType,
      userBtn,
      pageName,
      popStatus,
      lotteryInfo
    },
    actions: {
      setWeixinMask,
      setUserCode,
      setUserBtn,
      setUserType,
      setPopStatus,
      setLotteryInfo
    }
  },

  methods: {
    closePop(e) {
      let me = this;
      let tag = e.target.dataset.tag;
      this.setPopStatus(tag, false);
      if (tag == 'address') {
        router.replace({
          name: 'spree'
        })
      } else if (tag == 'other') {
        router.push({
          name: 'index'
        })
      }
    },
    onOpenUrl(e) {
      let me = this;
      let tar = e.currentTarget.dataset.tag;
      let url = e.currentTarget.dataset.url;
      if (me.getLottery) {
        me.setPopStatus("send", false);
        me.setPopStatus("share", true);
      } else {
        location.href = url;
      }
    },
    onLogin() {
      let me = this;
      let mobile = me.mobile;
      let verifycode = me.verifycode;

      if (!mobile) {
        _zax.ui.toast('请填写手机号');
        return;
      } else if (!_zax.regexForm.mobile(mobile)) {
        _zax.ui.toast('请填写正确的手机号');
        return;
      } else if (!verifycode) {
        _zax.ui.toast('请填写短信验证码');
        return;
      }
      me.service.userLogin(me, mobile, verifycode, (status) => {
      });
    },
    onGetVerifyCode(e) {
      let me = this;

      //发送验证码
      let username = me.username;
      let mobile = me.mobile;
      let region = me.region;
      let address = me.address;
      let verifycode = me.verifycode;

      if (!this.mobile) {
        _zax.ui.toast('请填写手机号');
        return;
      } else if (!_zax.regexForm.mobile(this.mobile)) {
        _zax.ui.toast('请填写正确的手机号');
        return;
      } else {
        if (this.ticker != '获取验证码') {
          return;
        } else {
          this.ticker = '60 s';
          me.service.sendVerifyCode(me, mobile);
          let myticker = setInterval(() => {
            let tck = parseInt(this.ticker.replace(' s', ''));
            if (tck > 0) {
              me.ticker = ((tck - 1) + ' s');
            } else {
              clearInterval(myticker);
              me.ticker = '获取验证码';
            }
          }, 1000);
        }
      }

    },
    openBag(e) {
      let me = this;
      _zax.ui.loading.show();
      me.setPopStatus('notred', false);

      me.service.upsDraw(me);
    }

  },
  created() {
    let me = this;
    if (me.cfg.machine.indexOf('test') > -1) {
      me.verifycode = '999999';
    }

  },
  beforeDestory() {
    let me = this;

  }
}
</script>