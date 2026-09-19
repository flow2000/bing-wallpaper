<template>
  <div class="detail-container">
    <!-- 返回按钮 -->
    <div class="back-nav">
      <el-button 
        type="primary" 
        icon="el-icon-arrow-left" 
        @click="goBack"
        class="back-btn"
      >
        返回列表
      </el-button>
    </div>
    
    <!-- 壁纸详情展示 -->
    <el-card class="wallpaper-detail-card" shadow="hover" v-if="wallpaperData">
      <div class="detail-content">
        <!-- 壁纸图片展示区域 -->
        <div class="image-showcase">
          <div class="image-wrapper">
            <el-image 
              :src="currentImageUrl" 
              :alt="wallpaperData.title"
              fit="contain"
              class="detail-image"
              :key="currentImageUrl"
            >
              <div slot="placeholder" class="image-placeholder">
                <i class="el-icon-loading"></i>
                <span>正在加载图片...</span>
              </div>
              <div slot="error" class="image-error">
                <i class="el-icon-picture-outline"></i>
                <span>图片加载失败</span>
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
                查看原图
              </el-button>
              <el-button 
                type="success" 
                icon="el-icon-download"
                @click="downloadWallpaper"
              >
                下载壁纸
              </el-button>
              <el-button 
                type="warning" 
                icon="el-icon-link"
                @click="copyImageUrl"
              >
                复制链接
              </el-button>
            </el-button-group>
          </div>
        </div>
        
        <!-- 壁纸信息面板 -->
        <div class="info-panel">
          <!-- 标题 -->
          <div class="info-section">
            <h1 class="wallpaper-title">{{ wallpaperData.title }}</h1>
          </div>
          
          <!-- 基本信息 -->
          <div class="info-section">
            <div class="info-item">
              <span class="info-label">
                <i class="el-icon-date"></i>
                发布日期
              </span>
              <span class="info-value">{{ wallpaperData.datetime }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">
                <i class="el-icon-document"></i>
                图片格式
              </span>
              <span class="info-value">JPG</span>
            </div>
            <div class="info-item">
              <span class="info-label">
                <i class="el-icon-picture"></i>
                当前分辨率
              </span>
              <span class="info-value highlight">{{ currentResolution }}</span>
            </div>
          </div>
          
          <!-- 版权信息 -->
          <div class="info-section copyright-section">
            <h3 class="section-title">版权信息</h3>
            <div class="copyright-content">
              <p class="copyright-text">{{ wallpaperData.copyright }}</p>
              <el-divider class="link-divider"></el-divider>
              <div class="copyright-links">
                <a 
                  v-if="wallpaperData.copyrightlink" 
                  :href="wallpaperData.copyrightlink" 
                  target="_blank"
                  rel="noopener noreferrer"
                  class="copyright-link"
                >
                  <i class="el-icon-link"></i>
                  查看来源
                </a>
                <a 
                  :href="wallpaperData.url" 
                  target="_blank"
                  rel="noopener noreferrer"
                  class="copyright-link"
                >
                  <i class="el-icon-picture-outline"></i>
                  打开原图
                </a>
              </div>
            </div>
          </div>
          
          <!-- 分辨率选择 -->
          <div class="info-section">
            <h3 class="section-title">切换分辨率</h3>
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
          
          <!-- 快捷操作 -->
          <div class="info-section actions-section">
            <h3 class="section-title">快捷操作</h3>
            <div class="quick-actions">
              <el-button 
                type="primary" 
                plain 
                icon="el-icon-set-up"
                @click="setAsDesktopBackground"
              >
                设为桌面壁纸
              </el-button>
              <el-button 
                type="success" 
                plain 
                icon="el-icon-star-off"
                @click="addToFavorites"
              >
                收藏此壁纸
              </el-button>
            </div>
          </div>
          
          <!-- 分享功能 -->
          <div class="info-section share-section">
            <h3 class="section-title">分享给朋友</h3>
            <div class="share-buttons">
              <el-button 
                circle 
                type="success" 
                icon="el-icon-chat-dot-round"
                @click="shareToSocial('wechat')"
                title="分享到微信"
              >
              </el-button>
              <el-button 
                circle 
                type="info" 
                icon="el-icon-chat-line-round"
                @click="shareToSocial('weibo')"
                title="分享到微博"
              >
              </el-button>
              <el-button 
                circle 
                type="primary" 
                icon="el-icon-link"
                @click="copyShareLink"
                title="复制分享链接"
              >
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </el-card>
    
    <!-- 加载状态 -->
    <div v-else-if="loading" class="loading-container">
      <el-card class="loading-card">
        <div class="loading-content">
          <i class="el-icon-loading loading-icon"></i>
          <p class="loading-text">正在加载壁纸详情...</p>
        </div>
      </el-card>
    </div>
    
    <!-- 错误状态 -->
    <div v-else class="error-container">
      <el-card class="error-card">
        <div class="error-content">
          <i class="el-icon-warning-outline error-icon"></i>
          <h2 class="error-title">加载失败</h2>
          <p class="error-message">{{ errorMessage }}</p>
          <el-button type="primary" @click="retryLoad">重新加载</el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { updateSEO, setWallpaperJsonLd } from '@/utils/seo';

export default {
  name: 'WallpaperDetail',
  data() {
    return {
      // 壁纸数据
      wallpaperData: null,
      
      // 加载状态
      loading: true,
      
      // 错误信息
      errorMessage: '',
      
      // 当前分辨率
      currentResolution: '1920x1080',
      
      // 壁纸所属地区
      regionCode: '',
      regionName: '',
      
      // 地区代码与名称映射
      regionMap: {
        'zh-CN': '中国',
        'de-DE': '德国',
        'en-CA': '加拿大',
        'en-GB': '英国',
        'en-IN': '印度',
        'en-US': '美国',
        'fr-FR': '法国',
        'it-IT': '意大利',
        'ja-JP': '日本'
      },
      
      // 已知分辨率配置
      resolutions: [
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
    // 当前图片URL
    currentImageUrl() {
      if (!this.wallpaperData) return '';
      
      // 从URL中提取分辨率并替换
      return this.wallpaperData.url.replace(
        /\d+x\d+/,
        this.currentResolution
      );
    },
    
    // 地区列表页链接（返回该地区的壁纸列表）
    regionListUrl() {
      if (!this.regionCode) return '/';
      return `/region/${this.regionCode}`;
    }
  },
  
  mounted() {
    this.loadWallpaperDetail();
    window.scrollTo(0, 0);
  },

  watch: {
    // 同一路由不同 ID 导航时（如从一个详情页跳到另一个详情页），
    // Vue 会复用组件实例，mounted 不会再次触发，需监听路由参数变化重新加载
    '$route.params.id'(newId, oldId) {
      if (newId && newId !== oldId) {
        this.loadWallpaperDetail();
        window.scrollTo(0, 0);
      }
    }
  },

  methods: {
    // 加载壁纸详情：从路由 query 读取地区，调用 /all 接口按地区+ID 获取数据
    async loadWallpaperDetail() {
      this.loading = true;
      this.errorMessage = '';

      const wallpaperId = this.$route.params.id;
      if (!wallpaperId) {
        this.errorMessage = '缺少壁纸ID参数';
        this.loading = false;
        return;
      }

      // 从路由 query 读取地区（由列表页跳转时传入）
      const region = this.$route.query.region || '';

      try {
        const PAGE_SIZE = 100;
        const targetId = Number(wallpaperId);

        // 构建请求参数（含地区 mkt）
        const buildParams = (page) => {
          const p = { page, limit: PAGE_SIZE, order: 'desc' };
          if (region) p.mkt = region;
          return p;
        };

        // 先拉第一页，同时拿到 total 和前 100 条数据
        const firstResp = await this.$axios.get('https://api.bimg.cc/all', {
          params: buildParams(1)
        });

        if (!firstResp.data || firstResp.data.code !== 200) {
          throw new Error((firstResp.data && firstResp.data.msg) || '获取壁纸详情失败');
        }

        const total = firstResp.data.total || 0;
        const firstList = firstResp.data.data || [];

        // 先在第一页查找
        let found = firstList.find(w => String(w.id) === String(wallpaperId));
        if (found) {
          this.setWallpaperData(found);
          return;
        }

        // 不在第一页，根据 id 连续递增特性估算目标页
        const position = total - targetId + 1;
        const estimatedPage = Math.max(2, Math.ceil(position / PAGE_SIZE));

        const pageResp = await this.$axios.get('https://api.bimg.cc/all', {
          params: buildParams(estimatedPage)
        });

        if (pageResp.data && pageResp.data.code === 200) {
          const list = pageResp.data.data || [];
          found = list.find(w => String(w.id) === String(wallpaperId));

          // 若因 id 存在跳号导致估算页未命中，尝试前后各一页
          if (!found) {
            for (const p of [estimatedPage - 1, estimatedPage + 1]) {
              if (p < 1) continue;
              const resp = await this.$axios.get('https://api.bimg.cc/all', {
                params: buildParams(p)
              });
              if (resp.data && resp.data.code === 200) {
                found = (resp.data.data || []).find(w => String(w.id) === String(wallpaperId));
                if (found) break;
              }
            }
          }

          if (found) {
            this.setWallpaperData(found);
          } else {
            this.errorMessage = '未找到该壁纸';
          }
        } else {
          this.errorMessage = '获取壁纸详情失败';
        }
      } catch (error) {
        console.error('加载壁纸详情失败:', error);
        this.errorMessage = error.message || '网络连接异常，请检查网络后重试';
      } finally {
        this.loading = false;
      }
    },

    // 设置壁纸数据并更新分辨率、地区与 SEO
    setWallpaperData(wallpaper) {
      this.wallpaperData = wallpaper;
      if (wallpaper.url) {
        const match = wallpaper.url.match(/(\d+)x(\d+)/);
        if (match) {
          this.currentResolution = `${match[1]}x${match[2]}`;
        }
      }
      this.resolveRegion(wallpaper);
      this.applyDetailSEO(wallpaper);
    },

    // 解析壁纸所属地区：优先从路由 query 读取，其次从壁纸 URL 中提取
    resolveRegion(wallpaper) {
      let code = this.$route.query.region || '';
      // 回退：从壁纸 URL 中提取地区代码（如 _ZH-CN5896237112 → ZH-CN）
      if (!code && wallpaper.url) {
        const match = wallpaper.url.match(/_([A-Z]{2}-[A-Z]{2})\d+/);
        if (match) {
          // 转换为标准格式：语言小写-国家大写（如 zh-CN）
          const parts = match[1].split('-');
          code = `${parts[0].toLowerCase()}-${parts[1].toUpperCase()}`;
        }
      }
      // 在 regionMap 中查找（不区分大小写），同时标准化 code
      if (code) {
        const lowerKey = code.toLowerCase();
        const foundKey = Object.keys(this.regionMap).find(k => k.toLowerCase() === lowerKey);
        if (foundKey) {
          this.regionCode = foundKey;
          this.regionName = this.regionMap[foundKey];
          return;
        }
      }
      this.regionCode = '';
      this.regionName = '';
    },
    
    // 重新加载
    retryLoad() {
      this.loadWallpaperDetail();
    },

    // 动态更新详情页 SEO：title/description/canonical + 壁纸结构化数据
    applyDetailSEO(wallpaper) {
      if (!wallpaper) return;
      const regionPart = this.regionName ? `${this.regionName}必应壁纸，` : '';
      const title = `${wallpaper.title} - ${regionPart}必应壁纸高清下载`;
      const description = `${wallpaper.title}。${wallpaper.copyright || ''} 发布于${wallpaper.datetime}${this.regionName ? `，来自${this.regionName}地区` : ''}。必应壁纸提供4K、1920x1080等多种分辨率免费下载。`;
      const keywords = [
        wallpaper.title,
        this.regionName ? `${this.regionName}必应壁纸` : '必应壁纸',
        this.regionName ? `${this.regionName}壁纸` : '',
        '高清壁纸下载',
        'bing wallpaper',
        wallpaper.datetime
      ].filter(Boolean).join(',');
      updateSEO({
        title,
        description,
        path: `/wallpaper/detail/${wallpaper.id}`,
        image: wallpaper.url,
        type: 'article',
        keywords
      });
      setWallpaperJsonLd(wallpaper, this.regionCode, this.regionName);
    },
    
    // 返回列表：优先返回上一页，无历史记录时返回首页
    goBack() {
      if (window.history.length > 1) {
        this.$router.go(-1);
      } else {
        this.$router.push('/');
      }
    },
    
    // 切换分辨率
    changeResolution(resolution) {
      this.currentResolution = resolution;
      this.showMessage('分辨率已切换为 ' + resolution, 'success');
    },
    
    // 打开原图
    openOriginalImage() {
      if (this.wallpaperData) {
        window.open(this.wallpaperData.url, '_blank');
      }
    },
    
    // 下载壁纸
    downloadWallpaper() {
      if (!this.wallpaperData) return;
      
      const link = document.createElement('a');
      link.href = this.currentImageUrl;
      link.download = `bing-wallpaper-${this.wallpaperData.datetime}-${this.wallpaperData.id}.jpg`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      this.showMessage('开始下载壁纸', 'success');
    },
    
    // 复制图片链接
    copyImageUrl() {
      if (!this.wallpaperData) return;
      this.copyToClipboard(this.currentImageUrl, '图片链接已复制到剪贴板');
    },
    
    // 设为桌面壁纸
    setAsDesktopBackground() {
      this.showMessage('右键点击图片选择"设置为桌面背景"即可', 'info');
    },
    
    // 收藏壁纸
    addToFavorites() {
      const favorites = JSON.parse(localStorage.getItem('wallpaperFavorites') || '[]');
      
      if (this.wallpaperData) {
        // 检查是否已收藏
        const exists = favorites.some(item => item.id === this.wallpaperData.id);
        
        if (exists) {
          this.showMessage('该壁纸已收藏过', 'warning');
        } else {
          favorites.push({
            ...this.wallpaperData,
            addTime: new Date().toISOString()
          });
          localStorage.setItem('wallpaperFavorites', JSON.stringify(favorites));
          this.showMessage('壁纸收藏成功', 'success');
        }
      }
    },
    
    // 分享到社交媒体
    shareToSocial(platform) {
      if (!this.wallpaperData) return;
      
      const shareUrl = encodeURIComponent(window.location.href);
      const shareTitle = encodeURIComponent(`必应壁纸：${this.wallpaperData.title}`);
      const shareContent = encodeURIComponent(this.wallpaperData.copyright);
      
      let url = '';
      
      switch (platform) {
        case 'wechat':
          this.showMessage('请使用微信扫码分享', 'info');
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
    
    // 复制分享链接
    copyShareLink() {
      if (!this.wallpaperData) return;
      const shareUrl = `${window.location.origin}/wallpaper/detail/${this.wallpaperData.id}`;
      this.copyToClipboard(shareUrl, '分享链接已复制');
    },

    // 通用复制到剪贴板（原生 API + execCommand 降级）
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
        this.showMessage(ok ? successMsg : '复制失败，请手动复制', ok ? 'success' : 'warning');
      } catch (err) {
        this.showMessage('复制失败，请手动复制', 'warning');
      }
      document.body.removeChild(textarea);
    },
    
    // 显示消息提示（使用 Element UI 的 $message 服务）
    showMessage(text, type = 'success') {
      if (this.$message) {
        this.$message({ message: text, type, showClose: false, duration: 3000 });
      }
    }
  }
};
</script>

<style scoped>
/* 容器样式 */
.detail-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

/* 返回导航 */
.back-nav {
  margin-bottom: 20px;
}

.back-btn {
  transition: all 0.3s ease;
}

.back-btn:hover {
  transform: translateX(-4px);
}

/* 详情卡片 */
.wallpaper-detail-card {
  border-radius: 12px;
  overflow: hidden;
}

.detail-content {
  display: flex;
  gap: 32px;
}

/* 图片展示区域 */
.image-showcase {
  flex: 1;
  min-width: 0;
}

.image-wrapper {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
}

.detail-image {
  width: 100%;
  min-height: 400px;
  max-height: 600px;
  display: block;
}

.image-placeholder,
.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 400px;
  color: #909399;
  font-size: 16px;
}

.image-placeholder i,
.image-error i {
  font-size: 48px;
  margin-bottom: 16px;
}

.image-error {
  color: #f56c6c;
}

/* 图片操作按钮 */
.image-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

/* 信息面板 */
.info-panel {
  width: 360px;
  flex-shrink: 0;
}

/* 信息区块 */
.info-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #ebeef5;
}

.info-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

/* 壁纸标题 */
.wallpaper-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
  margin: 0;
}

/* 信息项 */
.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px dashed #ebeef5;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  flex: 0 0 96px;
  color: #909399;
  font-size: 14px;
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
  font-size: 14px;
  font-weight: 500;
}

.info-value.highlight {
  color: #409eff;
  font-size: 16px;
}

/* 区块标题 */
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
  padding-left: 12px;
  border-left: 4px solid #409eff;
}

/* 版权信息 */
.copyright-content {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
}

.copyright-text {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin: 0 0 12px 0;
}

.copyright-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #409eff;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s ease;
}

.copyright-link:hover {
  color: #66b1ff;
}

/* 链接分隔符 */
.link-divider {
  margin: 12px 0;
  border-top: 1px dashed #dcdfe6;
}

/* 版权链接容器 */
.copyright-links {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}

/* 分辨率网格 */
.resolution-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.resolution-btn {
  width: 88px;
  flex: 0 0 auto;
  text-align: center;
  margin: 0 !important;
}

.resolution-btn.is-active {
  background: #409eff;
  color: #fff;
  border-color: #409eff;
}

/* 快捷操作 */
.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 320px;
}

.quick-actions .el-button {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 0 !important;
}

/* 分享按钮 */
.share-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
}

.share-buttons .el-button {
  margin: 0 !important;
}

/* 加载状态 */
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

/* 错误状态 */
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

/* 响应式设计 */
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
  .detail-container {
    padding: 12px;
  }
  
  .wallpaper-title {
    font-size: 20px;
  }
  
  .resolution-grid {
    justify-content: center;
  }
  
  .image-actions {
    flex-direction: column;
  }
  
  .image-actions .el-button-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .share-buttons {
    justify-content: center;
  }
}
</style>
