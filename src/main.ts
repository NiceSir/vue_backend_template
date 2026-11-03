import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

import App from './App.vue';
import router from './router';
import { setupRequestInterceptors } from '@/axios';
import { useUserStore } from '@/stores/user';

// 全局less
import '@/less/base.less';  


const app = createApp(App);

app.use(createPinia());
setupRequestInterceptors(() => useUserStore().getToken());
app.use(ElementPlus);
app.use(router);

app.mount('#app');
