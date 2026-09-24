import Vue from 'vue'
import VueI18n from 'vue-i18n'
import zhCN from './zh-CN'
import enUS from './en-US'
import jaJP from './ja-JP'
import deDE from './de-DE'
import frFR from './fr-FR'
import itIT from './it-IT'
import enGB from './en-GB'
import enCA from './en-CA'
import enIN from './en-IN'

Vue.use(VueI18n)

const LOCALE_KEY = 'bimg_locale'
const SUPPORTED_LOCALES = [
  'zh-CN', 'en-US', 'ja-JP', 'de-DE',
  'fr-FR', 'it-IT', 'en-GB', 'en-CA', 'en-IN'
]
const DEFAULT_LOCALE = 'zh-CN'

function detectLocale() {
  const saved = localStorage.getItem(LOCALE_KEY)
  if (saved && SUPPORTED_LOCALES.includes(saved)) {
    return saved
  }
  const browser = (navigator.language || navigator.userLanguage || '').toLowerCase()
  if (browser.startsWith('zh')) return 'zh-CN'
  if (browser.startsWith('ja')) return 'ja-JP'
  if (browser.startsWith('de')) return 'de-DE'
  if (browser.startsWith('fr')) return 'fr-FR'
  if (browser.startsWith('it')) return 'it-IT'
  if (browser.startsWith('en-gb') || browser.startsWith('en-uk')) return 'en-GB'
  if (browser.startsWith('en-ca')) return 'en-CA'
  if (browser.startsWith('en-in')) return 'en-IN'
  if (browser.startsWith('en')) return 'en-US'
  return DEFAULT_LOCALE
}

const i18n = new VueI18n({
  locale: detectLocale(),
  fallbackLocale: DEFAULT_LOCALE,
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
    'ja-JP': jaJP,
    'de-DE': deDE,
    'fr-FR': frFR,
    'it-IT': itIT,
    'en-GB': enGB,
    'en-CA': enCA,
    'en-IN': enIN
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
