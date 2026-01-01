<template>
  <div class="wallpaper-container">
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
              :label="res === '4K' ? '4K' : res"
              :value="res"
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
          :sm="12" 
          :md="8" 
          :lg="6"
          :xl="4"
          class="wallpaper-col"
        >
          <el-card 
            :body-style="{ padding: '0px' }" 
            class="wallpaper-card"
            shadow="hover"
          >
            <!-- 壁纸图片容器 -->
            <div class="wallpaper-wrapper" @click="previewWallpaper(wallpaper)">
              <el-image 
                :src="wallpaper.url" 
                :alt="wallpaper.title"
                fit="cover"
                class="wallpaper-image"
                lazy
                @load="handleImageLoad"
                @error="handleImageError"
              >
                <div slot="error" class="image-slot">
                  <i class="el-icon-picture-outline"></i>
                </div>
              </el-image>
              
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
                      @click.stop="previewWallpaper(wallpaper)"
                    >
                      预览
                    </el-button>
                    <el-button 
                      type="success" 
                      size="mini" 
                      icon="el-icon-download"
                      @click.stop="downloadWallpaper(wallpaper)"
                    >
                      下载
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
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
    
    <!-- 壁纸预览对话框 -->
    <el-dialog
      :title="(previewWallpaperData && previewWallpaperData.title) || '壁纸预览'"
      :visible.sync="previewDialogVisible"
      width="80%"
      top="5vh"
      class="preview-dialog"
      :close-on-click-modal="true"
    >
      <div class="preview-container" v-if="previewWallpaperData">
        <div class="preview-image-wrapper">
          <el-image 
            :src="previewWallpaperData.url" 
            :alt="previewWallpaperData.title"
            fit="contain"
            class="preview-image"
          >
          </el-image>
        </div>
        
        <div class="preview-info">
          <h3 class="preview-title">{{ previewWallpaperData.title }}</h3>
          <p class="preview-copyright">
            <span class="label">版权信息：</span>
            <span class="content">{{ previewWallpaperData.copyright }}</span>
          </p>
          <p class="preview-date">
            <span class="label">发布日期：</span>
            <span class="content">{{ previewWallpaperData.datetime }}</span>
          </p>
          
          <!-- 分辨率选择 -->
          <div class="resolution-selector">
            <span class="label">选择分辨率：</span>
            <el-select 
              v-model="selectedResolution" 
              placeholder="选择分辨率"
              size="small"
              @change="handleResolutionChange"
            >
              <el-option
                v-for="res in resolutions"
                :key="res"
                :label="res === '4K' ? '4K' : res"
                :value="res"
              >
              </el-option>
            </el-select>
          </div>
          
          <!-- 操作按钮 -->
          <div class="preview-actions">
            <el-button 
              type="primary" 
              icon="el-icon-view"
              @click="openOriginalImage"
            >
              查看原图
            </el-button>
            <el-button 
              type="success" 
              icon="el-icon-download"
              @click="downloadWallpaper(previewWallpaperData)"
            >
              下载壁纸
            </el-button>
            <el-button 
              type="success" 
              icon="el-icon-download"
              @click="download4KWallpaper(previewWallpaperData)"
            >
              下载4K壁纸
            </el-button>
            <el-button 
              type="warning" 
              icon="el-icon-link"
              @click="copyImageUrl"
            >
              复制链接
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export default {
  name: 'WallpaperIndex',
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
      
      // 排序方式
      sortOrder: 'desc',
      
      // 总数据量
      total: 0,
      
      // 预览对话框
      previewDialogVisible: false,
      previewWallpaperData: null,
      selectedResolution: '1920x1080',
      
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
    this.fetchWallpapers();
  },
  
  methods: {
    // 获取壁纸数据
    async fetchWallpapers() {
      this.loading = true;
      
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
      
      this.fetchWallpapers(); // 重新获取数据
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
    
    // 预览壁纸
    previewWallpaper(wallpaper) {
      this.previewWallpaperData = wallpaper;
      this.selectedResolution = this.extractResolution(wallpaper.url) || '1920x1080';
      this.previewDialogVisible = true;
    },
    
    // 从URL中提取分辨率
    extractResolution(url) {
      const match = url.match(/(\d+)x(\d+)/);
      if (match) {
        return `${match[1]}x${match[2]}`;
      }
      return null;
    },
    
    // 处理分辨率变化
    handleResolutionChange(resolution) {
      if (this.previewWallpaperData) {
        let newUrl;
        if (resolution === 'UHD') {
          newUrl = this.previewWallpaperData.url.replace(/_\d+x\d+/, '_UHD');
        } else {
          newUrl = this.previewWallpaperData.url.replace(/_\d+x\d+/, `_${resolution}`);
        }
        this.previewWallpaperData.url = newUrl;
      }
      
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
    
    // 下载壁纸
    downloadWallpaper(wallpaper) {
      try {
        const link = document.createElement('a');
        link.href = wallpaper.url;
        link.target = '_blank';
        link.download = `bing-wallpaper-${wallpaper.datetime}-${wallpaper.id}.jpg`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.$message.success('开始下载壁纸');
      } catch (error) {
        console.error('下载失败:', error);
        this.$message.error('下载失败，请重试');
      }
    },
    
    // 下载4K壁纸
    download4KWallpaper(wallpaper) {
      try {
        const link = document.createElement('a');
        const url4K = wallpaper.url.replace(/_\d+x\d+/, '_UHD');
        link.href = url4K;
        link.target = '_blank';
        link.download = `bing-wallpaper-4K-${wallpaper.datetime}-${wallpaper.id}.jpg`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.$message.success('开始下载4K壁纸');
      } catch (error) {
        console.error('下载失败:', error);
        this.$message.error('下载失败，请重试');
      }
    },
    
    // 打开原图
    openOriginalImage() {
      if (this.previewWallpaperData) {
        window.open(this.previewWallpaperData.url, '_blank');
      }
    },
    
    // 复制图片链接
    copyImageUrl() {
      if (this.previewWallpaperData) {
        const url = this.previewWallpaperData.url;
        
        // 使用原生 Clipboard API
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(() => {
            this.$message.success('图片链接已复制到剪贴板');
          }).catch(() => {
            this.fallbackCopyText(url);
          });
        } else {
          // 降级方案
          this.fallbackCopyText(url);
        }
      }
    },
    
    // 降级复制方案
    fallbackCopyText(text) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          this.$message.success('图片链接已复制到剪贴板');
        } else {
          this.$message.warning('复制失败，请手动复制链接');
        }
      } catch (err) {
        console.error('复制失败:', err);
        this.$message.warning('复制失败，请手动复制链接');
      }
      
      document.body.removeChild(textarea);
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
        
        const downloadPromises = this.filteredWallpapers.map(async (wallpaper, index) => {
          try {
            const response = await fetch(wallpaper.url);
            const blob = await response.blob();
            
            // 格式化日期
            const date = wallpaper.datetime ? wallpaper.datetime.slice(0, 10) : new Date().toISOString().slice(0, 10);
            
            // 使用API的title作为文件名
            const filename = `${wallpaper.title}_${date}.jpg`;
            folder.file(filename, blob);
            
            loadedCount++;
            this.downloadProgress = Math.round((loadedCount / totalCount) * 100);
          } catch (error) {
            console.error(`下载壁纸 ${wallpaper.id} 失败:`, error);
          }
        });
        
        await Promise.all(downloadPromises);
        
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
  width: 100%;
  padding-top: 56.25%; /* 16:9 比例 */
  overflow: hidden;
  cursor: pointer;
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

/* 预览对话框样式 */
.preview-dialog /deep/ .el-dialog {
  border-radius: 12px;
  overflow: hidden;
}

.preview-dialog /deep/ .el-dialog__header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 16px 24px;
}

.preview-dialog /deep/ .el-dialog__title {
  color: #fff;
  font-size: 18px;
}

.preview-dialog /deep/ .el-dialog__headerbtn .el-dialog__close {
  color: #fff;
}

.preview-dialog /deep/ .el-dialog__body {
  padding: 0;
}

.preview-container {
  display: flex;
  flex-direction: column;
}

.preview-image-wrapper {
  background: #000;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  max-height: 60vh;
  overflow: hidden;
}

.preview-image {
  max-width: 100%;
  max-height: 60vh;
}

.preview-info {
  padding: 24px;
  background: #fff;
}

.preview-title {
  font-size: 20px;
  color: #303133;
  margin-bottom: 16px;
  font-weight: 600;
}

.preview-copyright,
.preview-date {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.preview-copyright .label,
.preview-date .label {
  color: #909399;
  margin-right: 8px;
}

.preview-copyright .content {
  color: #303133;
}

/* 分辨率选择器 */
.resolution-selector {
  margin: 20px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.resolution-selector .label {
  color: #606266;
  font-size: 14px;
  white-space: nowrap;
}

/* 预览操作按钮 */
.preview-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 16px;
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
  
  /* 预览对话框 */
  .preview-dialog /deep/ .el-dialog {
    width: 95% !important;
    margin: 0 auto;
  }
  
  .preview-dialog /deep/ .el-dialog__body {
    padding: 12px;
  }
  
  .preview-image-wrapper {
    min-height: 300px;
    max-height: 50vh;
  }
  
  .preview-info {
    padding: 16px 12px;
  }
  
  .preview-title {
    font-size: 18px;
  }
  
  .preview-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .preview-actions .el-button {
    width: 100%;
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
  
  /* 空状态 */
  .empty-state {
    padding: 40px 20px;
  }
  
  .empty-state /deep/ .el-empty__description {
    font-size: 14px;
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
