import { createRouter, createWebHistory } from 'vue-router'
import routers from './routers'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
  }
}

const updatePageTitle = (title?: string) => {
  if (title !== undefined) {
    document.title = title
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routers,
})

// 路由守卫
// 通过控制用户登录管理路由的跳转
router.beforeEach((to,from,next)=>{
  updatePageTitle(to.meta.title)
  next();
})

// // 
// router.afterEach((to,from)=>{

// })

export default router
