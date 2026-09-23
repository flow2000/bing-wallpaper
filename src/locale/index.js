import Vue from 'vue'
import VueI18n from 'vue-i18n'
import zhCN from './zh-CN'
import enUS from './en-US'

Vue.use(VueI18n)

const LOCALE_KEY = 'bimg_locale'
const SUPPORTED_LOCALES = ['zh-CN', 'en-US']
const DEFAULT_LOCALE = 'zh-CN'

function detectLocale() {
  const saved = localStorage.getItem(LOCALE_KEY)
  if (saved && SUPPORTED_LOCALES.includes(saved)) {
    return saved
  }
  const browser = (navigator.language || navigator.userLanguage || '').toLowerCase()
  if (browser.startsWith('zh')) {
    return 'zh-CN'
  }
  if (browser.startsWith('en')) {
    return 'en-US'
  }
  return DEFAULT_LOCALE
}

const i18n = new VueI18n({
  locale: detectLocale(),
  fallbackLocale: DEFAULT_LOCALE,
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS
  },
  silentTranslationWarn: true
})

export function setLocale(locale) {
  if (!SUPPORTED_LOCALES.includes(locale)) return
  i18n.locale = locale
  localStorage.setItem(LOCALE_KEY, locale)
  document.documentElement.lang = locale
}

export function getLocale() {
  return i18n.locale
}

export { SUPPORTED_LOCALES, DEFAULT_LOCALE }

export default i18n
