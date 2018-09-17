// base config
const machine = "";
const debug = machine ? true : false;
const spaMode = "__spaMode__"; //vue react
const spaDir = "__spaDir__"; //20161014

// const assetsPath = '';
// relative config
const assetsPath = debug ? `http://__localIP__:__localPORT__/${spaMode}/${spaDir}` : `//static.zhongan.com/website/assets/subject/${spaMode}/${spaDir}`;

module.exports = {
    debug,
    router: {
        split: false, //是否使用路由方式代码分割，超过10条路由，建议采用，默认为false
        mode: 'hash', //当前构建环境（单webpack多spa）不能很好支持browser模式，（单webpack单spa）比较适合browser模式（修改路由path层级+Nginx伪静态路由配置部署）
    },
    machine,
    domain: `//evt${machine}.zhongan.com`,
    activityCode: 'SSXLHDZY',
    shareCode: 'SSXLHD2',
    token: 'zaLoginCookieKey',
    loginUrl: `https://login${machine}.zhongan.com/mobile/login.htm?sourceApp=8&target=http://a${machine}.zhongan.com/open/member/loginJump?logincallback=`,
    appUrl: 'https://static.zhongan.com/website/app/html/downLoadLink/build/html/index.html?channel=APPSSXLHD',
    assetsPath,
    bizOrigin: '',
    api: ``,
    boxApi: `//mip${machine}.zhongan.com`,
    zaapp: {
        scorelist: 'zaapp://zai.scorelist?' //列表
    },
    appconfig: {},
    share: {},
    surfix: '',
    prefix: `za_${spaDir}_`,
    __daddy__: [
        { search: '__routerMode__', replace: { 'router.split==true': 'router-split', 'router.split==false': 'router-common' }, regexMode: 'ig' },
    ]
}