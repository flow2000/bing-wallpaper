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
          <div class="image-wrapper" @click="toggleFullscreen">
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
                type="danger"
                icon="el-icon-s-home"
                @click="$router.push('/index.html')"
              >
                返回首页
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
            <el-tooltip content="点击壁纸图片即可全屏查看" placement="top" :open-delay="300">
              <el-button
                type="info"
                icon="el-icon-full-screen"
                @click="toggleFullscreen"
                class="fullscreen-btn"
              >
                查看全屏壁纸
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
                图片介绍
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

          <!-- 版权与日期 -->
          <div class="info-section">
            <div class="info-item">
              <span class="info-label">
                <i class="el-icon-document"></i>
                版权信息
              </span>
              <span class="info-value">{{ copyrightInfo }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">
                <i class="el-icon-date"></i>
                发布日期
              </span>
              <span class="info-value">{{ wallpaperData.datetime }}</span>
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
        </div>
      </div>
    </el-card>

    <!-- 推荐壁纸 -->
    <div class="recommend-section" v-if="wallpaperData && recommendList.length > 0">
      <h2 class="recommend-title">
        <i class="el-icon-magic-stick"></i>
        推荐壁纸
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
          <h1 class="loading-text">正在加载壁纸详情...</h1>
        </div>
      </el-card>
    </div>
    
    <!-- 错误状态 -->
    <div v-else class="error-container">
      <el-card class="error-card">
        <div class="error-content">
          <i class="el-icon-warning-outline error-icon"></i>
          <h1 class="error-title">加载失败</h1>
          <p class="error-message">{{ errorMessage }}</p>
          <el-button type="primary" @click="retryLoad">重新加载</el-button>
        </div>
      </el-card>
    </div>
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

      // 推荐壁纸列表
      recommendList: [],
      recommendLoading: false,

      // 全屏壁纸模式
      fullscreenMode: false
    };
  },
  
  computed: {
    // 当前图片URL
    currentImageUrl() {
      if (!this.wallpaperData) return '';

      if (this.currentResolution === 'UHD') {
        return this.wallpaperData.url.replace(/_\d+x\d+/, '_UHD');
      }
      // 从URL中提取分辨率并替换
      return this.wallpaperData.url.replace(
        /_\d+x\d+|_UHD/,
        `_${this.currentResolution}`
      );
    },
    
    // 地区列表页链接（返回该地区的壁纸列表）
    regionListUrl() {
      if (!this.regionCode) return '/';
      return `/region/${this.regionCode}.html`;
    },

    // 从 copyright 字段提取图片介绍（去掉括号内的版权部分）
    imageDescription() {
      if (!this.wallpaperData || !this.wallpaperData.copyright) return '';
      return this.wallpaperData.copyright.replace(/\s*\(©[^)]*\)\s*$/, '').trim();
    },

    // 从 copyright 字段提取版权信息（括号内的 © 部分）
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
    // 同一路由不同参数导航时（如从一个详情页跳到另一个详情页），
    // Vue 会复用组件实例，mounted 不会再次触发，需监听路由参数变化重新加载
    '$route.params.regionId'(newVal, oldVal) {
      if (newVal && newVal !== oldVal) {
        this.recommendList = [];
        this.loadWallpaperDetail();
        window.scrollTo(0, 0);
      }
    }
  },

  methods: {
    toggleFullscreen() {
      this.fullscreenMode = !this.fullscreenMode;
    },

    // 加载壁纸详情：用 limit=1 精确定位，根据 ID 估算页码直接拉取单条数据
    async loadWallpaperDetail() {
      this.loading = true;
      this.errorMessage = '';

      // 从 regionId 参数解析地区和 ID（格式如 zh-CN-3849.html）
      const regionId = (this.$route.params.regionId || '').replace(/\.html$/, '');
      const match = regionId.match(/^(.+)-(\d+)$/);
      if (!match) {
        this.errorMessage = '缺少壁纸ID参数';
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

        // 先拉第一页拿到 total
        const firstResp = await this.$axios.get('https://api.bimg.cc/all', {
          params: buildParams(1)
        });

        if (!firstResp.data || firstResp.data.code !== 200) {
          throw new Error((firstResp.data && firstResp.data.msg) || '获取壁纸详情失败');
        }

        const total = firstResp.data.total || 0;
        const firstItem = (firstResp.data.data || [])[0];

        // 第一条就是目标
        if (firstItem && String(firstItem.id) === String(wallpaperId)) {
          this.setWallpaperData(firstItem);
          return;
        }

        // 根据 id 连续递增特性估算位置（desc 排序，最新 id 在前）
        const position = total - targetId + 1;
        if (position < 1 || position > total) {
          this.errorMessage = '未找到该壁纸';
          return;
        }

        // 直接拉取估算页的单条数据
        const resp = await this.$axios.get('https://api.bimg.cc/all', {
          params: buildParams(position)
        });

        if (resp.data && resp.data.code === 200) {
          const item = (resp.data.data || [])[0];
          if (item && String(item.id) === String(wallpaperId)) {
            this.setWallpaperData(item);
            return;
          }

          // ID 存在跳号导致估算偏差，尝试前后各两页
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

          this.errorMessage = '未找到该壁纸';
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

    // 获取推荐壁纸：取同地区最新壁纸，排除当前壁纸
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
        console.error('获取推荐壁纸失败:', error);
      } finally {
        this.recommendLoading = false;
      }
    },

    // 解析壁纸所属地区：优先从路由 params 读取，其次从壁纸 URL 中提取
    resolveRegion(wallpaper) {
      const regionId = (this.$route.params.regionId || '').replace(/\.html$/, '');
      const match = regionId.match(/^(.+)-\d+$/);
      let code = match ? match[1] : '';
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
        path: `/wallpaper/detail/${this.regionCode}-${wallpaper.id}.html`,
        image: wallpaper.url,
        type: 'article',
        keywords
      });
      setWallpaperJsonLd(wallpaper, this.regionCode, this.regionName);
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
      const shareUrl = `${window.location.origin}/wallpaper/detail/${this.regionCode}-${this.wallpaperData.id}.html`;
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
/* 根容器 */
.detail-root {
  min-height: 100vh;
  background-attachment: fixed;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  transition: background-image 0.5s ease;
}

/* 全屏模式 */
.detail-root.fullscreen-mode .detail-container {
  display: none;
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

/* 容器样式 */
.detail-container {
  max-width: 1500px;
  margin: 0 auto;
  padding: 30px;
}

/* 详情卡片 */
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

/* 图片操作按钮 */
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

/* 信息面板 */
.info-panel {
  width: 380px;
  flex-shrink: 0;
}

/* 信息区块 */
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

/* 壁纸标题 */
.wallpaper-title {
  font-size: 26px;
  font-weight: 700;
  color: #303133;
  line-height: 1.4;
  margin: 0;
}

/* 信息项 */
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

/* 区块标题 */
.section-title {
  font-size: 17px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 18px 0;
  padding-left: 12px;
  border-left: 4px solid #409eff;
}

/* 版权链接 */
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

/* 版权链接容器 */
.copyright-links {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
  padding-left: 108px;
  padding-top: 10px;
}

/* 分辨率网格 */
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

/* 推荐壁纸 */
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
    padding: 16px;
  }

  .wallpaper-detail-card .el-card__body {
    padding: 20px;
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

  .copyright-links {
    padding-left: 0;
    padding-top: 8px;
  }
}
</style>
