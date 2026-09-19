import Vue from 'vue'
import Router from 'vue-router'
import index from '@/views/index'
import wallpaper from '@/views/wallpaper/index'
import detail from '@/views/wallpaper/detail'
import about from '@/views/about/index'
import { updateSEO, setSiteJsonLd, removeJsonLd } from '@/utils/seo'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [{
    path: '/',
    component: index,
    children: [{
      path: '/',
      name: 'wallpaper',
      component: wallpaper,
      meta: {
        title: '必应壁纸 | 每天都有不一样的心情 | 各国必应壁纸下载',
        description: '必应壁纸(Bing Wallpaper)下载站，提供微软必应每日高清壁纸，支持中国、美国、日本、德国、英国、法国等9个国家地区的必应壁纸浏览与下载，提供4K、1920x1080等多种分辨率，一键批量下载全年壁纸。'
      }
    }, {
      path: 'region/:region',
      name: 'wallpaper-region',
      component: wallpaper,
      props: true,
      meta: {
        title: '地区必应壁纸',
        description: '各地区必应每日高清壁纸下载，支持中国、美国、日本、德国、英国、法国、意大利、加拿大、印度等地区。'
      }
    }, {
      path: '/blog',
      name: 'blog',
      redirect: '/',
    }, {
      path: '/about',
      name: 'about',
      component: about,
      meta: {
        title: '关于我们',
        description: '必应壁纸站点介绍，提供微软必应每日高清壁纸下载，支持多地区、多分辨率浏览与下载。本站所有图片均来自必应搜索，仅供学习和个人使用。'
      }
    }]
  }, {
    path: '/wallpaper/detail/:id',
    name: 'wallpaper-detail',
    component: detail,
    props: true,
    meta: {
      title: '壁纸详情',
      description: '必应壁纸详情页，查看高清壁纸并支持多种分辨率下载。'
    }
  }]
})

// 路由切换时更新 SEO 信息
router.afterEach((to) => {
  // 先移除可能存在的详情页/地区页结构化数据，避免残留
  removeJsonLd('wallpaper-jsonld')
  removeJsonLd('region-jsonld')

  const meta = to.meta || {}

  // 首页和关于页使用静态 SEO + 站点结构化数据
  if (to.name === 'wallpaper' || to.name === 'about' || to.name === 'blog') {
    updateSEO({
      title: meta.title,
      description: meta.description,
      path: to.path
    })
    setSiteJsonLd()
  } else if (to.name === 'wallpaper-region') {
    // 地区页的 title/description 会在组件内根据 region 动态更新
    updateSEO({
      title: meta.title,
      description: meta.description,
      path: to.path
    })
    // 移除站点级结构化数据，组件内会设置地区级的
    removeJsonLd('site-jsonld')
  } else if (to.name === 'wallpaper-detail') {
    // 详情页的 SEO 信息会在组件加载数据后动态更新
    updateSEO({
      title: meta.title,
      description: meta.description,
      path: to.path,
      type: 'article'
    })
    removeJsonLd('site-jsonld')
  }

  // 路由切换后滚动到顶部
  window.scrollTo(0, 0)
})

export default router
