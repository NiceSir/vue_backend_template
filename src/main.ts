import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';

// 全局less
import '@/less/base.less';  


const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app');