import Vue from 'vue'
import Router from 'vue-router'
import index from '@/views/index'
import wallpaper from '@/views/wallpaper/index'
import about from '@/views/about/index'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [{
    path: '/',
    name: 'index',
    component: index,
    children: [{
      path: '/',
      name: 'wallpaper',
      component: wallpaper,
    }, {
      path: '/blog',
      name: 'blog',
      redirect: '/',
    }, {
      path: '/about',
      name: 'about',
      component: about,
    }]
  }]
})
