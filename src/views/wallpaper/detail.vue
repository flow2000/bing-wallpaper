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
              <a 
                v-if="wallpaperData.copyrightlink" 
                :href="wallpaperData.copyrightlink" 
                target="_blank"
                class="copyright-link"
              >
                <i class="el-icon-link"></i>
                查看来源
              </a>
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
    
    <!-- 提示消息 -->
    <el-message 
      v-if="message.show" 
      :type="message.type" 
      :closable="false"
      class="custom-message"
    >
      {{ message.text }}
    </el-message>
  </div>
</template>

<script>
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
      
      // 消息提示
      message: {
        show: false,
        type: 'success',
        text: ''
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
    }
  },
  
  mounted() {
    this.loadWallpaperDetail();
  },
  
  methods: {
    // 加载壁纸详情
    async loadWallpaperDetail() {
      this.loading = true;
      this.errorMessage = '';
      
      try {
        // 从路由参数获取壁纸ID
        const wallpaperId = this.$route.params.id;
        
        if (!wallpaperId) {
          throw new Error('缺少壁纸ID参数');
        }
        
        // 调用API获取壁纸详情
        const response = await this.$axios.get(`https://api.bimg.cc/detail?id=${wallpaperId}`);
        
        if (response.data && response.data.code === 200) {
          this.wallpaperData = response.data.data;
          
          // 从URL中提取当前分辨率
          if (this.wallpaperData.url) {
            const match = this.wallpaperData.url.match(/(\d+)x(\d+)/);
            if (match) {
              this.currentResolution = `${match[1]}x${match[2]}`;
            }
          }
        } else {
          throw new Error((response.data && response.data.msg) || '获取壁纸详情失败');
        }
      } catch (error) {
        console.error('加载壁纸详情失败:', error);
        this.errorMessage = error.message || '网络连接异常，请检查网络后重试';
        
        // 如果没有ID参数，可以尝试使用传递的数据
        const passedData = this.$route.query.data;
        if (passedData) {
          try {
            this.wallpaperData = JSON.parse(decodeURIComponent(passedData));
            const match = this.wallpaperData.url.match(/(\d+)x(\d+)/);
            if (match) {
              this.currentResolution = `${match[1]}x${match[2]}`;
            }
            this.errorMessage = '';
          } catch (e) {
            console.error('解析传递数据失败:', e);
          }
        }
      } finally {
        this.loading = false;
      }
    },
    
    // 重新加载
    retryLoad() {
      this.loadWallpaperDetail();
    },
    
    // 返回列表
    goBack() {
      this.$router.go(-1);
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
      
      this.$copyText(this.currentImageUrl).then(() => {
        this.showMessage('图片链接已复制到剪贴板', 'success');
      }).catch(() => {
        // 降级方案：使用传统方式复制
        const textArea = document.createElement('textarea');
        textArea.value = this.currentImageUrl;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
          document.execCommand('copy');
          this.showMessage('图片链接已复制到剪贴板', 'success');
        } catch (err) {
          this.showMessage('复制失败，请手动复制链接', 'warning');
        }
        
        document.body.removeChild(textArea);
      });
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
      
      this.$copyText(shareUrl).then(() => {
        this.showMessage('分享链接已复制', 'success');
      }).catch(() => {
        this.showMessage('复制失败，请手动复制', 'warning');
      });
    },
    
    // 显示消息提示
    showMessage(text, type = 'success') {
      this.message = {
        show: true,
        type,
        text
      };
      
      // 3秒后隐藏消息
      setTimeout(() => {
        this.message.show = false;
      }, 3000);
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
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px dashed #ebeef5;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
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

/* 分辨率网格 */
.resolution-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.resolution-btn {
  min-width: 90px;
  text-align: center;
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
}

.quick-actions .el-button {
  width: 100%;
}

/* 分享按钮 */
.share-buttons {
  display: flex;
  gap: 12px;
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

/* 自定义消息 */
.custom-message {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 9999;
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
