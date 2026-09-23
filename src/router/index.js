import Vue from 'vue'
import Router from 'vue-router'
import index from '@/views/index'
import wallpaper from '@/views/wallpaper/index'
import detail from '@/views/wallpaper/detail'
import about from '@/views/about/index'
import { updateSEO, setSiteJsonLd, removeJsonLd } from '@/utils/seo'
import i18n from '@/locale'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [{
    path: '/',
    alias: '/index.html',
    component: index,
    children: [{
      path: '/',
      name: 'wallpaper',
      component: wallpaper,
      meta: {
        titleKey: 'seo.homeTitle',
        descKey: 'seo.homeDescription'
      }
    }, {
      path: 'region/:region',
      name: 'wallpaper-region',
      component: wallpaper,
      props: true,
      meta: {
        titleKey: 'seo.regionTitle',
        descKey: 'seo.regionDescription'
      }
    }, {
      path: '/blog',
      name: 'blog',
      redirect: '/',
    }, {
      path: '/about.html',
      name: 'about',
      component: about,
      meta: {
        titleKey: 'seo.aboutTitle',
        descKey: 'seo.aboutDescription'
      }
    }]
  }, {
    path: '/wallpaper/detail/:regionId',
    name: 'wallpaper-detail',
    component: detail,
    props: true,
    meta: {
      titleKey: 'seo.detailTitle',
      descKey: 'seo.detailDescription'
    }
  }]
})

router.afterEach((to) => {
  removeJsonLd('wallpaper-jsonld')
  removeJsonLd('region-jsonld')

  const meta = to.meta || {}

  if (to.name === 'wallpaper' || to.name === 'about' || to.name === 'blog') {
    updateSEO({
      title: i18n.t(meta.titleKey),
      description: i18n.t(meta.descKey),
      path: to.path
    })
    setSiteJsonLd()
  } else if (to.name === 'wallpaper-region') {
    updateSEO({
      title: i18n.t(meta.titleKey),
      description: i18n.t(meta.descKey),
      path: to.path
    })
    removeJsonLd('site-jsonld')
  } else if (to.name === 'wallpaper-detail') {
    updateSEO({
      title: i18n.t(meta.titleKey),
      description: i18n.t(meta.descKey),
      path: to.path,
      type: 'article'
    })
    removeJsonLd('site-jsonld')
  }

  window.scrollTo(0, 0)
})

export default router
