<template>
  <div class="wallpaper-container">
    <!-- 站点介绍（SEO 文本内容） -->
    <section class="site-intro">
      <h1 class="site-title">必应壁纸 - 微软必应每日高清壁纸下载</h1>
      <p class="site-desc">
        必应壁纸(Bing Wallpaper)下载站，每天同步更新<strong>微软必应</strong>官方每日壁纸，
        提供<strong>中国、美国、日本、德国、英国、法国、意大利、加拿大、印度</strong>等9个国家地区的必应壁纸浏览与下载。
        支持 <strong>4K、1920×1080、1920×1200、1366×768</strong> 等多种分辨率切换，
        可按年份筛选并<strong>一键批量下载</strong>全年壁纸打包，所有高清壁纸免费下载，适合作为电脑桌面和手机壁纸使用。
      </p>
    </section>

    <!-- 筛选区域 -->
    <el-card class="filter-card" shadow="hover">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="地区筛选" class="filter-label">
          <el-select 
            v-model="filterForm.region" 
            placeholder="选择地区" 
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
        
        <el-form-item label="图片尺寸" class="filter-label">
          <el-select 
            v-model="selectedResolution" 
            placeholder="选择尺寸" 
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
        
        <el-form-item label="年份筛选" class="filter-label">
          <el-select 
            v-model="filterForm.year" 
            placeholder="选择年份" 
            clearable
            @change="handleFilterChange"
            class="year-select"
          >
            <el-option
              v-for="year in yearOptions"
              :key="year"
              :label="year + '年'"
              :value="year"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <span class="year-hint">选择年份后批量下载可直接下载整个年份</span>
      </el-form>
      
      <!-- 筛选状态提示 -->
      <div class="filter-status" v-if="isFiltering">
        <el-tag type="info" closable @close="clearFilters">
          当前筛选：{{ getFilterStatusText() }}
        </el-tag>
        <span class="result-count">共 <strong>{{ filteredWallpapers.length }}</strong> 张壁纸</span>
        
        <!-- 网盘下载提示 -->
        <div class="netdisk-tip">
          使用
          <a href="https://pan.quark.cn/s/fcee3d820ae9" target="_blank" class="netdisk-link">夸克网盘</a>
          <a href="https://www.alipan.com/s/VF4HskqwXMk" target="_blank" class="netdisk-link">阿里网盘</a>
          下载高清壁纸
        </div>
        
        <el-tooltip 
          :content="filterForm.year ? '选择年份后批量下载可直接下载整个年份' : ''" 
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
            批量下载
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
        v-if="!loading && filteredWallpapers.length === 0" 
        description="没有找到符合条件的壁纸"
        class="empty-state"
      >
        <el-button type="primary" @click="clearFilters">清除筛选条件</el-button>
      </el-empty>
      
      <!-- 壁纸网格 -->
      <el-row :gutter="20" v-else>
        <el-col 
          v-for="wallpaper in paginatedWallpapers" 
          :key="wallpaper.id"
          :xs="24" 
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
              :to="`/wallpaper/detail/${wallpaper.id}?region=${filterForm.region}`"
              class="wallpaper-wrapper"
              :data-wallpaper-id="wallpaper.id"
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
                      预览
                    </el-button>
                    <el-button 
                      type="success" 
                      size="mini" 
                      icon="el-icon-download"
                      @click.native.stop="downloadWallpaper(wallpaper)"
                    >
                      下载
                    </el-button>
                  </div>
                </div>
              </div>
            </router-link>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 分页 -->
      <div class="pagination-container" v-if="filteredWallpapers.length > 0">
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
      // 加载状态
      loading: false,
      batchDownloading: false,
      downloadProgress: 0,
      downloadTotal: 0,
      downloadStatus: '',
      
      // 壁纸数据
      allWallpapers: [],

      // 已加载高清图的壁纸 id -> true
      hdLoadedMap: {},
      
      // 预览图(400x240)懒加载节流队列相关
      previewLoadedMap: {},       // 已加载预览图的壁纸 id -> true
      previewLoadQueue: [],       // 待加载预览图的壁纸 id 队列
      isProcessingQueue: false,   // 队列是否正在处理
      currentLoadingCount: 0,     // 当前正在加载的数量
      previewLoadDelay: 400,      // 每张预览图加载间隔(ms)，避免频繁请求导致403
      maxConcurrentPreview: 2,    // 预览图最大并发加载数
      observer: null,             // IntersectionObserver 实例
      hoverDebounceTimer: null,   // hover 高清图加载防抖定时器
      
      // 筛选表单
      filterForm: {
        region: 'zh-CN',
        year: ''
      },
      
      // 年份选项配置（2016年以后）
      yearOptions: [],
      
      // 分页配置
      currentPage: 1,
      pageSize: 12,
      
      // 图片尺寸配置
      imageWidth: 1920,
      imageHeight: 1080,
      uhd: false,
      selectedResolution: '',
      
      // 排序方式
      sortOrder: 'desc',
      
      // 总数据量
      total: 0,
      
      // 已知地区配置
      regionOptions: [
        { value: 'zh-CN', label: '中国' },
        { value: 'de-DE', label: '德国' },
        { value: 'en-CA', label: '加拿大' },
        { value: 'en-GB', label: '英国' },
        { value: 'en-IN', label: '印度' },
        { value: 'en-US', label: '美国' },
        { value: 'fr-FR', label: '法国' },
        { value: 'it-IT', label: '意大利' },
        { value: 'ja-JP', label: '日本' }
      ],
      
      // 已知分辨率配置
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
    // 是否正在筛选
    isFiltering() {
      return this.filterForm.region !== '' || 
             this.filterForm.year !== '';
    },
    
    // 筛选后的壁纸列表
    filteredWallpapers() {
      return [...this.allWallpapers];
    },
    
    // 分页后的壁纸列表
    paginatedWallpapers() {
      return this.filteredWallpapers;
    }
  },
  
  mounted() {
    this.initYearOptions();
    // 如果通过路由传入了地区参数，设置地区筛选
    if (this.region) {
      const regionOption = this.regionOptions.find(r => r.value === this.region);
      if (regionOption) {
        this.filterForm.region = this.region;
        this.applyRegionSEO(regionOption.label, this.region);
      }
    }
    this.fetchWallpapers();
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
    // 生成预览图（缩略图）URL：将 url 中的分辨率段替换为 400x240
    getPreviewUrl(wallpaper) {
      if (!wallpaper || !wallpaper.url) return '';
      // 兼容 _1920x1080 与 _UHD 两种分辨率标记
      return wallpaper.url.replace(/_\d+x\d+|_UHD/, '_400x240');
    },

    // 生成高清图 URL：固定使用 1920x1080
    getHdUrl(wallpaper) {
      if (!wallpaper || !wallpaper.url) return '';
      return wallpaper.url.replace(/_\d+x\d+|_UHD/, '_1920x1080');
    },

    // 根据加载状态返回对应的图片 src
    // 预览图需要通过队列节流加载，未加载完成前返回占位透明图
    getImageSrc(wallpaper) {
      if (!wallpaper) return '';
      if (this.hdLoadedMap[wallpaper.id]) return this.getHdUrl(wallpaper);
      if (this.previewLoadedMap[wallpaper.id]) return this.getPreviewUrl(wallpaper);
      // 占位透明图，等待队列加载完成后再替换为真实预览图
      return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    },

    // 鼠标移入卡片：后台预加载高清图，加载完成后切换显示（防抖避免频繁请求）
    handleCardHover(wallpaper) {
      if (!wallpaper || !wallpaper.url) return;
      if (this.hdLoadedMap[wallpaper.id]) return;

      // 防抖：快速划过时不触发高清图加载，减少并发请求
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
          // 高清图加载失败时静默保留预览图
          console.error('高清图加载失败:', hdUrl);
        };
        img.src = hdUrl;
      }, 300);
    },

    // 初始化懒加载观察器：检测进入视口的图片并加入加载队列
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
      }, { rootMargin: '200px 0px' }); // 提前200px开始加载

      this.$nextTick(() => {
        const wrappers = this.$el.querySelectorAll('[data-wallpaper-id]');
        wrappers.forEach(el => this.observer.observe(el));
      });
    },

    // 处理预览图加载队列：控制并发数和加载间隔，避免频繁请求导致403
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
          // 加载完成后延迟一段时间再加载下一张，降低请求频率
          setTimeout(loadNext, this.previewLoadDelay);
        };
        img.onerror = () => {
          this.currentLoadingCount--;
          // 加载失败也标记已处理，避免重复尝试
          this.$set(this.previewLoadedMap, id, true);
          setTimeout(loadNext, this.previewLoadDelay);
        };
        img.src = this.getPreviewUrl(wallpaper);
      };

      if (!this.isProcessingQueue) {
        this.isProcessingQueue = true;
        loadNext();
      } else {
        // 已有加载在进行中，尝试占用空闲并发槽位
        loadNext();
      }
    },

    // 重置预览图加载状态并启动懒加载（获取接口数据后调用）
    resetPreviewLoading() {
      this.previewLoadedMap = {};
      this.previewLoadQueue = [];
      this.isProcessingQueue = false;
      this.currentLoadingCount = 0;
      this.setupLazyObserver();
    },

    // 获取壁纸数据
    async fetchWallpapers() {
      this.loading = true;
      this.hdLoadedMap = {};
      
      try {
        // 构建API参数
        const params = {
          page: this.currentPage,
          limit: this.pageSize,
          order: this.sortOrder
        };
        
        // 如果选择了UHD，添加uhd参数，否则添加宽高参数
        if (this.uhd) {
          params.uhd = true;
        } else {
          params.w = this.imageWidth;
          params.h = this.imageHeight;
        }
        
        // 如果选择了地区，添加地区参数
        if (this.filterForm.region) {
          params.mkt = this.filterForm.region;
        }
        
        // 如果选择了年份，添加年份参数
        if (this.filterForm.year) {
          params.year = this.filterForm.year;
        }
        
        const response = await this.$axios.get('https://api.bimg.cc/all', { params });
        
        if (response.data && response.data.code === 200) {
          // 处理空数据的情况
          const data = response.data.data || [];
          
          // 如果数据为空或长度为0，显示提示
          if (data.length === 0) {
            this.allWallpapers = [];
            this.total = 0;
          } else {
            this.allWallpapers = data;
            this.total = response.data.total || 0;
          }
          // 重置预览图加载状态并启动节流懒加载
          this.resetPreviewLoading();
        } else {
          this.$message.error('获取壁纸数据失败：' + ((response.data && response.data.msg) || '未知错误'));
        }
      } catch (error) {
        console.error('获取壁纸数据失败:', error);
        this.$message.error('获取壁纸数据失败，请检查网络连接');
        this.allWallpapers = [];
        this.total = 0;
      } finally {
        this.loading = false;
      }
    },
    
    // 处理筛选条件变化
    handleFilterChange() {
      this.currentPage = 1; // 重置到第一页
      
      // 如果选择了年份，将每页数量设置为366
      if (this.filterForm.year) {
        this.pageSize = 366;
      } else {
        this.pageSize = 12; // 恢复默认值
      }

      // 地区变化时同步路由并更新 SEO
      if (this.filterForm.region && this.filterForm.region !== this.region) {
        const regionOption = this.regionOptions.find(r => r.value === this.filterForm.region);
        if (regionOption) {
          this.$router.replace(`/region/${this.filterForm.region}`);
          this.applyRegionSEO(regionOption.label, this.filterForm.region);
        }
      } else if (!this.filterForm.region && this.region) {
        this.$router.replace('/');
        removeJsonLd('region-jsonld');
      }
      
      this.fetchWallpapers(); // 重新获取数据
    },

    // 应用地区页 SEO：动态 title/description + 地区结构化数据
    applyRegionSEO(regionName, regionCode) {
      const title = `${regionName}必应壁纸 - ${regionName}地区每日高清壁纸下载`;
      const description = `${regionName}必应壁纸下载，提供微软必应${regionName}地区每日高清壁纸，支持4K、1920x1080等多种分辨率，免费下载高清电脑壁纸。`;
      updateSEO({
        title,
        description,
        path: `/region/${regionCode}`,
        keywords: `${regionName}必应壁纸,${regionName}壁纸,必应壁纸,高清壁纸下载`
      });
      setRegionJsonLd(regionName, regionCode);
    },
    
    // 处理日期范围变化
    handleDateRangeChange() {
      this.currentPage = 1; // 重置到第一页
      this.fetchWallpapers(); // 重新获取数据
    },
    
    // 获取筛选状态文本
    getFilterStatusText() {
      const parts = [];
      
      if (this.filterForm.region) {
        const region = this.regionOptions.find(r => r.value === this.filterForm.region);
        parts.push(`地区：${region ? region.label : this.filterForm.region}`);
      }
      
      if (this.filterForm.year) {
        parts.push(`年份：${this.filterForm.year}年`);
      }
      
      if (this.selectedResolution) {
        parts.push(`尺寸：${this.selectedResolution}`);
      }
      
      return parts.join('，');
    },
    
    // 清除筛选
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
    
    // 初始化年份选项
    initYearOptions() {
      const currentYear = new Date().getFullYear();
      const years = [];
      for (let year = currentYear; year >= 2016; year--) {
        years.push(year);
      }
      this.yearOptions = years;
    },
    
    // 处理分页变化
    handlePageChange(page) {
      this.currentPage = page;
      this.fetchWallpapers(); // 重新获取数据
      this.scrollToTop();
    },
    
    // 处理每页数量变化
    handleSizeChange(size) {
      this.pageSize = size;
      this.currentPage = 1;
      this.fetchWallpapers(); // 重新获取数据
    },
    
    // 滚动到顶部
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    },
    
    // 预览按钮：跳转到详情页（携带地区参数）
    previewWallpaper(wallpaper) {
      this.$router.push(`/wallpaper/detail/${wallpaper.id}?region=${this.filterForm.region}`);
    },

    // 处理筛选分辨率变化
    handleResolutionChange(resolution) {
      // 更新图片尺寸配置
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
      // 重新获取壁纸数据
      this.fetchWallpapers();
    },
    
    // 下载按钮：在新标签页打开详情页（携带地区参数）
    downloadWallpaper(wallpaper) {
      const routeData = this.$router.resolve(`/wallpaper/detail/${wallpaper.id}?region=${this.filterForm.region}`);
      window.open(routeData.href, '_blank');
    },
    
    // 批量下载壁纸
    async batchDownload() {
      if (this.filteredWallpapers.length === 0) {
        this.$message.warning('没有可下载的壁纸');
        return;
      }
      
      this.batchDownloading = true;
      this.downloadProgress = 0;
      this.downloadTotal = this.filteredWallpapers.length;
      this.downloadStatus = '正在下载壁纸...';
      
      try {
        const zip = new JSZip();
        const folder = zip.folder('bing-wallpapers');
        let loadedCount = 0;
        const totalCount = this.filteredWallpapers.length;
        
        const concurrency = 3;
        const chunks = [];
        for (let i = 0; i < totalCount; i += concurrency) {
          chunks.push(this.filteredWallpapers.slice(i, i + concurrency));
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
              console.error(`下载壁纸 ${wallpaper.id} 失败:`, error);
            }
          });
          
          await Promise.all(downloadPromises);
        }
        
        this.downloadStatus = '正在打包...';
        const content = await zip.generateAsync({ type: 'blob' });
        
        const date = new Date().toISOString().slice(0, 10);
        saveAs(content, `bing-wallpapers-${date}.zip`);
        
        this.$message.success(`成功下载 ${totalCount} 张壁纸`);
      } catch (error) {
        console.error('批量下载失败:', error);
        this.$message.error('批量下载失败，请重试');
      } finally {
        this.batchDownloading = false;
        this.downloadProgress = 0;
        this.downloadStatus = '';
      }
    },
    
    // 图片加载成功
    handleImageLoad() {
      // 图片加载成功，可以添加加载动画效果
    },
    
    // 图片加载失败
    handleImageError(e) {
      console.error('图片加载失败:', e);
      // 可以设置一个默认的占位图
    }
  }
};
</script>

<style scoped>
/* 站点介绍区域（SEO 文本） */
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

/* 容器样式 */
.wallpaper-container {
  padding: 0;
}

/* 筛选卡片样式 */
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

/* 筛选状态提示 */
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

/* 壁纸网格容器 */
.wallpaper-grid-container {
  min-height: 400px;
}

/* 空状态样式 */
.empty-state {
  padding: 60px 0;
}

/* 壁纸列样式 */
.wallpaper-col {
  margin-bottom: 20px;
}

/* 壁纸卡片样式 */
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

/* 壁纸包装器 */
.wallpaper-wrapper {
  position: relative;
  display: block;
  width: 100%;
  padding-top: 56.25%; /* 16:9 比例 */
  overflow: hidden;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
}

/* 壁纸图片样式 */
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

/* 图片加载中遮罩 */
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

/* 悬浮提示层 */
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

/* 分页容器 */
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

/* 响应式设计 */
@media screen and (max-width: 1024px) {
  .filter-form {
    gap: 12px;
  }
  
  .wallpaper-col {
    margin-bottom: 16px;
  }
}

@media screen and (max-width: 768px) {
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
  
  /* 壁纸网格 */
  .wallpaper-col {
    margin-bottom: 12px;
  }
  
  /* 分页 */
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
  
  /* 悬浮层 */
  .wallpaper-overlay {
    padding: 12px;
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
  
  /* 空状态 */
  .empty-state {
    padding: 40px 20px;
  }
  
  .empty-state /deep/ .el-empty__description {
    font-size: 14px;
  }
}

@media screen and (max-width: 375px) {
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

/* Element UI 组件样式覆盖 */
.el-card {
  border: 1px solid #ebeef5;
}

.el-card:hover {
  border-color: #409eff;
}

/* 加载动画 */
.wallpaper-grid-container /deep/ .el-loading-spinner {
  top: 50%;
}

/* 批量下载提示框样式 */
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
