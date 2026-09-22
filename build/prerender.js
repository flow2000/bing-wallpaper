'use strict'

/**
 * 预渲染脚本：在 webpack 构建完成后执行
 * 用途：为 SPA 生成带真实 <h1>、meta、canonical、JSON-LD 的静态 HTML，
 * 让 Bing 等搜索引擎无需执行 JS 也能识别页面标题与内容，解决「缺少 h1 标记」。
 *
 * 生成页面：
 *  - /about.html
 *  - /region/{region}.html          (9 个地区页)
 *  - /wallpaper/detail/{region}-{id}.html  (全部详情页)
 *
 * 首页 /index.html 由 webpack 直接产出，已在模板中内置兜底 <h1>。
 */

const fs = require('fs')
const path = require('path')
const axios = require('axios')
const chalk = require('chalk')

const SITE_URL = 'https://bimg.cc'
const SITE_NAME = '必应壁纸'
const API = 'https://api.bimg.cc/all'
const PAGE_SIZE = 100 // 接口 limit 上限为 100
const DIST = path.resolve(__dirname, '../dist')

const REGIONS = {
  'zh-CN': '中国',
  'en-US': '美国',
  'de-DE': '德国',
  'ja-JP': '日本',
  'en-GB': '英国',
  'fr-FR': '法国',
  'it-IT': '意大利',
  'en-CA': '加拿大',
  'en-IN': '印度'
}

const DEFAULT_DESC = '必应壁纸(Bing Wallpaper)下载站，提供微软必应每日高清壁纸，支持中国、美国、日本、德国、英国、法国等9个国家地区的必应壁纸浏览与下载，提供4K、1920x1080等多种分辨率，一键批量下载全年壁纸。'
const DEFAULT_KEYWORDS = '必应壁纸,bing壁纸,必应每日壁纸,必应高清壁纸下载,微软Bing壁纸,Bing Wallpaper,高清壁纸,电脑壁纸,4K壁纸,壁纸下载'

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
  html = html.replace(/<title>[\s\S]*?<\/title>/, '<title>' + esc(opts.title) + '</title>')
  html = setMeta(html, 'name', 'description', opts.description)
  html = setMeta(html, 'name', 'keywords', opts.keywords || DEFAULT_KEYWORDS)
  html = setCanonical(html, opts.url)
  html = setMeta(html, 'property', 'og:title', opts.title)
  html = setMeta(html, 'property', 'og:description', opts.description)
  html = setMeta(html, 'property', 'og:url', opts.url)
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
function renderDetail(base, w, code, name) {
  const id = w.id
  const url = SITE_URL + '/wallpaper/detail/' + code + '-' + id + '.html'
  const desc1 = imageDescription(w.copyright)
  const desc = w.title + '。' + (desc1 ? desc1 + ' ' : '') + (w.datetime ? '发布于' + w.datetime + '，' : '') +
    (name ? '来自' + name + '地区。' : '') + '必应壁纸提供4K、1920x1080等多种分辨率免费下载。'

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
      contentLocation: name
        ? { '@type': 'Place', name: name, address: { '@type': 'PostalAddress', addressCountry: code } }
        : undefined
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '首页', item: SITE_URL + '/' },
        { '@type': 'ListItem', position: 2, name: name + '必应壁纸', item: SITE_URL + '/region/' + code + '.html' },
        { '@type': 'ListItem', position: 3, name: w.title, item: url }
      ]
    }
  ].map(o => {
    // 去掉 undefined 字段，避免 JSON-LD 出现 null
    return JSON.parse(JSON.stringify(o))
  })

  const content =
    '<div class="prerender-wrap">' +
    '<h1>' + esc(w.title) + '</h1>' +
    '<p class="desc">' + esc(w.copyright || '') + '</p>' +
    '<img src="' + esc(w.url) + '" alt="' + esc(w.title) + '">' +
    '<p class="meta">发布日期：' + esc(w.datetime || '') + (name ? ' &nbsp;·&nbsp; 地区：' + esc(name) : '') + '</p>' +
    '<a class="btn" href="' + esc(w.url) + '" rel="noopener">查看原图</a>' +
    '<a class="btn gray" href="/">返回首页</a>' +
    '</div>'

  const title = w.title + (name ? ' - ' + name + '必应壁纸' : '') + ' | ' + SITE_NAME

  return renderPage(base, {
    title,
    description: desc,
    url,
    image: w.url,
    jsonld,
    content
  })
}

// ---------- 地区页 ----------
function renderRegion(base, code, name) {
  const url = SITE_URL + '/region/' + code + '.html'
  const desc = name + '必应壁纸下载，提供微软必应' + name + '地区每日高清壁纸，支持4K、1920x1080等多种分辨率，免费下载高清电脑壁纸。'
  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: name + '必应壁纸 - ' + SITE_NAME,
    description: desc,
    url: url,
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL + '/' }
  }
  const content =
    '<div class="prerender-wrap">' +
    '<h1>' + esc(name) + '必应壁纸 - 微软必应每日高清壁纸下载</h1>' +
    '<p class="desc">' + esc(desc) + '</p>' +
    '<a class="btn" href="/">返回首页</a>' +
    '</div>'

  return renderPage(base, {
    title: name + '必应壁纸 - ' + name + '地区每日高清壁纸下载 | ' + SITE_NAME,
    description: desc,
    keywords: name + '必应壁纸,' + name + '壁纸,必应壁纸,高清壁纸下载',
    url,
    jsonld,
    content
  })
}

// ---------- 关于页 ----------
function renderAbout(base) {
  const url = SITE_URL + '/about.html'
  const desc = '必应壁纸站点介绍，提供微软必应每日高清壁纸下载，支持多地区、多分辨率浏览与下载。本站所有图片均来自必应搜索，仅供学习和个人使用。'
  const content =
    '<div class="prerender-wrap">' +
    '<h1>关于必应壁纸</h1>' +
    '<p class="desc">一个精美的必应壁纸展示站点，提供丰富的壁纸浏览、筛选和下载功能。</p>' +
    '<a class="btn" href="/">返回首页</a>' +
    '</div>'
  return renderPage(base, {
    title: '关于我们 | ' + SITE_NAME,
    description: desc,
    url,
    content
  })
}

// ---------- 请求层 ----------
async function fetchPage(region, page) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const resp = await axios.get(API, {
        params: { mkt: region, limit: PAGE_SIZE, page, order: 'desc' },
        timeout: 30000,
        headers: { 'User-Agent': 'bing-wallpaper-prerender/1.0 (SEO build)' }
      })
      const body = resp.data
      if (body && body.code === 200) {
        return { total: body.total || 0, items: body.data || [] }
      }
      throw new Error('接口返回 code=' + body.code)
    } catch (e) {
      if (attempt === 2) throw e
      await delay(1000 * (attempt + 1))
    }
  }
}

async function fetchRegion(region) {
  const items = []
  const seen = {}
  let total = Infinity
  let page = 1
  while (items.length < total) {
    const r = await fetchPage(region, page)
    total = r.total
    if (!r.items || r.items.length === 0) break
    for (const w of r.items) {
      // 后端偶发返回重复 id，按 id 去重，保证每个 URL 只生成一个文件
      if (w.id == null || seen[w.id]) continue
      seen[w.id] = true
      items.push(w)
    }
    page++
    if (items.length < total) await delay(30)
  }
  return items
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
  for (const code of Object.keys(REGIONS)) {
    const name = REGIONS[code]
    process.stdout.write(chalk.cyan('  拉取 ' + code + ' (' + name + ') ... '))
    let items
    try {
      items = await fetchRegion(code)
    } catch (e) {
      console.log(chalk.red('失败，跳过：' + e.message))
      continue
    }
    writePage(path.join('region', code + '.html'), renderRegion(base, code, name))
    for (const w of items) {
      writePage(path.join('wallpaper', 'detail', code + '-' + w.id + '.html'), renderDetail(base, w, code, name))
    }
    totalDetail += items.length
    console.log(chalk.green(items.length + ' 张壁纸已生成'))
  }

  return totalDetail
}

module.exports = function prerender() {
  return main().then(totalDetail => {
    console.log(chalk.green('\n  预渲染完成：关于页 1 + 地区页 ' + Object.keys(REGIONS).length +
      ' + 详情页 ' + totalDetail + ' 页\n'))
  })
}