import i18n from '@/locale'

const SITE_URL = 'https://bimg.cc';

function getSiteName() {
  return i18n.t('seo.siteName')
}

function getDefaultKeywords() {
  return i18n.t('seo.defaultKeywords')
}

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

function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

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

function removeJsonLd(id = 'seo-jsonld') {
  const el = document.getElementById(id);
  if (el) el.remove();
}

export function updateSEO({ title, description, keywords, path, image, type = 'website' }) {
  const siteName = getSiteName()
  const fullTitle = title ? `${title} | ${siteName}` : i18n.t('seo.defaultTitle')
  const url = path ? `${SITE_URL}${path}` : `${SITE_URL}/`;
  const desc = description || i18n.t('seo.defaultDescription');
  const img = image || `${SITE_URL}/static/logo.png`;

  document.title = fullTitle;

  setMeta('name', 'description', desc);
  setMeta('name', 'keywords', keywords || getDefaultKeywords());
  setCanonical(url);

  setMeta('property', 'og:title', fullTitle);
  setMeta('property', 'og:description', desc);
  setMeta('property', 'og:url', url);
  setMeta('property', 'og:type', type);
  setMeta('property', 'og:image', img);
  setMeta('property', 'og:site_name', siteName);

  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:title', fullTitle);
  setMeta('name', 'twitter:description', desc);
  setMeta('name', 'twitter:image', img);
}

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

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: i18n.t('seo.breadcrumbHome'),
        item: `${SITE_URL}/`
      }
    ]
  };

  if (regionName && regionCode) {
    breadcrumb.itemListElement.push({
      '@type': 'ListItem',
      position: 2,
      name: i18n.t('seo.breadcrumbRegion', { name: regionName }),
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

export function setSiteJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: getSiteName(),
    url: `${SITE_URL}/`,
    description: i18n.t('seo.siteJsonLdDesc'),
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };
  setJsonLd(data, 'site-jsonld');
}

export function setRegionJsonLd(regionName, regionCode) {
  const url = `${SITE_URL}/region/${regionCode}.html`;
  const data = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: i18n.t('seo.breadcrumbRegion', { name: regionName }) + ' - ' + getSiteName(),
    description: i18n.t('seo.regionJsonLdDesc', { name: regionName }),
    url: url,
    isPartOf: {
      '@type': 'WebSite',
      name: getSiteName(),
      url: `${SITE_URL}/`
    }
  };
  setJsonLd(data, 'region-jsonld');
}

export { removeJsonLd, SITE_URL };
