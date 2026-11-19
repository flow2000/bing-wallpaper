<template>
  <div class="amazing-page">
    <!-- 顶部标题栏 -->
    <header class="amazing-header">
      <router-link to="/index.html" class="back-link">
        <i class="el-icon-back"></i>
        <span>{{ $t('amazing.back') }}</span>
      </router-link>
      <div class="header-title">
        <h1 class="title-main">{{ $t('amazing.title') }}</h1>
        <span class="title-sub">{{ $t('amazing.subtitle') }}</span>
      </div>
      <span class="header-spacer"></span>
    </header>

    <!-- 主体 -->
    <div class="amazing-body">
      <!-- 3D 地球 -->
      <div class="globe-panel">
        <div ref="globeEl" class="globe-container"></div>

        <!-- 悬停信息条 -->
        <transition name="fade">
          <div class="globe-info" v-if="hoverInfo">{{ hoverInfo }}</div>
        </transition>

        <!-- 加载 / 错误提示 -->
        <div class="globe-overlay" v-if="loading">
          <i class="el-icon-loading loading-icon"></i>
          <span>{{ $t('amazing.loading') }}</span>
        </div>
        <div class="globe-overlay" v-else-if="globeError">
          <i class="el-icon-warning-outline error-icon"></i>
          <span>{{ $t('amazing.globeError') }}</span>
        </div>

        <div class="globe-hint">{{ $t('amazing.hint') }}</div>
      </div>

      <!-- 图片展示 -->
      <div class="gallery-panel">
        <h2 class="gallery-title">
          <i class="el-icon-picture-outline"></i>
          {{ $t('amazing.galleryTitle') }}
          <span class="gallery-count">{{ wallpapers.length }}</span>
          <button class="refresh-btn" :disabled="refreshing" @click="changeBatch">
            <i class="el-icon-refresh" :class="{ 'is-spinning': refreshing }"></i>
            <span>{{ $t('amazing.refresh') }}</span>
          </button>
        </h2>

        <div class="gallery-grid" v-if="wallpapers.length > 0">
          <div
            v-for="item in wallpapers"
            :key="item.id + '-' + item.mkt"
            class="gallery-card"
            :class="{ active: activeCardId === item.id + '-' + item.mkt }"
            :data-id="item.id + '-' + item.mkt"
            @mouseleave="clearFocus"
          >
            <div class="card-img-wrap" @click="focusLocation(item)">
              <img :src="previewUrl(item)" :alt="item.title" loading="lazy" class="card-img">
              <div class="card-loc-tag">
                <i class="el-icon-location-outline"></i>
                {{ item.placeName }}
              </div>
            </div>
            <div class="card-info" @click="goDetail(item)">
              <div class="card-title">{{ item.title }}</div>
              <div class="card-date">{{ item.datetime }}</div>
            </div>
          </div>
        </div>

        <div class="gallery-empty" v-else-if="!loading">
          <i class="el-icon-warning-outline"></i>
          <span>{{ error || $t('amazing.loadError') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { geocode } from './geonames'

const REGIONS = ['zh-CN', 'en-US', 'ja-JP', 'de-DE', 'fr-FR', 'it-IT', 'en-GB', 'en-CA', 'en-IN']

// 访问者 IP 国家 -> 对应必应市场，未收录的国家回退到界面语言
const COUNTRY_MKT = {
  CN: 'zh-CN',
  US: 'en-US',
  JP: 'ja-JP',
  DE: 'de-DE',
  FR: 'fr-FR',
  IT: 'it-IT',
  GB: 'en-GB',
  CA: 'en-CA',
  IN: 'en-IN'
}

const PAGE_SIZE = 100

const THREE_SRC = 'https://registry.npmmirror.com/three/0.128.0/files/build/three.min.js'
const GLOBE_SRC = 'https://unpkg.com/globe.gl@2.27.3/dist/globe.gl.min.js'
const GLOBE_IMG = 'https://registry.npmmirror.com/three-globe/latest/files/example/img/earth-blue-marble.jpg'
const GLOBE_BUMP = 'https://registry.npmmirror.com/three-globe/latest/files/example/img/earth-topology.png'

export default {
  name: 'AmazingIndex',
  data() {
    return {
      loading: true,
      error: '',
      globeError: false,
      wallpapers: [],
      points: [],
      hoverInfo: '',
      activeCardId: null,
      globe: null,
      refreshing: false,
      maxPage: 1,
      market: ''
    }
  },
  mounted() {
    this.init()
  },
  beforeDestroy() {
    this.destroyGlobe()
  },
  methods: {
    destroyGlobe() {
      if (this._resumeTimer) {
        clearTimeout(this._resumeTimer)
        this._resumeTimer = null
      }
      if (this._resizeGlobe) {
        window.removeEventListener('resize', this._resizeGlobe)
        this._resizeGlobe = null
      }
      if (this.globe) {
        try {
          if (this.globe._destructor) this.globe._destructor()
        } catch (e) {
          // ignore
        }
        this.globe = null
      }
    },

    pauseRotation() {
      if (this._resumeTimer) {
        clearTimeout(this._resumeTimer)
        this._resumeTimer = null
      }
      if (this.globe) {
        this.globe.controls().autoRotate = false
      }
    },

    resumeRotation() {
      if (this._resumeTimer) clearTimeout(this._resumeTimer)
      this._resumeTimer = setTimeout(() => {
        if (this.globe) {
          this.globe.controls().autoRotate = true
        }
        this._resumeTimer = null
      }, 500)
    },

    async init() {
      this.loading = true
      this.error = ''
      try {
        const dataPromise = this.fetchData()
        const libPromise = this.loadGlobeLibs()

        const data = await dataPromise
        this.wallpapers = data
        this.buildPoints()

        try {
          await libPromise
          this.$nextTick(() => this.initGlobe())
        } catch (e) {
          this.globeError = true
        }
      } catch (e) {
        this.error = e.message || this.$t('amazing.loadError')
      } finally {
        this.loading = false
      }
    },

    loadScript(src) {
      return new Promise((resolve, reject) => {
        if (document.querySelector('script[src="' + src + '"]')) {
          return resolve()
        }
        const s = document.createElement('script')
        s.src = src
        s.async = true
        s.onload = () => resolve()
        s.onerror = () => reject(new Error('加载脚本失败: ' + src))
        document.head.appendChild(s)
      })
    },

    loadGlobeLibs() {
      if (window.Globe) return Promise.resolve()
      return this.loadScript(THREE_SRC).then(() => {
        if (window.Globe) return
        return this.loadScript(GLOBE_SRC)
      })
    },

    // 通过 Cloudflare 边缘的 /cdn-cgi/trace 获取访问者 IP 所在国家；
    // 非 Cloudflare 环境（如本地或其它托管）取不到国家时回退到界面语言
    async resolveMarket() {
      if (this.market) return this.market
      let country = ''
      try {
        const resp = await this.$axios.get('/cdn-cgi/trace', { timeout: 3000 })
        const match = /(?:^|\n)loc=([A-Z]{2})\b/.exec(String(resp.data))
        if (match) country = match[1]
      } catch (e) {
        // 忽略，走语言回退
      }
      const locale = this.$i18n.locale
      this.market = COUNTRY_MKT[country] || (REGIONS.indexOf(locale) > -1 ? locale : 'en-US')
      return this.market
    },

    async fetchData(page = 1) {
      const mkt = await this.resolveMarket()
      try {
        const resp = await this.$axios.get('https://api.bimg.cc/all', {
          params: { page, limit: PAGE_SIZE, order: 'desc', mkt }
        })
        if (resp.data && resp.data.code === 200) {
          const total = resp.data.total || 0
          this.maxPage = Math.max(1, Math.ceil(total / PAGE_SIZE))
          return (resp.data.data || []).map(item => this.attachGeo(item, mkt))
        }
        return []
      } catch (e) {
        return []
      }
    },

    async changeBatch() {
      if (this.refreshing) return
      this.refreshing = true
      this.error = ''
      try {
        const page = Math.floor(Math.random() * this.maxPage) + 1
        const data = await this.fetchData(page)
        this.wallpapers = data
        this.buildPoints()
        this.activeCardId = null
        this.hoverInfo = ''
        if (this.globe) {
          // globe.gl 更新 pointsData/ringsData 不会移除旧渲染对象，会导致标记累积，
          // 因此销毁后重建实例以彻底刷新标记
          this.destroyGlobe()
          this.$nextTick(() => this.initGlobe())
        }
        this.$nextTick(() => {
          const panel = this.$el.querySelector('.gallery-panel')
          if (panel) panel.scrollTop = 0
        })
      } catch (e) {
        this.error = e.message || this.$t('amazing.loadError')
      } finally {
        this.refreshing = false
      }
    },

    attachGeo(item, mkt) {
      const geo = geocode(item.copyright, mkt)
      return Object.assign({}, item, {
        lat: geo.lat,
        lng: geo.lng,
        placeName: geo.name,
        mkt
      })
    },

    buildPoints() {
      const map = {}
      this.wallpapers.forEach(w => {
        const key = w.lat.toFixed(2) + ',' + w.lng.toFixed(2)
        if (!map[key]) {
          map[key] = { lat: w.lat, lng: w.lng, name: w.placeName, count: 0, items: [] }
        }
        map[key].count++
        map[key].items.push(w)
      })
      this.points = Object.keys(map).map(k => map[k])
    },

    initGlobe() {
      if (!window.Globe || !this.$refs.globeEl) return
      if (this.globe) return

      const Globe = window.Globe
      const el = this.$refs.globeEl
      const globe = Globe({ rendererConfig: { alpha: true, antialias: true } })(el)
        .globeImageUrl(GLOBE_IMG)
        .bumpImageUrl(GLOBE_BUMP)
        .showAtmosphere(true)
        .atmosphereColor('#3d7bff')
        .atmosphereAltitude(0.2)
        .pointsData(this.points)
        .pointLat('lat')
        .pointLng('lng')
        .pointColor(d => (d.count >= 4 ? '#4da3ff' : '#7ec8ff'))
        .pointAltitude(0.04)
        .pointRadius(d => Math.min(0.5, 0.22 + d.count * 0.04))
        .pointResolution(32)
        .ringsData(this.points)
        .ringLat('lat')
        .ringLng('lng')
        .ringColor(() => t => `rgba(110, 168, 255, ${(1 - t) * 0.7})`)
        .ringMaxRadius(3.5)
        .ringPropagationSpeed(1.2)
        .ringRepeatPeriod(1100)
        .ringAltitude(0.02)
        .onPointHover(p => {
          this.hoverInfo = p ? (p.name + ' · ' + p.count + ' ' + this.$t('amazing.unitWallpapers')) : ''
          if (p) {
            this.pauseRotation()
          } else {
            this.resumeRotation()
          }
        })
        .onPointClick(p => {
          if (p) this.focusPoint(p)
        })
        .width(el.clientWidth)
        .height(el.clientHeight)

      const controls = globe.controls()
      controls.autoRotate = true
      controls.autoRotateSpeed = 0.35
      controls.enableDamping = true
      controls.dampingFactor = 0.1
      controls.minDistance = 120
      controls.maxDistance = 480

      globe.pointOfView({ lat: 30, lng: 110, altitude: 2.2 }, 0)

      this._resizeGlobe = () => {
        const el2 = this.$refs.globeEl
        if (!this.globe || !el2) return
        this.globe.width(el2.clientWidth).height(el2.clientHeight)
      }
      window.addEventListener('resize', this._resizeGlobe)

      this.globe = globe
    },

    previewUrl(item) {
      if (!item || !item.url) return ''
      return item.url.replace(/_\d+x\d+|_UHD/, '_400x240')
    },

    focusPoint(p) {
      if (!p) return
      if (this.globe) {
        this.globe.pointOfView({ lat: p.lat, lng: p.lng, altitude: 1.6 }, 1000)
      }
      const first = p.items && p.items[0]
      if (first) {
        this.highlightAndScroll(first)
      }
    },

    focusLocation(item) {
      if (!item) return
      this.activeCardId = item.id + '-' + item.mkt
      const key = item.lat.toFixed(2) + ',' + item.lng.toFixed(2)
      const point = this.points.find(p => (p.lat.toFixed(2) + ',' + p.lng.toFixed(2)) === key)
      this.hoverInfo = point
        ? (point.name + ' · ' + point.count + ' ' + this.$t('amazing.unitWallpapers'))
        : item.placeName
      this.pauseRotation()
      if (this.globe) {
        this.globe.pointOfView({ lat: item.lat, lng: item.lng, altitude: 1.6 }, 1000)
      }
      this.scrollToCard(this.activeCardId)
    },

    clearFocus() {
      this.hoverInfo = ''
      this.resumeRotation()
    },

    goDetail(item) {
      if (!item) return
      window.open('/wallpaper/detail/' + item.mkt + '-' + item.id + '.html', '_blank')
    },

    highlightAndScroll(item) {
      const id = item.id + '-' + item.mkt
      this.activeCardId = id
      this.scrollToCard(id)
    },

    scrollToCard(id) {
      this.$nextTick(() => {
        const el = this.$el.querySelector('[data-id="' + id + '"]')
        if (el && el.scrollIntoView) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      })
    }
  }
}
</script>

<style scoped>
.amazing-page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  background: radial-gradient(ellipse at 50% 35%, #12263f 0%, #0a1628 45%, #04070d 100%);
  color: #e0e6f0;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
}

/* 星空背景 */
.amazing-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  background-image:
    radial-gradient(2px 2px at 12% 18%, rgba(255, 255, 255, 0.95), transparent),
    radial-gradient(1.5px 1.5px at 24% 34%, rgba(255, 255, 255, 0.7), transparent),
    radial-gradient(1px 1px at 38% 12%, rgba(255, 255, 255, 0.85), transparent),
    radial-gradient(2px 2px at 55% 22%, rgba(255, 255, 255, 0.75), transparent),
    radial-gradient(1px 1px at 68% 10%, rgba(255, 255, 255, 0.9), transparent),
    radial-gradient(1.5px 1.5px at 82% 26%, rgba(255, 255, 255, 0.65), transparent),
    radial-gradient(1px 1px at 92% 15%, rgba(255, 255, 255, 0.8), transparent),
    radial-gradient(2px 2px at 8% 55%, rgba(255, 255, 255, 0.7), transparent),
    radial-gradient(1px 1px at 20% 72%, rgba(255, 255, 255, 0.6), transparent),
    radial-gradient(1.5px 1.5px at 33% 60%, rgba(255, 255, 255, 0.85), transparent),
    radial-gradient(1px 1px at 48% 78%, rgba(255, 255, 255, 0.65), transparent),
    radial-gradient(2px 2px at 63% 68%, rgba(255, 255, 255, 0.75), transparent),
    radial-gradient(1px 1px at 78% 55%, rgba(255, 255, 255, 0.6), transparent),
    radial-gradient(1.5px 1.5px at 90% 70%, rgba(255, 255, 255, 0.8), transparent),
    radial-gradient(1px 1px at 15% 88%, rgba(255, 255, 255, 0.65), transparent),
    radial-gradient(2px 2px at 40% 92%, rgba(255, 255, 255, 0.7), transparent),
    radial-gradient(1px 1px at 70% 88%, rgba(255, 255, 255, 0.6), transparent),
    radial-gradient(1.5px 1.5px at 86% 92%, rgba(255, 255, 255, 0.75), transparent),
    radial-gradient(ellipse 80% 55% at 50% 38%, rgba(61, 123, 255, 0.12), transparent),
    radial-gradient(ellipse 45% 35% at 78% 75%, rgba(120, 80, 255, 0.08), transparent);
  animation: twinkle 4.5s ease-in-out infinite;
}

@keyframes twinkle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.amazing-header {
  position: relative;
  z-index: 10;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: linear-gradient(180deg, rgba(4, 7, 13, 0.9) 0%, rgba(4, 7, 13, 0) 100%);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #a9c1e8;
  text-decoration: none;
  font-size: 14px;
  padding: 8px 14px;
  border-radius: 20px;
  border: 1px solid rgba(169, 193, 232, 0.25);
  transition: all 0.3s ease;
  white-space: nowrap;
}

.back-link:hover {
  color: #fff;
  border-color: rgba(169, 193, 232, 0.6);
  background: rgba(169, 193, 232, 0.12);
}

.header-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.title-main {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(90deg, #8ec5ff, #ffffff, #8ec5ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 2px;
}

.title-sub {
  font-size: 12px;
  color: #7f96b5;
  letter-spacing: 3px;
}

.header-spacer {
  width: 90px;
}

.amazing-body {
  position: absolute;
  top: 60px;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
}

/* 地球区域 */
.globe-panel {
  flex: 1.5;
  position: relative;
  min-width: 0;
}

.globe-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.globe-container /deep/ canvas {
  display: block;
}

.globe-info {
  position: absolute;
  top: 18px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(10, 22, 40, 0.85);
  border: 1px solid rgba(142, 197, 255, 0.35);
  color: #dcebff;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  pointer-events: none;
  backdrop-filter: blur(6px);
  white-space: nowrap;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.globe-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #a9c1e8;
  font-size: 14px;
}

.loading-icon {
  font-size: 40px;
  color: #6ea8ff;
  animation: spin 1s linear infinite;
}

.error-icon {
  font-size: 40px;
  color: #ffb74d;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.globe-hint {
  position: absolute;
  bottom: 18px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: #6c86a8;
  letter-spacing: 1px;
  white-space: nowrap;
  pointer-events: none;
}

/* 图片展示区域 */
.gallery-panel {
  flex: 1;
  min-width: 0;
  max-width: 460px;
  overflow-y: auto;
  padding: 22px 20px;
  background: linear-gradient(90deg, rgba(4, 7, 13, 0.35) 0%, rgba(4, 7, 13, 0.05) 100%);
  border-left: 1px solid rgba(142, 197, 255, 0.08);
  box-sizing: border-box;
}

.gallery-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 17px;
  font-weight: 600;
  color: #dcebff;
  margin: 0 0 18px 0;
}

.gallery-title i {
  color: #6ea8ff;
}

.gallery-count {
  font-size: 12px;
  color: #8fb4ff;
  background: rgba(110, 168, 255, 0.15);
  border-radius: 10px;
  padding: 2px 10px;
}

.refresh-btn {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #a9c1e8;
  background: rgba(110, 168, 255, 0.1);
  border: 1px solid rgba(142, 197, 255, 0.25);
  border-radius: 16px;
  padding: 6px 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.refresh-btn:hover:not(:disabled) {
  color: #fff;
  border-color: rgba(142, 197, 255, 0.6);
  background: rgba(110, 168, 255, 0.2);
}

.refresh-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.is-spinning {
  animation: spin 1s linear infinite;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding-bottom: 20px;
}

.gallery-card {
  background: rgba(14, 28, 48, 0.7);
  border: 1px solid rgba(142, 197, 255, 0.12);
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.35s ease;
}

.gallery-card:hover {
  transform: translateY(-4px);
  border-color: rgba(142, 197, 255, 0.5);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.gallery-card.active {
  border-color: #ffd54f;
  box-shadow: 0 0 0 2px rgba(255, 213, 79, 0.5), 0 10px 30px rgba(0, 0, 0, 0.5);
}

.card-img-wrap {
  position: relative;
  width: 100%;
  padding-top: 56.25%;
  overflow: hidden;
  background: #0a1628;
}

.card-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.gallery-card:hover .card-img {
  transform: scale(1.06);
}

.card-loc-tag {
  position: absolute;
  left: 10px;
  bottom: 10px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #fff;
  background: rgba(0, 0, 0, 0.55);
  padding: 4px 10px;
  border-radius: 12px;
  backdrop-filter: blur(4px);
  max-width: calc(100% - 20px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-loc-tag i {
  color: #ffd54f;
}

.card-info {
  padding: 10px 12px;
}

.card-title {
  font-size: 13px;
  color: #e6eefb;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  min-height: 36px;
}

.card-date {
  font-size: 11px;
  color: #7f96b5;
  margin-top: 4px;
}

.gallery-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 0;
  color: #7f96b5;
}

.gallery-empty i {
  font-size: 40px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

/* 响应式 */
@media screen and (max-width: 900px) {
  .amazing-body {
    flex-direction: column;
  }

  .globe-panel {
    flex: none;
    height: 38vh;
  }

  .gallery-panel {
    flex: 1;
    max-width: none;
    border-left: none;
    border-top: 1px solid rgba(142, 197, 255, 0.1);
  }

  .gallery-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .header-spacer {
    display: none;
  }

  .title-main {
    font-size: 18px;
  }
}

@media screen and (max-width: 560px) {
  .amazing-header {
    padding: 0 12px;
  }

  .back-link {
    font-size: 13px;
    padding: 6px 11px;
  }

  .title-main {
    font-size: 17px;
    letter-spacing: 1px;
  }

  .title-sub {
    display: none;
  }

  .globe-panel {
    height: 34vh;
  }

  .gallery-panel {
    padding: 14px 12px;
  }

  .gallery-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .card-title {
    font-size: 13px;
    min-height: 0;
  }

  .globe-info {
    font-size: 12px;
    max-width: 86%;
    white-space: normal;
    text-align: center;
  }

  .globe-hint {
    font-size: 11px;
    width: 92%;
    white-space: normal;
    text-align: center;
    bottom: 10px;
  }
}
</style>
