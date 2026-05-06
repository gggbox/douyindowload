import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/parse',
  },
  {
    path: '/parse',
    name: 'Parse',
    component: () => import('@/pages/ParsePage.vue'),
    meta: { title: '链接解析', icon: 'Link' },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/pages/ProfilePage.vue'),
    meta: { title: '主页批量', icon: 'User' },
  },
  {
    path: '/browser',
    name: 'Browser',
    component: () => import('@/pages/BrowserPage.vue'),
    meta: { title: '内嵌浏览', icon: 'Monitor' },
  },
  {
    path: '/downloads',
    name: 'Downloads',
    component: () => import('@/pages/DownloadPage.vue'),
    meta: { title: '下载管理', icon: 'Download' },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/pages/SettingsPage.vue'),
    meta: { title: '设置', icon: 'Setting' },
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
