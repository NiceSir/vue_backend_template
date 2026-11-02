import type { RouteRecordRaw } from 'vue-router';

const routers: RouteRecordRaw[] = [
    {
        name: 'login',
        path: '/login',
        component: () => import('@/views/login/index.vue'),
        meta: {
            title: 'Login 登录',
        },
    },
    {
        path: '/',
        name: '_home',
        redirect: '/home',
        component: () => import('@/views/main/index.vue'),
        meta: {
            title: '首页',
        },
        children: [
            {
                path: '/home',
                name: 'home',
                component: () => import('@/views/home/index.vue'),
            },
        ],
    },
];

export default routers;
