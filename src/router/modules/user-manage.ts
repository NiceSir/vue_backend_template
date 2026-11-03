import type { RouteRecordRaw } from 'vue-router';
// 用户管理
export const userManager: RouteRecordRaw = {
    path: '/user-manage',
    name: 'user-manage',
    meta: {
        title: '用户管理',
        icon: 'User',
    },
    children: [
        {
            path: '/user-info',
            name: '用户信息查询',
            component: () => import('@/views/single-page/user-manage/user-info/index.vue'),
            meta: {
                title: '用户信息查询',
                icon: 'User',
            },
        },
        {
            path: '/forbiden-log',
            name: '封禁日志',
            component: () => import('@/views/single-page/user-manage/forbiden-log/index.vue'),
            meta: {
                title: '封禁日志',
                icon: 'Document',
            },
        },
    ],
};
