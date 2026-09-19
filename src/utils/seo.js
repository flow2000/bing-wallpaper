/**
 * SEO 工具：动态管理页面的 title、description、canonical、OG 标签及结构化数据
 * 用于 Vue SPA 中根据路由/内容实时更新 head 信息，提升搜索引擎收录
 */

const SITE_URL = 'https://www.bimg.cc';
const SITE_NAME = '必应壁纸';
const DEFAULT_KEYWORDS =
  '必应壁纸,bing壁纸,必应每日壁纸,必应高清壁纸下载,微软Bing壁纸,Bing Wallpaper,高清壁纸,电脑壁纸,4K壁纸,壁纸下载';

/**
 * 设置或创建一个 meta 标签
 * @param {string} attr - 属性名 (name 或 property)
 * @param {string} attrValue - 属性值
 * @param {string} content - 内容
 */
function setMeta(attr, attrValue, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${attrValue}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * 设置 canonical 链接
 * @param {string} href
 */
function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * 注入 JSON-LD 结构化数据
 * @param {Object} data - schema.org 数据
 * @param {string} id - script 标签的 id，便于更新/移除
 */
function setJsonLd(data, id = 'seo-jsonld') {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

/**
 * 移除指定 id 的 JSON-LD
 */
function removeJsonLd(id = 'seo-jsonld') {
  const el = document.getElementById(id);
  if (el) el.remove();
}

/**
 * 更新整个页面的 SEO 信息
 * @param {Object} options
 * @param {string} options.title - 页面标题
 * @param {string} options.description - 页面描述
 * @param {string} [options.keywords] - 关键词
 * @param {string} [options.path] - 当前路径，用于生成 canonical/og:url
 * @param {string} [options.image] - 分享图
 * @param {string} [options.type] - og:type，默认 website
 */
export function updateSEO({ title, description, keywords, path, image, type = 'website' }) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | 每天都有不一样的心情 | 各国必应壁纸下载`;
  const url = path ? `${SITE_URL}${path}` : `${SITE_URL}/`;
  const desc = description || '必应壁纸(Bing Wallpaper)下载站，提供微软必应每日高清壁纸，支持多地区、多分辨率浏览与下载。';
  const img = image || `${SITE_URL}/static/logo.png`;

  document.title = fullTitle;

  setMeta('name', 'description', desc);
  setMeta('name', 'keywords', keywords || DEFAULT_KEYWORDS);
  setCanonical(url);

  // Open Graph
  setMeta('property', 'og:title', fullTitle);
  setMeta('property', 'og:description', desc);
  setMeta('property', 'og:url', url);
  setMeta('property', 'og:type', type);
  setMeta('property', 'og:image', img);
  setMeta('property', 'og:site_name', SITE_NAME);

  // Twitter Card
  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:title', fullTitle);
  setMeta('name', 'twitter:description', desc);
  setMeta('name', 'twitter:image', img);
}

/**
 * 设置壁纸详情页的结构化数据 (ImageObject + BreadcrumbList)
 * @param {Object} wallpaper 壁纸数据
 * @param {string} [regionCode] 地区代码，如 'zh-CN'
 * @param {string} [regionName] 地区名称，如 '中国'
 */
export function setWallpaperJsonLd(wallpaper, regionCode, regionName) {
  if (!wallpaper) return;
  const url = `${SITE_URL}/wallpaper/detail/${regionCode || ''}-${wallpaper.id}.html`;
  const image = wallpaper.url;

  const imageObject = {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    name: wallpaper.title,
    description: wallpaper.copyright || wallpaper.title,
    contentUrl: image,
    url: url,
    datePublished: wallpaper.datetime,
    creator: {
      '@type': 'Organization',
      name: 'Microsoft Bing'
    },
    license: 'https://www.bing.com'
  };

  // 添加地区信息（contentLocation）
  if (regionName) {
    imageObject.contentLocation = {
      '@type': 'Place',
      name: regionName
    };
    if (regionCode) {
      imageObject.contentLocation.address = {
        '@type': 'PostalAddress',
        addressCountry: regionCode
      };
    }
  }

  // 面包屑：首页 → [地区] → 壁纸
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: '首页',
        item: `${SITE_URL}/`
      }
    ]
  };

  if (regionName && regionCode) {
    breadcrumb.itemListElement.push({
      '@type': 'ListItem',
      position: 2,
      name: `${regionName}必应壁纸`,
      item: `${SITE_URL}/region/${regionCode}.html`
    });
    breadcrumb.itemListElement.push({
      '@type': 'ListItem',
      position: 3,
      name: wallpaper.title,
      item: url
    });
  } else {
    breadcrumb.itemListElement.push({
      '@type': 'ListItem',
      position: 2,
      name: wallpaper.title,
      item: url
    });
  }

  setJsonLd([imageObject, breadcrumb], 'wallpaper-jsonld');
}

/**
 * 设置网站级结构化数据 (WebSite)
 */
export function setSiteJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    description: '必应壁纸下载站，提供微软必应每日高清壁纸，支持多地区、多分辨率浏览与下载。',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };
  setJsonLd(data, 'site-jsonld');
}

/**
 * 设置地区页面的结构化数据
 * @param {string} regionName
 * @param {string} regionCode
 */
export function setRegionJsonLd(regionName, regionCode) {
  const url = `${SITE_URL}/region/${regionCode}.html`;
  const data = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${regionName}必应壁纸 - ${SITE_NAME}`,
    description: `${regionName}地区的必应每日高清壁纸下载，支持4K、1920x1080等多种分辨率。`,
    url: url,
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: `${SITE_URL}/`
    }
  };
  setJsonLd(data, 'region-jsonld');
}

export { removeJsonLd, SITE_URL, SITE_NAME };
