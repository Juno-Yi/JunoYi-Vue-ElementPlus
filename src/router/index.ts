import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import type {App} from "vue";

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },

  ],
})

/**
 * 初始化路由
 * @param app Vue实例
 */
export function initRouter(app: App<Element>) {
  app.use(router);
}
