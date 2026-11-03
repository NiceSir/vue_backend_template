import type { RouteRecordRaw } from 'vue-router';
import { userManager } from './modules/user-manage';
import { systemManager } from './modules/system-manage';

// 登录页
export const LOGIN_PAGE_NAME = 'login';
// 首页
export const HOME_PAGE_NAME = 'home';

const routers: RouteRecordRaw[] = [
    {
        name: LOGIN_PAGE_NAME,
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
                name: HOME_PAGE_NAME,
                component: () => import('@/views/home/index.vue'),
            },
        ],
    },
    // 系统级菜单
    {
        path: '/404',
        name: 'error_404',
        component: ()=> import('@/views/error-page/404.vue')
    },
    {
        path: '/500',
        name: 'error_500',
        component: ()=> import('@/views/error-page/500.vue')
    }
];

routers.push(userManager);
routers.push(systemManager);

export default routers;
