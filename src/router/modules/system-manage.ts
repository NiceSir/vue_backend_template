import type { RouteRecordRaw } from 'vue-router';
// 用户管理
export const systemManager: RouteRecordRaw = {
    path: '/system-manage',
    name: 'system-manage',
    meta: {
        title: '系统管理',
        icon: 'Setting',
    },
    children: [
        {
            path: '/system-config',
            name: '系统配置',
            component: () => import('@/views/single-page/system-manage/system-config/index.vue'),
            meta: {
                title: '系统配置',
                icon: 'Setting',
            },
        },
        {
            path: '/account-permission-manage',
            redirect: '/account-permission',
            name: '账号权限管理',
            meta: {
                title: '账号权限管理',
                icon: 'User',
            },
            children: [
                {
                    path: '/account-permission',
                    name: '账号管理',
                    component: () =>
                        import('@/views/single-page/system-manage/account-permission/account-manage/index.vue'),
                    meta: {
                        title: '账号管理',
                        icon: 'User',
                    },
                },
                {
                    path: '/permission-manage',
                    name: '权限管理',
                    component: () =>
                        import('@/views/single-page/system-manage/account-permission/permission-manage/index.vue'),
                    meta: {
                        title: '权限管理',
                        icon: 'User',
                    },
                },
                {
                    path: '/permission-config',
                    name: '权限配置',
                    component: () =>
                        import('@/views/single-page/system-manage/account-permission/permission-config/index.vue'),
                    meta: {
                        title: '权限配置',
                        icon: 'User',
                    },
                },
            ],
        },
    ],
};
