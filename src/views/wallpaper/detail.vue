<template>
  <div class="detail-root" :class="{ 'fullscreen-mode': fullscreenMode }" :style="{ backgroundImage: wallpaperData ? `url(${currentImageUrl})` : 'none' }">
    <!-- 全屏壁纸浮层 -->
    <div class="fullscreen-overlay" v-if="fullscreenMode" @click="toggleFullscreen"></div>

    <div class="detail-container">
    <!-- 壁纸详情展示 -->
    <el-card class="wallpaper-detail-card" shadow="hover" v-if="wallpaperData">
      <div class="detail-content">
        <!-- 壁纸图片展示区域 -->
        <div class="image-showcase">
          <div class="image-wrapper" @click="toggleFullscreen" :title="wallpaperData.title + (wallpaperData.copyright ? '——' + wallpaperData.copyright : '')">
            <el-image
              :src="currentImageUrl"
              :alt="wallpaperData.title"
              fit="contain"
              class="detail-image"
              :key="currentImageUrl"
            >
              <div slot="placeholder" class="image-placeholder">
                <i class="el-icon-loading"></i>
                <span>{{ $t('detail.loadingImage') }}</span>
              </div>
              <div slot="error" class="image-error">
                <i class="el-icon-picture-outline"></i>
                <span>{{ $t('detail.imageLoadFailed') }}</span>
              </div>
            </el-image>
          </div>

          <!-- 图片操作按钮 -->
          <div class="image-actions">
            <el-button-group>
              <el-button
                type="primary"
                icon="el-icon-zoom-in"
                @click="openOriginalImage"
              >
                {{ $t('detail.viewOriginal') }}
              </el-button>
              <el-button
                type="danger"
                icon="el-icon-s-home"
                @click="$router.push('/index.html')"
              >
                {{ $t('detail.backHome') }}
              </el-button>
              <el-button
                type="success"
                icon="el-icon-download"
                @click="downloadWallpaper"
              >
                {{ $t('detail.downloadWallpaper') }}
              </el-button>
              <el-button
                type="warning"
                icon="el-icon-link"
                @click="copyImageUrl"
              >
                {{ $t('detail.copyLink') }}
              </el-button>
            </el-button-group>
            <el-tooltip :content="$t('detail.fullscreenTooltip')" placement="top" :open-delay="300">
              <el-button
                type="info"
                icon="el-icon-full-screen"
                @click="toggleFullscreen"
                class="fullscreen-btn"
              >
                {{ $t('detail.viewFullscreen') }}
              </el-button>
            </el-tooltip>
          </div>
        </div>
        
        <!-- 壁纸信息面板 -->
        <div class="info-panel">
          <!-- 标题 -->
          <div class="info-section">
            <h1 class="wallpaper-title">{{ wallpaperData.title }}</h1>
          </div>

          <!-- 图片介绍 -->
          <div class="info-section">
            <div class="info-item">
              <span class="info-label">
                <i class="el-icon-document"></i>
                {{ $t('detail.imageDescription') }}
              </span>
              <span class="info-value">{{ imageDescription }}</span>
            </div>
            <div class="copyright-links">
              <a
                v-if="wallpaperData.copyrightlink"
                :href="wallpaperData.copyrightlink"
                target="_blank"
                rel="noopener noreferrer"
                class="copyright-link"
              >
                <i class="el-icon-link"></i>
                {{ $t('detail.viewSource') }}
              </a>
              <a
                :href="wallpaperData.url"
                target="_blank"
                rel="noopener noreferrer"
                class="copyright-link"
              >
                <i class="el-icon-picture-outline"></i>
                {{ $t('detail.openOriginal') }}
              </a>
            </div>
          </div>

          <!-- 版权与日期 -->
          <div class="info-section">
            <div class="info-item">
              <span class="info-label">
                <i class="el-icon-document"></i>
                {{ $t('detail.copyrightInfo') }}
              </span>
              <span class="info-value">{{ copyrightInfo }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">
                <i class="el-icon-date"></i>
                {{ $t('detail.publishDate') }}
              </span>
              <span class="info-value">{{ wallpaperData.datetime }}</span>
            </div>
          </div>

          <!-- 分辨率选择 -->
          <div class="info-section">
            <h3 class="section-title">{{ $t('detail.switchResolution') }}</h3>
            <div class="resolution-grid">
              <el-button
                v-for="res in resolutions"
                :key="res"
                :type="currentResolution === res ? 'primary' : 'default'"
                :class="['resolution-btn', { 'is-active': currentResolution === res }]"
                @click="changeResolution(res)"
                size="small"
              >
                {{ res }}
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 推荐壁纸 -->
    <div class="recommend-section" v-if="wallpaperData && recommendList.length > 0">
      <h2 class="recommend-title">
        <i class="el-icon-magic-stick"></i>
        {{ $t('detail.recommended') }}
      </h2>
      <el-row :gutter="20">
        <el-col
          v-for="item in recommendList"
          :key="item.id"
          :xs="12" :sm="8" :md="6" :lg="4"
          class="recommend-col"
        >
          <router-link
            :to="`/wallpaper/detail/${regionCode}-${item.id}.html`"
            class="recommend-card"
            target="_blank"
          >
            <div class="recommend-img-wrapper">
              <el-image
                :src="item.url.replace(/_\d+x\d+|_UHD/, '_400x240')"
                :alt="item.title"
                fit="cover"
                class="recommend-img"
              >
                <div slot="error" class="recommend-img-error">
                  <i class="el-icon-picture-outline"></i>
                </div>
              </el-image>
            </div>
            <div class="recommend-info">
              <p class="recommend-name">{{ item.title }}</p>
              <span class="recommend-date">{{ item.datetime }}</span>
            </div>
          </router-link>
        </el-col>
      </el-row>
    </div>

    <!-- 加载状态 -->
    <div v-else-if="loading" class="loading-container">
      <el-card class="loading-card">
        <div class="loading-content">
          <i class="el-icon-loading loading-icon"></i>
          <h1 class="loading-text">{{ $t('detail.loadingDetail') }}</h1>
        </div>
      </el-card>
    </div>
    
    <!-- 错误状态 -->
    <div v-else class="error-container">
      <el-card class="error-card">
        <div class="error-content">
          <i class="el-icon-warning-outline error-icon"></i>
          <h1 class="error-title">{{ $t('detail.loadFailed') }}</h1>
          <p class="error-message">{{ errorMessage }}</p>
          <el-button type="primary" @click="retryLoad">{{ $t('detail.reload') }}</el-button>
        </div>
      </el-card>
    </div>
    </div>
  </div>
</template>

<script>
import { updateSEO, setWallpaperJsonLd } from '@/utils/seo'

const REGION_KEY_MAP = {
  'zh-CN': 'common.regionChina',
  'de-DE': 'common.regionGermany',
  'en-CA': 'common.regionCanada',
  'en-GB': 'common.regionUK',
  'en-IN': 'common.regionIndia',
  'en-US': 'common.regionUS',
  'fr-FR': 'common.regionFrance',
  'it-IT': 'common.regionItaly',
  'ja-JP': 'common.regionJapan'
}

export default {
  name: 'WallpaperDetail',
  data() {
    return {
      wallpaperData: null,
      
      loading: true,
      
      errorMessage: '',
      
      currentResolution: '1920x1080',
      
      regionCode: '',
      regionName: '',
      
      resolutions: [
        'UHD',
        '1920x1200',
        '1920x1080',
        '1080x1920',
        '1366x768',
        '1280x768',
        '1024x768',
        '800x600',
        '800x480',
        '768x1280',
        '720x1280',
        '640x480',
        '480x800',
        '400x240',
        '320x240',
        '240x320'
      ],

      recommendList: [],
      recommendLoading: false,

      fullscreenMode: false
    };
  },
  
  computed: {
    currentImageUrl() {
      if (!this.wallpaperData) return '';

      if (this.currentResolution === 'UHD') {
        return this.wallpaperData.url.replace(/_\d+x\d+/, '_UHD');
      }
      return this.wallpaperData.url.replace(
        /_\d+x\d+|_UHD/,
        `_${this.currentResolution}`
      );
    },
    
    regionListUrl() {
      if (!this.regionCode) return '/';
      return `/region/${this.regionCode}.html`;
    },

    imageDescription() {
      if (!this.wallpaperData || !this.wallpaperData.copyright) return '';
      return this.wallpaperData.copyright.replace(/\s*\(©[^)]*\)\s*$/, '').trim();
    },

    copyrightInfo() {
      if (!this.wallpaperData || !this.wallpaperData.copyright) return '';
      const match = this.wallpaperData.copyright.match(/\(©[^)]*\)/);
      return match ? match[0] : '';
    }
  },
  
  mounted() {
    this.loadWallpaperDetail();
    window.scrollTo(0, 0);
  },

  watch: {
    '$route.params.regionId'(newVal, oldVal) {
      if (newVal && newVal !== oldVal) {
        this.recommendList = [];
        this.loadWallpaperDetail();
        window.scrollTo(0, 0);
      }
    }
  },

  methods: {
    getRegionName(code) {
      const key = REGION_KEY_MAP[code]
      return key ? this.$t(key) : ''
    },

    toggleFullscreen() {
      this.fullscreenMode = !this.fullscreenMode;
    },

    async loadWallpaperDetail() {
      this.loading = true;
      this.errorMessage = '';

      const regionId = (this.$route.params.regionId || '').replace(/\.html$/, '');
      const match = regionId.match(/^(.+)-(\d+)$/);
      if (!match) {
        this.errorMessage = this.$t('detail.missingId');
        this.loading = false;
        return;
      }

      const region = match[1];
      const wallpaperId = match[2];
      const targetId = Number(wallpaperId);

      try {
        const buildParams = (page) => {
          const p = { page, limit: 1, order: 'desc' };
          if (region) p.mkt = region;
          return p;
        };

        const firstResp = await this.$axios.get('https://api.bimg.cc/all', {
          params: buildParams(1)
        });

        if (!firstResp.data || firstResp.data.code !== 200) {
          throw new Error((firstResp.data && firstResp.data.msg) || this.$t('detail.fetchDetailFailed'));
        }

        const total = firstResp.data.total || 0;
        const firstItem = (firstResp.data.data || [])[0];

        if (firstItem && String(firstItem.id) === String(wallpaperId)) {
          this.setWallpaperData(firstItem);
          return;
        }

        const position = total - targetId + 1;
        if (position < 1 || position > total) {
          this.errorMessage = this.$t('detail.notFound');
          return;
        }

        const resp = await this.$axios.get('https://api.bimg.cc/all', {
          params: buildParams(position)
        });

        if (resp.data && resp.data.code === 200) {
          const item = (resp.data.data || [])[0];
          if (item && String(item.id) === String(wallpaperId)) {
            this.setWallpaperData(item);
            return;
          }

          for (const offset of [-1, 1, -2, 2]) {
            const p = position + offset;
            if (p < 1 || p > total) continue;
            const adjResp = await this.$axios.get('https://api.bimg.cc/all', {
              params: buildParams(p)
            });
            if (adjResp.data && adjResp.data.code === 200) {
              const adjItem = (adjResp.data.data || [])[0];
              if (adjItem && String(adjItem.id) === String(wallpaperId)) {
                this.setWallpaperData(adjItem);
                return;
              }
            }
          }

          this.errorMessage = this.$t('detail.notFound');
        } else {
          this.errorMessage = this.$t('detail.fetchDetailFailed');
        }
      } catch (error) {
        console.error('Load wallpaper detail failed:', error);
        this.errorMessage = error.message || this.$t('detail.networkError');
      } finally {
        this.loading = false;
      }
    },

    setWallpaperData(wallpaper) {
      this.wallpaperData = wallpaper;
      if (wallpaper.url) {
        if (/_UHD/.test(wallpaper.url)) {
          this.currentResolution = 'UHD';
        } else {
          const match = wallpaper.url.match(/(\d+)x(\d+)/);
          if (match) {
            this.currentResolution = `${match[1]}x${match[2]}`;
          }
        }
      }
      this.resolveRegion(wallpaper);
      this.applyDetailSEO(wallpaper);
      this.fetchRecommendations();
    },

    async fetchRecommendations() {
      if (!this.wallpaperData) return;
      this.recommendLoading = true;
      try {
        const regionId = (this.$route.params.regionId || '').replace(/\.html$/, '');
        const match = regionId.match(/^(.+)-(\d+)$/);
        if (!match) return;
        const region = match[1];
        const currentId = Number(match[2]);

        const resp = await this.$axios.get('https://api.bimg.cc/all', {
          params: { page: 1, limit: 8, order: 'desc', mkt: region }
        });
        if (resp.data && resp.data.code === 200) {
          this.recommendList = (resp.data.data || [])
            .filter(w => w.id !== currentId)
            .slice(0, 6);
        }
      } catch (error) {
        console.error('Fetch recommendations failed:', error);
      } finally {
        this.recommendLoading = false;
      }
    },

    resolveRegion(wallpaper) {
      const regionId = (this.$route.params.regionId || '').replace(/\.html$/, '');
      const match = regionId.match(/^(.+)-\d+$/);
      let code = match ? match[1] : '';
      if (!code && wallpaper.url) {
        const match = wallpaper.url.match(/_([A-Z]{2}-[A-Z]{2})\d+/);
        if (match) {
          const parts = match[1].split('-');
          code = `${parts[0].toLowerCase()}-${parts[1].toUpperCase()}`;
        }
      }
      if (code) {
        const lowerKey = code.toLowerCase();
        const foundKey = Object.keys(REGION_KEY_MAP).find(k => k.toLowerCase() === lowerKey);
        if (foundKey) {
          this.regionCode = foundKey;
          this.regionName = this.getRegionName(foundKey);
          return;
        }
      }
      this.regionCode = '';
      this.regionName = '';
    },
    
    retryLoad() {
      this.loadWallpaperDetail();
    },

    applyDetailSEO(wallpaper) {
      if (!wallpaper) return;
      const regionPart = this.regionName ? this.$t('seo.detailSeoTitle', { title: '', region: this.regionName }).replace(/^ - /, '') + '，' : '';
      const title = this.$t('seo.detailSeoTitle', { title: wallpaper.title, region: this.regionName ? this.regionName + '必应壁纸' : '必应壁纸' })
      const regionText = this.regionName ? this.$i18n.locale === 'zh-CN' ? `，来自${this.regionName}地区` : `, from ${this.regionName}` : ''
      const description = this.$t('seo.detailSeoDesc', {
        title: wallpaper.title,
        copyright: wallpaper.copyright || '',
        date: wallpaper.datetime,
        region: regionText
      })
      const keywords = this.regionName
        ? this.$t('seo.detailSeoKeywords', {
            title: wallpaper.title,
            region: this.regionName,
            date: wallpaper.datetime
          })
        : this.$t('seo.detailSeoKeywordsNoRegion', {
            title: wallpaper.title,
            date: wallpaper.datetime
          })
      updateSEO({
        title,
        description,
        path: `/wallpaper/detail/${this.regionCode}-${wallpaper.id}.html`,
        image: wallpaper.url,
        type: 'article',
        keywords
      });
      setWallpaperJsonLd(wallpaper, this.regionCode, this.regionName);
    },

    changeResolution(resolution) {
      this.currentResolution = resolution;
      this.showMessage(this.$t('detail.resolutionSwitched', { resolution }), 'success');
    },
    
    openOriginalImage() {
      if (this.wallpaperData) {
        window.open(this.wallpaperData.url, '_blank');
      }
    },
    
    downloadWallpaper() {
      if (!this.wallpaperData) return;
      
      const link = document.createElement('a');
      link.href = this.currentImageUrl;
      link.download = `bing-wallpaper-${this.wallpaperData.datetime}-${this.wallpaperData.id}.jpg`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      this.showMessage(this.$t('detail.startDownload'), 'success');
    },
    
    copyImageUrl() {
      if (!this.wallpaperData) return;
      this.copyToClipboard(this.currentImageUrl, this.$t('detail.linkCopied'));
    },
    
    setAsDesktopBackground() {
      this.showMessage(this.$t('detail.setDesktopHint'), 'info');
    },
    
    addToFavorites() {
      const favorites = JSON.parse(localStorage.getItem('wallpaperFavorites') || '[]');
      
      if (this.wallpaperData) {
        const exists = favorites.some(item => item.id === this.wallpaperData.id);
        
        if (exists) {
          this.showMessage(this.$t('detail.alreadyFavorited'), 'warning');
        } else {
          favorites.push({
            ...this.wallpaperData,
            addTime: new Date().toISOString()
          });
          localStorage.setItem('wallpaperFavorites', JSON.stringify(favorites));
          this.showMessage(this.$t('detail.favoriteSuccess'), 'success');
        }
      }
    },
    
    shareToSocial(platform) {
      if (!this.wallpaperData) return;
      
      const shareUrl = encodeURIComponent(window.location.href);
      const shareTitle = encodeURIComponent(this.$t('detail.sharePrefix') + this.wallpaperData.title);
      const shareContent = encodeURIComponent(this.wallpaperData.copyright);
      
      let url = '';
      
      switch (platform) {
        case 'wechat':
          this.showMessage(this.$t('detail.wechatShareHint'), 'info');
          return;
        case 'weibo':
          url = `https://service.weibo.com/share/share.php?url=${shareUrl}&title=${shareTitle}&pic=${encodeURIComponent(this.currentImageUrl)}`;
          window.open(url, '_blank');
          break;
        default:
          this.copyShareLink();
          return;
      }
    },
    
    copyShareLink() {
      if (!this.wallpaperData) return;
      const shareUrl = `${window.location.origin}/wallpaper/detail/${this.regionCode}-${this.wallpaperData.id}.html`;
      this.copyToClipboard(shareUrl, this.$t('detail.shareLinkCopied'));
    },

    copyToClipboard(text, successMsg) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          this.showMessage(successMsg, 'success');
        }).catch(() => {
          this.fallbackCopy(text, successMsg);
        });
      } else {
        this.fallbackCopy(text, successMsg);
      }
    },

    fallbackCopy(text, successMsg) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        const ok = document.execCommand('copy');
        this.showMessage(ok ? successMsg : this.$t('detail.copyFailedManual'), ok ? 'success' : 'warning');
      } catch (err) {
        this.showMessage(this.$t('detail.copyFailedManual'), 'warning');
      }
      document.body.removeChild(textarea);
    },
    
    showMessage(text, type = 'success') {
      if (this.$message) {
        this.$message({ message: text, type, showClose: false, duration: 3000 });
      }
    }
  }
};
</script>

<style scoped>
.detail-root {
  min-height: 100vh;
  background-attachment: fixed;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  transition: background-image 0.5s ease;
}

.detail-root.fullscreen-mode .detail-container {
  display: none;
}

.detail-root.fullscreen-mode {
  background-color: #000;
  background-size: contain;
  background-attachment: scroll;
}

.fullscreen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  cursor: pointer;
}

.detail-container {
  max-width: 1500px;
  margin: 0 auto;
  padding: 30px;
}

.wallpaper-detail-card {
  border-radius: 14px;
  overflow: hidden;
}

.wallpaper-detail-card .el-card__body {
  padding: 32px;
}

.detail-content {
  display: flex;
  gap: 36px;
  align-items: flex-start;
}

.image-showcase {
  flex: 1;
  min-width: 0;
}

.image-wrapper {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
  cursor: pointer;
}

.detail-image {
  width: 100%;
  min-height: 420px;
  max-height: 650px;
  display: block;
}

.image-placeholder,
.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 420px;
  color: #909399;
  font-size: 18px;
}

.image-placeholder i,
.image-error i {
  font-size: 52px;
  margin-bottom: 18px;
}

.image-error {
  color: #f56c6c;
}

.image-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.image-actions .el-button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
}

.image-actions .el-button {
  font-size: 15px;
  padding: 12px 24px;
}

.info-panel {
  width: 380px;
  flex-shrink: 0;
}

.info-section {
  margin-bottom: 28px;
  padding-bottom: 28px;
  border-bottom: 1px solid #ebeef5;
}

.info-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.wallpaper-title {
  font-size: 26px;
  font-weight: 700;
  color: #303133;
  line-height: 1.4;
  margin: 0;
}

.info-item {
  display: flex;
  align-items: baseline;
  gap: 16px;
  padding: 12px 0;
}

.info-item + .info-item {
  border-top: 1px dashed #ebeef5;
}

.info-label {
  flex: 0 0 92px;
  color: #909399;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-label i {
  font-size: 16px;
}

.info-value {
  flex: 1;
  color: #606266;
  font-size: 15px;
  line-height: 1.7;
}

.section-title {
  font-size: 17px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 18px 0;
  padding-left: 12px;
  border-left: 4px solid #409eff;
}

.copyright-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #409eff;
  text-decoration: none;
  font-size: 15px;
  transition: color 0.3s ease;
}

.copyright-link:hover {
  color: #66b1ff;
}

.copyright-links {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
  padding-left: 108px;
  padding-top: 10px;
}

.resolution-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.resolution-btn {
  width: 96px;
  flex: 0 0 auto;
  text-align: center;
  margin: 0 !important;
}

.resolution-btn.is-active {
  background: #409eff;
  color: #fff;
  border-color: #409eff;
}

.loading-container,
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.loading-card,
.error-card {
  width: 400px;
  text-align: center;
  border-radius: 12px;
}

.loading-content,
.error-content {
  padding: 40px 20px;
}

.loading-icon {
  font-size: 48px;
  color: #409eff;
  margin-bottom: 16px;
}

.loading-text {
  color: #606266;
  font-size: 16px;
}

.error-icon {
  font-size: 64px;
  color: #f56c6c;
  margin-bottom: 16px;
}

.error-title {
  font-size: 20px;
  color: #303133;
  margin: 0 0 12px 0;
}

.error-message {
  color: #909399;
  font-size: 14px;
  margin: 0 0 20px 0;
}

.recommend-section {
  margin-top: 36px;
}

.recommend-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 20px 0;
  padding-left: 12px;
  border-left: 4px solid #409eff;
  display: flex;
  align-items: center;
  gap: 8px;
}

.recommend-title i {
  color: #409eff;
}

.recommend-col {
  margin-bottom: 20px;
}

.recommend-card {
  display: block;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;
}

.recommend-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.recommend-img-wrapper {
  width: 100%;
  padding-top: 56.25%;
  position: relative;
  overflow: hidden;
  background: #f5f7fa;
}

.recommend-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: transform 0.4s ease;
}

.recommend-card:hover .recommend-img {
  transform: scale(1.06);
}

.recommend-img-error {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #c0c4cc;
  font-size: 32px;
}

.recommend-info {
  padding: 12px 14px;
}

.recommend-name {
  font-size: 14px;
  color: #303133;
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.recommend-date {
  font-size: 13px;
  color: #909399;
}

@media screen and (max-width: 1024px) {
  .detail-content {
    flex-direction: column;
  }

  .info-panel {
    width: 100%;
  }

  .image-wrapper {
    min-height: 300px;
  }
}

@media screen and (max-width: 768px) {
  .detail-root {
    background-attachment: scroll;
  }

  .detail-container {
    padding: 12px;
  }

  .wallpaper-detail-card .el-card__body {
    padding: 16px;
  }

  .detail-content {
    gap: 20px;
  }

  .detail-image {
    min-height: 280px;
    max-height: 450px;
  }

  .image-placeholder,
  .image-error {
    height: 280px;
    font-size: 15px;
  }

  .image-placeholder i,
  .image-error i {
    font-size: 42px;
    margin-bottom: 12px;
  }

  .wallpaper-title {
    font-size: 20px;
  }

  .image-actions {
    flex-direction: column;
    gap: 8px;
  }

  .image-actions .el-button-group {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    gap: 0;
  }

  .image-actions .el-button {
    font-size: 13px;
    padding: 10px 16px;
    flex: 1;
    min-width: 0;
  }

  .image-actions .el-button span {
    display: inline;
  }

  .fullscreen-btn {
    width: 100%;
  }

  .resolution-grid {
    justify-content: flex-start;
    gap: 8px;
  }

  .resolution-btn {
    width: 84px;
    font-size: 12px;
  }

  .info-panel {
    width: 100%;
  }

  .info-section {
    margin-bottom: 20px;
    padding-bottom: 20px;
  }

  .info-item {
    flex-direction: column;
    gap: 6px;
    padding: 10px 0;
  }

  .info-label {
    flex: 0 0 auto;
    font-size: 13px;
  }

  .info-value {
    font-size: 14px;
  }

  .copyright-links {
    padding-left: 0;
    padding-top: 8px;
    gap: 12px;
  }

  .copyright-link {
    font-size: 13px;
  }

  .section-title {
    font-size: 15px;
    margin-bottom: 14px;
  }

  .recommend-section {
    margin-top: 24px;
  }

  .recommend-title {
    font-size: 17px;
    margin-bottom: 16px;
  }

  .loading-container,
  .error-container {
    min-height: 300px;
  }

  .loading-card,
  .error-card {
    width: 90%;
    max-width: 320px;
  }

  .loading-content,
  .error-content {
    padding: 30px 16px;
  }
}

@media screen and (max-width: 480px) {
  .detail-container {
    padding: 8px;
  }

  .wallpaper-detail-card .el-card__body {
    padding: 12px;
  }

  .detail-content {
    gap: 16px;
  }

  .image-wrapper {
    min-height: 200px;
    margin-bottom: 12px;
  }

  .detail-image {
    min-height: 200px;
    max-height: 350px;
  }

  .image-placeholder,
  .image-error {
    height: 200px;
    font-size: 14px;
  }

  .image-placeholder i,
  .image-error i {
    font-size: 36px;
    margin-bottom: 10px;
  }

  .wallpaper-title {
    font-size: 18px;
  }

  .image-actions .el-button {
    font-size: 12px;
    padding: 8px 10px;
  }

  .image-actions .el-button-group {
    flex-direction: column;
    gap: 6px;
  }

  .image-actions .el-button-group .el-button {
    width: 100%;
  }

  .resolution-btn {
    width: 72px;
    font-size: 11px;
    padding: 7px 4px !important;
  }

  .info-section {
    margin-bottom: 16px;
    padding-bottom: 16px;
  }

  .info-label {
    font-size: 12px;
  }

  .info-value {
    font-size: 13px;
  }

  .section-title {
    font-size: 14px;
    margin-bottom: 12px;
  }

  .recommend-col {
    margin-bottom: 12px;
  }

  .recommend-info {
    padding: 8px 10px;
  }

  .recommend-name {
    font-size: 12px;
  }

  .recommend-date {
    font-size: 11px;
  }

  .loading-content,
  .error-content {
    padding: 24px 12px;
  }

  .loading-icon {
    font-size: 36px;
  }

  .error-icon {
    font-size: 48px;
  }
}

@media screen and (max-width: 375px) {
  .detail-container {
    padding: 6px;
  }

  .wallpaper-detail-card .el-card__body {
    padding: 10px;
  }

  .wallpaper-title {
    font-size: 16px;
  }

  .resolution-btn {
    width: 64px;
    font-size: 10px;
    padding: 6px 2px !important;
  }

  .recommend-col {
    margin-bottom: 10px;
  }
}
</style>
