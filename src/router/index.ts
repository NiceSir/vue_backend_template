import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/user';
import routers, { LOGIN_PAGE_NAME, HOME_PAGE_NAME } from './routers';

declare module 'vue-router' {
    interface RouteMeta {
        title?: string;
        icon?: string;
        hideInMenu?: boolean;
    }
}

const updatePageTitle = (title?: string) => {
    if (title !== undefined) {
        document.title = title;
    }
};

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: routers,
});

// 路由守卫
// 通过控制用户登录管理路由的跳转
router.beforeEach(async (to, from, next) => {
    updatePageTitle(to.meta.title);
    const userStore = useUserStore();
    const token = userStore.getToken();
    if (!token) {
        if (to.name === LOGIN_PAGE_NAME) {
            return next();
        }

        return next({ name: LOGIN_PAGE_NAME });
    } else if (token && to.name == LOGIN_PAGE_NAME) {
        next({
            name: HOME_PAGE_NAME,
        });
    } else {
        try {
            await userStore.fetchUserInfo();
            next();
        } catch (error) {
            console.error('获取用户资料失败，返回登录页', error);
            next({ name: LOGIN_PAGE_NAME });
            throw error;
        }
    }
});

// //
// router.afterEach((to,from)=>{

// })

export default router;
