export default {
    /**
     * @description 配置显示在浏览器标签的title
     */
    title: '运营后台',
    /**
     * @description token在Cookie中存储的天数，默认7天
     */
    cookieExpires: 7,
    /**
     * @description api请求基础路径
     */
    baseUrl: {
        dev: '/api',
        prod: '/',
    },
};
