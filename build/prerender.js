'use strict'

/**
 * 预渲染脚本：在 webpack 构建完成后执行
 * 用途：为 SPA 生成带真实 <h1>、meta、canonical、JSON-LD 的静态 HTML，
 * 让 Bing 等搜索引擎无需执行 JS 也能识别页面标题与内容，解决「缺少 h1 标记」。
 *
 * 国际化：每个地区的页面使用该地区语言的 SEO 文案（标题/描述/关键词/JSON-LD/正文），
 * 与 src/locale 中对应语言的 seo.* 文案保持一致，并同步设置 <html lang> 与 og:locale，
 * 避免非中文页面混入中文（如英文标题后接「必应壁纸」）。
 *
 * 数据来源：从 bing-wallpaper-api 仓库的 data 目录直接拉取完整 JSON 文件
 *         （一次请求获取全部数据，比分页 API 快很多）
 *
 * 生成页面：
 *  - /about.html                       (站点默认中文)
 *  - /region/{region}.html             (9 个地区页，按地区语言)
 *  - /wallpaper/detail/{region}-{id}.html  (全部详情页，按地区语言)
 *
 * 首页 /index.html 由 webpack 直接产出，已在模板中内置兜底 <h1>。
 */

const fs = require('fs')
const path = require('path')
const axios = require('axios')
const chalk = require('chalk')

const SITE_URL = 'https://bimg.cc'
const DATA_BASE_URL = 'https://raw.githubusercontent.com/flow2000/bing-wallpaper-api/master/data'
const DIST = path.resolve(__dirname, '../dist')

// 英文公共文案（en-US / en-GB / en-CA / en-IN 共用）
const EN = {
  siteName: 'Bing Wallpaper',
  detailTitle: '{title} - {region} Bing Wallpaper HD Download',
  detailDesc: '{title}. {copyright} Published on {date}{region}. Bing Wallpaper offers 4K, 1920x1080 and other resolutions for free download.',
  detailFromRegion: ', from {name}',
  detailKeywords: '{title},{region} Bing Wallpaper,HD wallpaper download,bing wallpaper,{date}',
  regionTitle: '{name} Bing Wallpaper - {name} Daily HD Wallpaper Download',
  regionDesc: '{name} Bing Wallpaper download, providing Microsoft Bing {name} region daily HD wallpapers, supporting 4K, 1920x1080 and other resolutions, free HD desktop wallpaper downloads.',
  regionKeywords: '{name} Bing Wallpaper,{name} wallpaper,Bing Wallpaper,HD wallpaper download',
  breadcrumbHome: 'Home',
  breadcrumbRegion: '{name} Bing Wallpaper',
  publishDateLabel: 'Published: ',
  regionLabel: 'Region: ',
  viewOriginal: 'View Original',
  backHome: 'Back to Home'
}

// 各地区 SEO 文案（key 为地区代码，与 src/locale 一致）
const LOCALES = {
  'zh-CN': {
    htmlLang: 'zh-CN',
    ogLocale: 'zh_CN',
    siteName: '必应壁纸',
    regionName: '中国',
    detailTitle: '{title} - {region}必应壁纸高清下载',
    detailDesc: '{title}。{copyright} 发布于{date}{region}。必应壁纸提供4K、1920x1080等多种分辨率免费下载。',
    detailFromRegion: '，来自{name}地区',
    detailKeywords: '{title},{region}必应壁纸,高清壁纸下载,bing wallpaper,{date}',
    regionTitle: '{name}必应壁纸 - {name}地区每日高清壁纸下载',
    regionDesc: '{name}必应壁纸下载，提供微软必应{name}地区每日高清壁纸，支持4K、1920x1080等多种分辨率，免费下载高清电脑壁纸。',
    regionKeywords: '{name}必应壁纸,{name}壁纸,必应壁纸,高清壁纸下载',
    breadcrumbHome: '首页',
    breadcrumbRegion: '{name}必应壁纸',
    publishDateLabel: '发布日期：',
    regionLabel: '地区：',
    viewOriginal: '查看原图',
    backHome: '返回首页',
    defaultKeywords: '必应壁纸,bing壁纸,必应每日壁纸,必应高清壁纸下载,微软Bing壁纸,Bing Wallpaper,高清壁纸,电脑壁纸,4K壁纸,壁纸下载'
  },
  'en-US': Object.assign({ htmlLang: 'en-US', ogLocale: 'en_US', regionName: 'USA' }, EN),
  'en-GB': Object.assign({ htmlLang: 'en-GB', ogLocale: 'en_GB', regionName: 'United Kingdom' }, EN),
  'en-CA': Object.assign({ htmlLang: 'en-CA', ogLocale: 'en_CA', regionName: 'Canada' }, EN),
  'en-IN': Object.assign({ htmlLang: 'en-IN', ogLocale: 'en_IN', regionName: 'India' }, EN),
  'ja-JP': {
    htmlLang: 'ja-JP',
    ogLocale: 'ja_JP',
    siteName: 'Bing壁紙',
    regionName: '日本',
    detailTitle: '{title} - {region} Bing壁紙HDダウンロード',
    detailDesc: '{title}。{copyright} 公開日：{date}{region}。Bing壁紙は4K、1920x1080などの解像度で無料ダウンロードを提供。',
    detailFromRegion: '、{name}から',
    detailKeywords: '{title},{region} Bing壁紙,HD壁紙ダウンロード,bing wallpaper,{date}',
    regionTitle: '{name} Bing壁紙 - {name}デイリーHD壁紙ダウンロード',
    regionDesc: '{name} Bing壁紙ダウンロード。Microsoft Bing {name}地域のデイリーHD壁紙を提供し、4K、1920x1080などの解像度に対応。無料HDデスクトップ壁紙ダウンロード。',
    regionKeywords: '{name} Bing壁紙,{name}壁紙,Bing壁紙,HD壁紙ダウンロード',
    breadcrumbHome: 'ホーム',
    breadcrumbRegion: '{name} Bing壁紙',
    publishDateLabel: '公開日：',
    regionLabel: '地域：',
    viewOriginal: '元画像を表示',
    backHome: 'ホームに戻る'
  },
  'de-DE': {
    htmlLang: 'de-DE',
    ogLocale: 'de_DE',
    siteName: 'Bing Wallpaper',
    regionName: 'Deutschland',
    detailTitle: '{title} - {region} Bing Wallpaper HD Download',
    detailDesc: '{title}. {copyright} Veröffentlicht am {date}{region}. Bing Wallpaper bietet 4K, 1920x1080 und weitere Auflösungen zum kostenlosen Download.',
    detailFromRegion: ', aus {name}',
    detailKeywords: '{title},{region} Bing Wallpaper,HD Wallpaper Download,bing wallpaper,{date}',
    regionTitle: '{name} Bing Wallpaper - {name} tägliche HD-Wallpaper-Download',
    regionDesc: '{name} Bing Wallpaper-Download. Bietet Microsoft Bing {name} regionale tägliche HD-Wallpaper, unterstützt 4K, 1920x1080 und weitere Auflösungen. Kostenloser HD-Desktop-Wallpaper-Download.',
    regionKeywords: '{name} Bing Wallpaper,{name} Wallpaper,Bing Wallpaper,HD Wallpaper Download',
    breadcrumbHome: 'Startseite',
    breadcrumbRegion: '{name} Bing Wallpaper',
    publishDateLabel: 'Veröffentlicht am ',
    regionLabel: 'Region: ',
    viewOriginal: 'Original ansehen',
    backHome: 'Zur Startseite'
  },
  'fr-FR': {
    htmlLang: 'fr-FR',
    ogLocale: 'fr_FR',
    siteName: 'Bing Wallpaper',
    regionName: 'France',
    detailTitle: '{title} - {region} Bing Wallpaper HD Télécharger',
    detailDesc: '{title}. {copyright} Publié le {date}{region}. Bing Wallpaper offre 4K, 1920x1080 et d\'autres résolutions en téléchargement gratuit.',
    detailFromRegion: ', région : {name}',
    detailKeywords: '{title},{region} Bing Wallpaper,téléchargement fond d\'écran HD,bing wallpaper,{date}',
    regionTitle: '{name} Bing Wallpaper - Télécharger fond d\'écran HD quotidien {name}',
    regionDesc: 'Téléchargement {name} Bing Wallpaper, fournissant des fonds d\'écran HD quotidiens Microsoft Bing région {name}, supportant 4K, 1920x1080 et d\'autres résolutions, téléchargement gratuit de fonds d\'écran HD pour bureau.',
    regionKeywords: '{name} Bing Wallpaper,fond d\'écran {name},Bing Wallpaper,téléchargement fond d\'écran HD',
    breadcrumbHome: 'Accueil',
    breadcrumbRegion: '{name} Bing Wallpaper',
    publishDateLabel: 'Publié le ',
    regionLabel: 'Région : ',
    viewOriginal: 'Voir l\'original',
    backHome: 'Retour à l\'accueil'
  },
  'it-IT': {
    htmlLang: 'it-IT',
    ogLocale: 'it_IT',
    siteName: 'Bing Wallpaper',
    regionName: 'Italia',
    detailTitle: '{title} - {region} Bing Wallpaper HD Download',
    detailDesc: '{title}. {copyright} Pubblicato il {date}{region}. Bing Wallpaper offre 4K, 1920x1080 e altre risoluzioni per download gratuito.',
    detailFromRegion: ' (regione: {name})',
    detailKeywords: '{title},{region} Bing Wallpaper,download sfondo HD,bing wallpaper,{date}',
    regionTitle: '{name} Bing Wallpaper - Download sfondo HD giornaliero {name}',
    regionDesc: 'Download {name} Bing Wallpaper, che fornisce sfondi HD giornalieri Microsoft Bing regione {name}, supportando 4K, 1920x1080 e altre risoluzioni, download gratuito di sfondi HD per desktop.',
    regionKeywords: '{name} Bing Wallpaper,sfondo {name},Bing Wallpaper,download sfondo HD',
    breadcrumbHome: 'Home',
    breadcrumbRegion: '{name} Bing Wallpaper',
    publishDateLabel: 'Pubblicato il ',
    regionLabel: 'Regione: ',
    viewOriginal: 'Vedi originale',
    backHome: 'Torna alla home'
  }
}

// 页面内嵌的预渲染样式，保证 JS 未执行时的可读性
const PRERENDER_CSS =
  '.prerender-wrap{max-width:900px;margin:0 auto;padding:40px 20px;font-family:-apple-system,"PingFang SC","Microsoft YaHei",sans-serif;color:#303133;line-height:1.6}' +
  '.prerender-wrap h1{font-size:28px;margin:0 0 14px;line-height:1.4}' +
  '.prerender-wrap img{display:block;width:100%;height:auto;border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,.12);margin:18px 0}' +
  '.prerender-wrap .desc{color:#606266;font-size:15px;margin:0 0 10px}' +
  '.prerender-wrap .meta{color:#909399;font-size:13px;margin:0 0 22px}' +
  '.prerender-wrap .btn{display:inline-block;padding:10px 20px;background:#409eff;color:#fff;border-radius:6px;text-decoration:none;font-size:14px;margin:0 8px 8px 0}' +
  '.prerender-wrap .btn.gray{background:#c0c4cc}'

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// 简易模板插值：'{title} - {region}' + { title, region } -> 替换占位符
function t(tpl, params) {
  return String(tpl).replace(/\{(\w+)\}/g, (m, key) => (params && params[key] != null ? params[key] : m))
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function ensureDir(dir) {
  if (fs.existsSync(dir)) return
  ensureDir(path.dirname(dir))
  fs.mkdirSync(dir)
}

function writePage(relPath, html) {
  const abs = path.join(DIST, relPath)
  ensureDir(path.dirname(abs))
  fs.writeFileSync(abs, html, 'utf8')
}

// 提取版权说明（去掉括号内 © 部分），与 detail.vue 逻辑一致
function imageDescription(copyright) {
  return (copyright || '').replace(/\s*\(©[^)]*\)\s*$/, '').trim()
}

function safeJson(data) {
  // 防止标题内含 </script> 破坏 JSON-LD
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

// 更新/插入 meta 标签
function setMeta(html, attr, attrValue, content) {
  const re = new RegExp('<meta ' + attr + '="' + attrValue + '"[^>]*>', 'i')
  const tag = '<meta ' + attr + '="' + attrValue + '" content="' + esc(content) + '">'
  if (re.test(html)) return html.replace(re, tag)
  return html.replace('</head>', tag + '\n  </head>')
}

function setCanonical(html, url) {
  const re = /<link rel="canonical"[^>]*>/i
  const tag = '<link rel="canonical" href="' + esc(url) + '">'
  if (re.test(html)) return html.replace(re, tag)
  return html.replace('</head>', tag + '\n  </head>')
}

function setJsonLd(html, data) {
  const script = '<script type="application/ld+json">' + safeJson(data) + '</script>'
  return html.replace('</head>', script + '\n  </head>')
}

// 基于 dist/index.html 模板生成单页，替换 head 与 #app 内容
function renderPage(base, opts) {
  let html = base
  html = html.replace(/<html lang="[^"]*"/i, '<html lang="' + (opts.htmlLang || 'zh-CN') + '"')
  html = html.replace(/<title>[\s\S]*?<\/title>/, '<title>' + esc(opts.title) + '</title>')
  html = setMeta(html, 'name', 'description', opts.description)
  html = setMeta(html, 'name', 'keywords', opts.keywords)
  html = setCanonical(html, opts.url)
  html = setMeta(html, 'property', 'og:type', opts.type || 'website')
  html = setMeta(html, 'property', 'og:title', opts.title)
  html = setMeta(html, 'property', 'og:description', opts.description)
  html = setMeta(html, 'property', 'og:url', opts.url)
  html = setMeta(html, 'property', 'og:locale', opts.ogLocale || 'zh_CN')
  html = setMeta(html, 'property', 'og:site_name', opts.siteName || LOCALES['zh-CN'].siteName)
  html = setMeta(html, 'property', 'og:image', opts.image || SITE_URL + '/static/logo.png')
  html = setMeta(html, 'name', 'twitter:title', opts.title)
  html = setMeta(html, 'name', 'twitter:description', opts.description)
  html = setMeta(html, 'name', 'twitter:image', opts.image || SITE_URL + '/static/logo.png')
  if (opts.jsonld) html = setJsonLd(html, opts.jsonld)

  const css = '<style>' + PRERENDER_CSS + '</style>'
  html = html.replace('</head>', css + '\n  </head>')

  // 替换 #app 内的兜底内容（模板中 <div id="app"> 内无嵌套 div，可安全匹配）
  html = html.replace(/<div id="app">[\s\S]*?<\/div>/, '<div id="app">' + opts.content + '</div>')
  return html
}

// ---------- 详情页 ----------
function renderDetail(base, w, code) {
  const L = LOCALES[code]
  const name = L.regionName
  const url = SITE_URL + '/wallpaper/detail/' + code + '-' + w.id + '.html'
  const desc1 = imageDescription(w.copyright)
  const title = t(L.detailTitle, { title: w.title, region: name }) + ' | ' + L.siteName
  const description = t(L.detailDesc, {
    title: w.title,
    copyright: desc1 ? desc1 + ' ' : '',
    date: w.datetime || '',
    region: t(L.detailFromRegion, { name })
  })
  const keywords = t(L.detailKeywords, { title: w.title, region: name, date: w.datetime || '' })

  const jsonld = [
    {
      '@context': 'https://schema.org',
      '@type': 'ImageObject',
      name: w.title,
      description: w.copyright || w.title,
      contentUrl: w.url,
      url: url,
      datePublished: w.datetime,
      creator: { '@type': 'Organization', name: 'Microsoft Bing' },
      license: 'https://www.bing.com',
      contentLocation: {
        '@type': 'Place',
        name: name,
        address: { '@type': 'PostalAddress', addressCountry: code }
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: L.breadcrumbHome, item: SITE_URL + '/' },
        { '@type': 'ListItem', position: 2, name: t(L.breadcrumbRegion, { name }), item: SITE_URL + '/region/' + code + '.html' },
        { '@type': 'ListItem', position: 3, name: w.title, item: url }
      ]
    }
  ]

  const content =
    '<div class="prerender-wrap">' +
    '<h1>' + esc(w.title) + '</h1>' +
    '<p class="desc">' + esc(w.copyright || '') + '</p>' +
    '<img src="' + esc(w.url) + '" alt="' + esc(w.title) + '">' +
    '<p class="meta">' + esc(L.publishDateLabel) + esc(w.datetime || '') +
    ' &nbsp;·&nbsp; ' + esc(L.regionLabel) + esc(name) + '</p>' +
    '<a class="btn" href="' + esc(w.url) + '" rel="noopener">' + esc(L.viewOriginal) + '</a>' +
    '<a class="btn gray" href="/">' + esc(L.backHome) + '</a>' +
    '</div>'

  return renderPage(base, {
    title,
    description,
    keywords,
    url,
    image: w.url,
    type: 'article',
    htmlLang: L.htmlLang,
    ogLocale: L.ogLocale,
    siteName: L.siteName,
    jsonld,
    content
  })
}

// ---------- 地区页 ----------
function renderRegion(base, code) {
  const L = LOCALES[code]
  const name = L.regionName
  const url = SITE_URL + '/region/' + code + '.html'
  const title = t(L.regionTitle, { name }) + ' | ' + L.siteName
  const description = t(L.regionDesc, { name })
  const keywords = t(L.regionKeywords, { name })
  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: t(L.regionTitle, { name }),
    description: description,
    url: url,
    isPartOf: { '@type': 'WebSite', name: L.siteName, url: SITE_URL + '/' }
  }
  const content =
    '<div class="prerender-wrap">' +
    '<h1>' + esc(t(L.regionTitle, { name })) + '</h1>' +
    '<p class="desc">' + esc(description) + '</p>' +
    '<a class="btn" href="/">' + esc(L.backHome) + '</a>' +
    '</div>'

  return renderPage(base, {
    title,
    description,
    keywords,
    url,
    jsonld,
    content,
    htmlLang: L.htmlLang,
    ogLocale: L.ogLocale,
    siteName: L.siteName
  })
}

// ---------- 关于页（站点默认中文） ----------
function renderAbout(base) {
  const L = LOCALES['zh-CN']
  const url = SITE_URL + '/about.html'
  const desc = '必应壁纸站点介绍，提供微软必应每日高清壁纸下载，支持多地区、多分辨率浏览与下载。本站所有图片均来自必应搜索，仅供学习和个人使用。'
  const content =
    '<div class="prerender-wrap">' +
    '<h1>关于必应壁纸</h1>' +
    '<p class="desc">一个精美的必应壁纸展示站点，提供丰富的壁纸浏览、筛选和下载功能。</p>' +
    '<a class="btn" href="/">' + esc(L.backHome) + '</a>' +
    '</div>'
  return renderPage(base, {
    title: '关于我们 | ' + L.siteName,
    description: desc,
    keywords: L.defaultKeywords,
    url,
    content
  })
}

// ---------- 请求层 ----------
// 从 GitHub 仓库的 data 目录直接获取完整 JSON 数据（一次请求获取全部，无需分页）
async function fetchRegion(region) {
  const url = DATA_BASE_URL + '/' + region + '_all.json'
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const resp = await axios.get(url, {
        timeout: 30000,
        headers: { 'User-Agent': 'bing-wallpaper-prerender/1.0 (SEO build)' }
      })
      const body = resp.data
      if (body && body.code === 200) {
        const items = []
        const seen = {}
        for (const w of body.data || []) {
          if (w.id == null || seen[w.id]) continue
          seen[w.id] = true
          items.push(w)
        }
        return items
      }
      throw new Error('返回 code=' + body.code)
    } catch (e) {
      if (attempt === 2) throw e
      // 指数退避：第1次重试等 3s，第2次等 8s
      await delay(3000 * Math.pow(2, attempt))
    }
  }
}

// ---------- 主流程 ----------
async function main() {
  const baseFile = path.join(DIST, 'index.html')
  if (!fs.existsSync(baseFile)) {
    throw new Error('未找到 ' + baseFile + '，请先执行 webpack 构建')
  }
  const base = fs.readFileSync(baseFile, 'utf8')

  writePage('about.html', renderAbout(base))
  console.log(chalk.green('  about.html (1 页)'))

  let totalDetail = 0
  let idx = 0
  for (const code of Object.keys(LOCALES)) {
    // 地区之间加短延迟，避免请求过于集中
    if (idx++ > 0) await delay(200)
    const name = LOCALES[code].regionName
    process.stdout.write(chalk.cyan('  拉取 ' + code + ' (' + name + ') ... '))
    let items
    try {
      items = await fetchRegion(code)
    } catch (e) {
      console.log(chalk.red('失败，跳过：' + e.message))
      continue
    }
    writePage(path.join('region', code + '.html'), renderRegion(base, code))
    for (const w of items) {
      writePage(path.join('wallpaper', 'detail', code + '-' + w.id + '.html'), renderDetail(base, w, code))
    }
    totalDetail += items.length
    console.log(chalk.green(items.length + ' 张壁纸已生成'))
  }

  return totalDetail
}

module.exports = function prerender() {
  return main().then(totalDetail => {
    console.log(chalk.green('\n  预渲染完成：关于页 1 + 地区页 ' + Object.keys(LOCALES).length +
      ' + 详情页 ' + totalDetail + ' 页\n'))
  })
}
