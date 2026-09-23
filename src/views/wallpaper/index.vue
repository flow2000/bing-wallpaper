<template>
  <div class="wallpaper-container">
    <!-- 站点介绍（SEO 文本内容） -->
    <section class="site-intro">
      <h1 class="site-title">{{ $t('wallpaper.siteTitle') }}</h1>
      <p class="site-desc" v-html="siteDescHtml"></p>
    </section>

    <!-- 筛选区域 -->
    <el-card class="filter-card" shadow="hover">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item :label="$t('wallpaper.regionFilter')" class="filter-label">
          <el-select 
            v-model="filterForm.region" 
            :placeholder="$t('wallpaper.selectRegion')" 
            clearable
            @change="handleFilterChange"
            class="region-select"
          >
            <el-option
              v-for="region in regionOptions"
              :key="region.value"
              :label="region.label"
              :value="region.value"
            >
              <span class="region-option">{{ region.label }}</span>
              <span class="region-code">{{ region.value }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item :label="$t('wallpaper.resolutionFilter')" class="filter-label">
          <el-select 
            v-model="selectedResolution" 
            :placeholder="$t('wallpaper.selectResolution')" 
            @change="handleResolutionChange"
            class="resolution-select"
          >
            <el-option
              v-for="res in resolutions"
              :key="res"
              :label="res"
              :value="res === '4K' ? 'UHD' : res"
            >
            </el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item :label="$t('wallpaper.yearFilter')" class="filter-label">
          <el-select 
            v-model="filterForm.year" 
            :placeholder="$t('wallpaper.selectYear')" 
            clearable
            @change="handleFilterChange"
            class="year-select"
          >
            <el-option
              v-for="year in yearOptions"
              :key="year"
              :label="year + $t('wallpaper.yearSuffix')"
              :value="year"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <span class="year-hint">{{ $t('wallpaper.yearHint') }}</span>
      </el-form>
      
      <!-- 筛选状态提示 -->
      <div class="filter-status" v-if="isFiltering">
        <el-tag type="info" closable @close="clearFilters">
          {{ $t('wallpaper.currentFilter') }}：{{ getFilterStatusText() }}
        </el-tag>
        <span class="result-count" v-html="$t('wallpaper.totalWallpapers', { count: '<strong>' + total + '</strong>' })"></span>
        
        <!-- 网盘下载提示 -->
        <div class="netdisk-tip">
          {{ $t('common.use') }}
          <a href="https://pan.quark.cn/s/fcee3d820ae9" target="_blank" class="netdisk-link">{{ $t('common.netdiskQuark') }}</a>
          <a href="https://www.alipan.com/s/VF4HskqwXMk" target="_blank" class="netdisk-link">{{ $t('common.netdiskAlipan') }}</a>
          {{ $t('common.downloadViaNetdisk') }}
        </div>
        
        <el-tooltip 
          :content="filterForm.year ? $t('wallpaper.yearHint') : ''" 
          placement="top"
          :disabled="!filterForm.year"
          popper-class="batch-download-tooltip"
        >
          <el-button 
            type="primary" 
            size="small" 
            icon="el-icon-download"
            @click="batchDownload"
            :loading="batchDownloading"
            class="batch-download-btn"
          >
            {{ $t('wallpaper.batchDownload') }}
          </el-button>
        </el-tooltip>
        
        <!-- 下载进度条 -->
        <div v-if="batchDownloading" class="download-progress-wrapper">
          <el-progress 
            :percentage="downloadProgress" 
            :status="downloadProgress === 100 ? 'success' : null"
            :stroke-width="20"
            class="download-progress"
          >
            <template #default="{ percentage }">
              <span class="progress-text">{{ downloadStatus }} {{ percentage }}%</span>
            </template>
          </el-progress>
        </div>
      </div>
    </el-card>
    
    <!-- 壁纸列表 -->
    <div v-loading="loading" class="wallpaper-grid-container">
      <!-- 空状态 -->
      <el-empty
        v-if="!loading && allWallpapers.length === 0"
        :description="$t('wallpaper.noResults')"
        class="empty-state"
      >
        <el-button type="primary" @click="clearFilters">{{ $t('wallpaper.clearFilters') }}</el-button>
      </el-empty>
      
      <!-- 壁纸网格 -->
      <el-row :gutter="20" v-else>
        <el-col
          v-for="wallpaper in allWallpapers"
          :key="wallpaper.id"
          :xs="12"
          :sm="6"
          :md="6"
          :lg="6"
          :xl="6"
          class="wallpaper-col"
        >
          <el-card 
            :body-style="{ padding: '0px' }" 
            class="wallpaper-card"
            shadow="hover"
          >
            <!-- 壁纸图片容器 -->
            <router-link
              :to="`/wallpaper/detail/${filterForm.region}-${wallpaper.id}.html`"
              class="wallpaper-wrapper"
              :data-wallpaper-id="wallpaper.id"
              :title="wallpaper.title + (wallpaper.copyright ? '——' + wallpaper.copyright : '')"
              target="_blank"
              @mouseenter.native="handleCardHover(wallpaper)"
            >
              <el-image
                :src="getImageSrc(wallpaper)"
                :alt="wallpaper.title"
                fit="cover"
                class="wallpaper-image"
                :class="{ 'is-hd': !!hdLoadedMap[wallpaper.id], 'is-loading': !previewLoadedMap[wallpaper.id] }"
                @load="handleImageLoad"
                @error="handleImageError"
              >
                <div slot="error" class="image-slot">
                  <i class="el-icon-picture-outline"></i>
                </div>
              </el-image>
              
              <!-- 加载中遮罩 -->
              <div v-if="!previewLoadedMap[wallpaper.id]" class="image-loading-overlay">
                <i class="el-icon-loading"></i>
              </div>
              
              <!-- 悬浮提示层 -->
              <div class="wallpaper-overlay">
                <div class="overlay-content">
                  <h3 class="wallpaper-title">{{ wallpaper.title }}</h3>
                  <p class="wallpaper-copyright">{{ wallpaper.copyright }}</p>
                  <div class="wallpaper-meta">
                    <span class="meta-item">
                      <i class="el-icon-date"></i>
                      {{ wallpaper.datetime }}
                    </span>
                  </div>
                  <div class="overlay-actions">
                    <el-button
                      type="primary"
                      size="mini"
                      icon="el-icon-view"
                      @click.native.stop="previewWallpaper(wallpaper)"
                    >
                      {{ $t('common.preview') }}
                    </el-button>
                  </div>
                </div>
              </div>
            </router-link>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 分页 -->
      <div class="pagination-container" v-if="allWallpapers.length > 0">
        <el-pagination
          background
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
          :current-page="currentPage"
          :page-sizes="[12, 24, 48]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          :pager-count="7"
          class="custom-pagination"
        >
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { updateSEO, setRegionJsonLd, removeJsonLd } from '@/utils/seo';

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
  name: 'WallpaperIndex',
  props: {
    region: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: false,
      batchDownloading: false,
      downloadProgress: 0,
      downloadTotal: 0,
      downloadStatus: '',
      
      allWallpapers: [],

      hdLoadedMap: {},
      
      previewLoadedMap: {},
      previewLoadQueue: [],
      isProcessingQueue: false,
      currentLoadingCount: 0,
      previewLoadDelay: 400,
      maxConcurrentPreview: 2,
      observer: null,
      hoverDebounceTimer: null,
      
      filterForm: {
        region: 'zh-CN',
        year: ''
      },
      
      yearOptions: [],
      
      currentPage: 1,
      pageSize: 12,
      
      imageWidth: 1920,
      imageHeight: 1080,
      uhd: false,
      selectedResolution: '',
      
      sortOrder: 'desc',
      
      total: 0,
      
      resolutions: [
        '4K',
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
      ]
    };
  },
  
  computed: {
    isFiltering() {
      return this.filterForm.region !== '' ||
             this.filterForm.year !== '';
    },
    
    regionOptions() {
      return [
        { value: 'zh-CN', label: this.$t('common.regionChina') },
        { value: 'de-DE', label: this.$t('common.regionGermany') },
        { value: 'en-CA', label: this.$t('common.regionCanada') },
        { value: 'en-GB', label: this.$t('common.regionUK') },
        { value: 'en-IN', label: this.$t('common.regionIndia') },
        { value: 'en-US', label: this.$t('common.regionUS') },
        { value: 'fr-FR', label: this.$t('common.regionFrance') },
        { value: 'it-IT', label: this.$t('common.regionItaly') },
        { value: 'ja-JP', label: this.$t('common.regionJapan') }
      ]
    },

    siteDescHtml() {
      const raw = this.$t('wallpaper.siteDesc')
      return raw
        .replace(/\{strong\}/g, '<strong>')
        .replace(/\{\/strong\}/g, '</strong>')
    }
  },

  mounted() {
    this.initYearOptions();
    const region = this.stripHtml(this.region);
    if (region) {
      const regionOption = this.regionOptions.find(r => r.value === region);
      if (regionOption) {
        this.filterForm.region = region;
        this.applyRegionSEO(regionOption.label, region);
      }
    }
    this.fetchWallpapers();
  },

  watch: {
    region(newRegion, oldRegion) {
      if (newRegion !== oldRegion) {
        const region = this.stripHtml(newRegion);
        this.currentPage = 1;
        if (region) {
          const regionOption = this.regionOptions.find(r => r.value === region);
          if (regionOption) {
            this.filterForm.region = region;
            this.applyRegionSEO(regionOption.label, region);
          }
        } else {
          this.filterForm.region = 'zh-CN';
          removeJsonLd('region-jsonld');
        }
        this.fetchWallpapers();
      }
    }
  },
  
  beforeDestroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    if (this.hoverDebounceTimer) {
      clearTimeout(this.hoverDebounceTimer);
    }
  },
  
  methods: {
    getRegionLabel(code) {
      const key = REGION_KEY_MAP[code]
      return key ? this.$t(key) : code
    },

    stripHtml(val) {
      if (!val) return '';
      return val.replace(/\.html$/, '');
    },

    getPreviewUrl(wallpaper) {
      if (!wallpaper || !wallpaper.url) return '';
      return wallpaper.url.replace(/_\d+x\d+|_UHD/, '_400x240');
    },

    getHdUrl(wallpaper) {
      if (!wallpaper || !wallpaper.url) return '';
      return wallpaper.url.replace(/_\d+x\d+|_UHD/, '_1920x1080');
    },

    getImageSrc(wallpaper) {
      if (!wallpaper) return '';
      if (this.hdLoadedMap[wallpaper.id]) return this.getHdUrl(wallpaper);
      if (this.previewLoadedMap[wallpaper.id]) return this.getPreviewUrl(wallpaper);
      return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    },

    handleCardHover(wallpaper) {
      if (!wallpaper || !wallpaper.url) return;
      if (this.hdLoadedMap[wallpaper.id]) return;

      if (this.hoverDebounceTimer) {
        clearTimeout(this.hoverDebounceTimer);
      }
      this.hoverDebounceTimer = setTimeout(() => {
        const hdUrl = this.getHdUrl(wallpaper);
        const img = new Image();
        img.onload = () => {
          this.$set(this.hdLoadedMap, wallpaper.id, true);
        };
        img.onerror = () => {
          console.error('HD image load failed:', hdUrl);
        };
        img.src = hdUrl;
      }, 300);
    },

    setupLazyObserver() {
      if (this.observer) {
        this.observer.disconnect();
      }

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.dataset.wallpaperId;
            if (id && !this.previewLoadedMap[id] && !this.previewLoadQueue.includes(id)) {
              this.previewLoadQueue.push(id);
              this.processPreviewQueue();
            }
          }
        });
      }, { rootMargin: '200px 0px' });

      this.$nextTick(() => {
        const wrappers = this.$el.querySelectorAll('[data-wallpaper-id]');
        wrappers.forEach(el => this.observer.observe(el));
      });
    },

    processPreviewQueue() {
      const loadNext = () => {
        if (this.previewLoadQueue.length === 0) {
          this.isProcessingQueue = false;
          return;
        }

        if (this.currentLoadingCount >= this.maxConcurrentPreview) {
          return;
        }

        const id = this.previewLoadQueue.shift();
        if (this.previewLoadedMap[id]) {
          loadNext();
          return;
        }

        const wallpaper = this.allWallpapers.find(w => String(w.id) === String(id));
        if (!wallpaper) {
          loadNext();
          return;
        }

        this.currentLoadingCount++;
        const img = new Image();
        img.onload = () => {
          this.$set(this.previewLoadedMap, id, true);
          this.currentLoadingCount--;
          setTimeout(loadNext, this.previewLoadDelay);
        };
        img.onerror = () => {
          this.currentLoadingCount--;
          this.$set(this.previewLoadedMap, id, true);
          setTimeout(loadNext, this.previewLoadDelay);
        };
        img.src = this.getPreviewUrl(wallpaper);
      };

      if (!this.isProcessingQueue) {
        this.isProcessingQueue = true;
        loadNext();
      } else {
        loadNext();
      }
    },

    resetPreviewLoading() {
      this.previewLoadedMap = {};
      this.previewLoadQueue = [];
      this.isProcessingQueue = false;
      this.currentLoadingCount = 0;
      this.setupLazyObserver();
    },

    async fetchWallpapers() {
      this.loading = true;
      this.hdLoadedMap = {};
      
      try {
        const params = {
          page: this.currentPage,
          limit: this.pageSize,
          order: this.sortOrder
        };
        
        if (this.uhd) {
          params.uhd = true;
        } else {
          params.w = this.imageWidth;
          params.h = this.imageHeight;
        }
        
        if (this.filterForm.region) {
          params.mkt = this.filterForm.region;
        }
        
        if (this.filterForm.year) {
          params.year = this.filterForm.year;
        }
        
        const response = await this.$axios.get('https://api.bimg.cc/all', { params });
        
        if (response.data && response.data.code === 200) {
          const data = response.data.data || [];
          
          if (data.length === 0) {
            this.allWallpapers = [];
            this.total = 0;
          } else {
            this.allWallpapers = data;
            this.total = response.data.total || 0;
          }
          this.resetPreviewLoading();
        } else {
          this.$message.error(this.$t('wallpaper.fetchFailed') + '：' + ((response.data && response.data.msg) || this.$t('wallpaper.unknownError')));
        }
      } catch (error) {
        console.error('Fetch wallpapers failed:', error);
        this.$message.error(this.$t('wallpaper.fetchFailedNetwork'));
        this.allWallpapers = [];
        this.total = 0;
      } finally {
        this.loading = false;
      }
    },
    
    handleFilterChange() {
      this.currentPage = 1;
      
      if (this.filterForm.year) {
        this.pageSize = 366;
      } else {
        this.pageSize = 12;
      }

      if (this.filterForm.region && this.filterForm.region !== this.region) {
        const regionOption = this.regionOptions.find(r => r.value === this.filterForm.region);
        if (regionOption) {
          this.$router.replace(`/region/${this.filterForm.region}.html`);
          this.applyRegionSEO(regionOption.label, this.filterForm.region);
        }
      } else if (!this.filterForm.region && this.region) {
        this.$router.replace('/index.html');
        removeJsonLd('region-jsonld');
      }
      
      this.fetchWallpapers();
    },

    applyRegionSEO(regionName, regionCode) {
      const title = this.$t('seo.regionSeoTitle', { name: regionName })
      const description = this.$t('seo.regionSeoDesc', { name: regionName })
      const keywords = this.$t('seo.regionSeoKeywords', { name: regionName })
      updateSEO({
        title,
        description,
        path: `/region/${regionCode}.html`,
        keywords
      });
      setRegionJsonLd(regionName, regionCode);
    },
    
    handleDateRangeChange() {
      this.currentPage = 1;
      this.fetchWallpapers();
    },
    
    getFilterStatusText() {
      const parts = [];
      
      if (this.filterForm.region) {
        const region = this.regionOptions.find(r => r.value === this.filterForm.region);
        parts.push(`${this.$t('wallpaper.filterRegion')}：${region ? region.label : this.filterForm.region}`);
      }
      
      if (this.filterForm.year) {
        parts.push(`${this.$t('wallpaper.filterYear')}：${this.filterForm.year}${this.$t('wallpaper.yearSuffix')}`);
      }
      
      if (this.selectedResolution) {
        parts.push(`${this.$t('wallpaper.filterResolution')}：${this.selectedResolution}`);
      }
      
      return parts.join(this.$i18n.locale === 'zh-CN' ? '，' : ', ');
    },
    
    clearFilters() {
      this.filterForm.region = 'zh-CN';
      this.filterForm.year = '';
      this.selectedResolution = '';
      this.uhd = false;
      this.imageWidth = 1920;
      this.imageHeight = 1080;
      this.currentPage = 1;
      this.fetchWallpapers();
    },
    
    initYearOptions() {
      const currentYear = new Date().getFullYear();
      const years = [];
      for (let year = currentYear; year >= 2016; year--) {
        years.push(year);
      }
      this.yearOptions = years;
    },
    
    handlePageChange(page) {
      this.currentPage = page;
      this.fetchWallpapers();
      this.scrollToTop();
    },
    
    handleSizeChange(size) {
      this.pageSize = size;
      this.currentPage = 1;
      this.fetchWallpapers();
    },
    
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    },
    
    previewWallpaper(wallpaper) {
      const routeData = this.$router.resolve(`/wallpaper/detail/${this.filterForm.region}-${wallpaper.id}.html`);
      window.open(routeData.href, '_blank');
    },

    handleResolutionChange(resolution) {
      if (resolution === 'UHD') {
        this.uhd = true;
        this.imageWidth = 3840;
        this.imageHeight = 2160;
      } else {
        this.uhd = false;
        const match = resolution.match(/(\d+)x(\d+)/);
        if (match) {
          this.imageWidth = parseInt(match[1]);
          this.imageHeight = parseInt(match[2]);
        }
      }
      this.fetchWallpapers();
    },
    
    downloadWallpaper(wallpaper) {
      const routeData = this.$router.resolve(`/wallpaper/detail/${this.filterForm.region}-${wallpaper.id}.html`);
      window.open(routeData.href, '_blank');
    },
    
    async batchDownload() {
      if (this.allWallpapers.length === 0) {
        this.$message.warning(this.$t('wallpaper.noWallpapers'));
        return;
      }

      this.batchDownloading = true;
      this.downloadProgress = 0;
      this.downloadTotal = this.allWallpapers.length;
      this.downloadStatus = this.$t('wallpaper.downloadingWallpapers');

      try {
        const zip = new JSZip();
        const folder = zip.folder('bing-wallpapers');
        let loadedCount = 0;
        const totalCount = this.allWallpapers.length;
        
        const concurrency = 3;
        const chunks = [];
        for (let i = 0; i < totalCount; i += concurrency) {
          chunks.push(this.allWallpapers.slice(i, i + concurrency));
        }
        
        for (const chunk of chunks) {
          const downloadPromises = chunk.map(async (wallpaper) => {
            try {
              const response = await fetch(wallpaper.url, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                  'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                  'Accept-Encoding': 'gzip, deflate, br',
                  'Cache-Control': 'no-cache',
                  'Referer': 'https://www.bing.com',
                  'DNT': '1',
                  'Connection': 'keep-alive',
                  'Upgrade-Insecure-Requests': '1'
                }
              });
              
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              
              const reader = response.body.getReader();
              const chunks = [];
              let receivedLength = 0;
              
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                chunks.push(value);
                receivedLength += value.length;
              }
              
              const blob = new Blob(chunks);
              
              const date = wallpaper.datetime ? wallpaper.datetime.slice(0, 10) : new Date().toISOString().slice(0, 10);
              const filename = `${wallpaper.title}_${date}.jpg`;
              folder.file(filename, blob);
              
              loadedCount++;
              this.downloadProgress = Math.round((loadedCount / totalCount) * 100);
            } catch (error) {
              console.error(`Download wallpaper ${wallpaper.id} failed:`, error);
            }
          });
          
          await Promise.all(downloadPromises);
        }
        
        this.downloadStatus = this.$t('wallpaper.packaging');
        const content = await zip.generateAsync({ type: 'blob' });
        
        const date = new Date().toISOString().slice(0, 10);
        saveAs(content, `bing-wallpapers-${date}.zip`);
        
        this.$message.success(this.$t('wallpaper.downloadSuccess', { count: totalCount }));
      } catch (error) {
        console.error('Batch download failed:', error);
        this.$message.error(this.$t('wallpaper.downloadFailed'));
      } finally {
        this.batchDownloading = false;
        this.downloadProgress = 0;
        this.downloadStatus = '';
      }
    },
    
    handleImageLoad() {
    },
    
    handleImageError(e) {
      console.error('Image load failed:', e);
    }
  }
};
</script>

<style scoped>
.site-intro {
  background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
  border-radius: 12px;
  padding: 24px 28px;
  margin-bottom: 24px;
  border: 1px solid #ebeef5;
}

.site-title {
  font-size: 26px;
  font-weight: 700;
  color: #303133;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.site-desc {
  font-size: 15px;
  line-height: 1.8;
  color: #606266;
  margin: 0;
}

.site-desc strong {
  color: #409eff;
  font-weight: 600;
}

.wallpaper-container {
  padding: 0;
}

.filter-card {
  margin-bottom: 24px;
  border-radius: 12px;
  background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 16px;
}

.filter-label {
  margin-bottom: 0;
}

.filter-label .el-form-item__label {
  font-weight: 500;
  color: #606266;
}

.region-select {
  width: 160px;
}

.resolution-select {
  width: 140px;
}

.year-select {
  width: 140px;
}

.year-hint {
  font-size: 13px;
  color: #409eff;
  font-weight: 600;
  padding: 8px 12px;
  background: linear-gradient(135deg, #ecf5ff 0%, #e1f3ff 100%);
  border: 1px solid #b3d8ff;
  border-radius: 6px;
  line-height: 1.5;
  display: inline-flex;
  align-items: center;
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.1);
}

.year-hint::before {
  content: '💡';
  margin-right: 6px;
}

.region-option {
  float: left;
}

.region-code {
  float: right;
  color: #909399;
  font-size: 12px;
}

.filter-status {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.batch-download-btn {
  margin-left: auto;
}

.netdisk-tip {
  font-size: 13px;
  color: #409eff;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-right: 16px;
}

.netdisk-link {
  color: #409eff;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  padding: 2px 6px;
  border-radius: 4px;
}

.netdisk-link:hover {
  background: rgba(64, 158, 255, 0.1);
  transform: translateY(-1px);
}

.download-progress-wrapper {
  width: 100%;
  margin-top: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
  box-sizing: border-box;
}

.download-progress {
  width: 100%;
}

.progress-text {
  font-size: 13px;
  font-weight: 500;
  color: #606266;
}

.result-count {
  color: #606266;
  font-size: 14px;
}

.result-count strong {
  color: #409eff;
  font-size: 16px;
}

.wallpaper-grid-container {
  min-height: 400px;
}

.empty-state {
  padding: 60px 0;
}

.wallpaper-col {
  margin-bottom: 20px;
}

.wallpaper-card {
  border: none;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  background: #fff;
}

.wallpaper-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.wallpaper-wrapper {
  position: relative;
  display: block;
  width: 100%;
  padding-top: 56.25%;
  overflow: hidden;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
}

.wallpaper-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: transform 0.5s ease;
}

.wallpaper-card:hover .wallpaper-image {
  transform: scale(1.05);
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
  font-size: 48px;
}

.image-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f7fa;
  color: #c0c4cc;
  font-size: 32px;
  z-index: 1;
  pointer-events: none;
}

.wallpaper-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  padding: 16px;
}

.wallpaper-card:hover .wallpaper-overlay {
  opacity: 1;
}

.overlay-content {
  text-align: center;
  color: #fff;
  width: 100%;
}

.wallpaper-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #fff;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.wallpaper-copyright {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wallpaper-meta {
  margin-bottom: 16px;
}

.meta-item {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.meta-item i {
  margin-right: 4px;
}

.overlay-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.overlay-actions .el-button {
  padding: 8px 16px;
  border-radius: 20px;
}

.pagination-container {
  margin-top: 32px;
  display: flex;
  justify-content: center;
}

.custom-pagination {
  padding: 16px 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

@media screen and (max-width: 1024px) {
  .filter-form {
    gap: 12px;
  }
  
  .wallpaper-col {
    margin-bottom: 16px;
  }
}

@media screen and (max-width: 768px) {
  .site-intro {
    padding: 16px 18px;
    margin-bottom: 16px;
  }

  .site-title {
    font-size: 20px;
    margin-bottom: 8px;
  }

  .site-desc {
    font-size: 13px;
    line-height: 1.7;
  }

  .wallpaper-container {
    padding: 12px;
  }

  .filter-card {
    margin-bottom: 16px;
  }

  .filter-form {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .filter-label {
    width: 100%;
  }

  .filter-label .el-form-item__label {
    display: block;
    margin-bottom: 8px;
  }

  .filter-actions {
    margin-left: 0;
    margin-top: 16px;
    width: 100%;
  }

  .filter-actions .el-button {
    width: 100%;
  }

  .region-select,
  .resolution-select,
  .date-range-picker {
    width: 100%;
  }

  .year-select {
    width: 100%;
  }

  .year-hint {
    width: 100%;
    justify-content: center;
    text-align: center;
    font-size: 12px;
  }

  .date-range-picker {
    width: 100%;
  }

  .filter-status {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .netdisk-tip {
    width: 100%;
    justify-content: center;
    font-size: 12px;
  }

  .batch-download-btn {
    width: 100%;
    margin-top: 8px;
  }

  .download-progress-wrapper {
    padding: 10px;
  }

  .progress-text {
    font-size: 12px;
  }

  .result-count {
    font-size: 13px;
  }

  .wallpaper-col {
    margin-bottom: 12px;
  }

  .pagination-container {
    margin-top: 24px;
  }

  .custom-pagination {
    padding: 12px 16px;
  }

  .custom-pagination /deep/ .el-pagination__sizes {
    display: none;
  }

  .custom-pagination /deep/ .el-pagination__jump {
    display: none;
  }

  .custom-pagination /deep/ .el-pager li {
    min-width: 32px;
    height: 32px;
    line-height: 32px;
    font-size: 13px;
  }

  .custom-pagination /deep/ .el-pagination__prev,
  .custom-pagination /deep/ .el-pagination__next {
    min-width: 32px;
    height: 32px;
  }

  .custom-pagination /deep/ .btn-prev,
  .custom-pagination /deep/ .btn-next {
    padding: 0 8px;
  }

  .wallpaper-overlay {
    padding: 10px;
  }

  .wallpaper-title {
    font-size: 14px;
    margin-bottom: 6px;
  }

  .wallpaper-copyright {
    font-size: 11px;
    margin-bottom: 8px;
  }

  .overlay-actions .el-button {
    padding: 6px 12px;
    font-size: 12px;
  }
}

@media screen and (max-width: 480px) {
  .site-intro {
    padding: 12px 14px;
    margin-bottom: 12px;
  }

  .site-title {
    font-size: 17px;
    margin-bottom: 6px;
  }

  .site-desc {
    font-size: 12px;
    line-height: 1.6;
  }

  .wallpaper-container {
    padding: 8px;
  }

  .filter-card {
    border-radius: 8px;
  }

  .wallpaper-card {
    border-radius: 8px;
  }

  .wallpaper-wrapper {
    padding-top: 56.25%;
  }

  .filter-status {
    font-size: 12px;
  }

  .result-count strong {
    font-size: 14px;
  }

  .pagination-container {
    margin-top: 20px;
  }

  .custom-pagination {
    padding: 10px 12px;
  }

  .custom-pagination /deep/ .el-pager li {
    min-width: 28px;
    height: 28px;
    line-height: 28px;
    font-size: 12px;
  }

  .custom-pagination /deep/ .el-pagination__prev,
  .custom-pagination /deep/ .el-pagination__next {
    min-width: 28px;
    height: 28px;
  }

  .custom-pagination /deep/ .el-pagination__total {
    font-size: 12px;
  }

  .custom-pagination /deep/ .el-pager li {
    margin: 0 2px;
  }

  .empty-state {
    padding: 40px 20px;
  }

  .empty-state /deep/ .el-empty__description {
    font-size: 14px;
  }

  .overlay-actions {
    display: none;
  }

  .wallpaper-overlay {
    background: rgba(0, 0, 0, 0.5);
  }

  .wallpaper-title {
    font-size: 12px;
  }

  .wallpaper-copyright {
    display: none;
  }

  .wallpaper-meta {
    margin-bottom: 0;
  }

  .meta-item {
    font-size: 11px;
  }
}

@media screen and (max-width: 375px) {
  .site-intro {
    padding: 10px 12px;
    margin-bottom: 10px;
  }

  .site-title {
    font-size: 15px;
  }

  .site-desc {
    font-size: 11px;
  }

  .pagination-container {
    margin-top: 16px;
  }
  
  .custom-pagination {
    padding: 8px 10px;
  }
  
  .custom-pagination /deep/ .el-pager li {
    min-width: 26px;
    height: 26px;
    line-height: 26px;
    font-size: 11px;
  }
  
  .custom-pagination /deep/ .el-pagination__prev,
  .custom-pagination /deep/ .el-pagination__next {
    min-width: 26px;
    height: 26px;
  }
  
  .custom-pagination /deep/ .btn-prev,
  .custom-pagination /deep/ .btn-next {
    padding: 0 6px;
  }
  
  .custom-pagination /deep/ .el-pagination__total {
    font-size: 11px;
  }
}

.el-card {
  border: 1px solid #ebeef5;
}

.el-card:hover {
  border-color: #409eff;
}

.wallpaper-grid-container /deep/ .el-loading-spinner {
  top: 50%;
}

.batch-download-tooltip {
  font-size: 14px !important;
  font-weight: 600;
  padding: 14px 18px !important;
  line-height: 1.6;
  color: #409eff !important;
  background: linear-gradient(135deg, #ecf5ff 0%, #e1f3ff 100%) !important;
  border: 1px solid #b3d8ff !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15) !important;
  max-width: 280px !important;
}
</style>
