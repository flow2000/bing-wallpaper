<template>
  <div class="app-container">
    <!-- 顶部导航栏 -->
    <header class="header" role="banner">
      <div class="header-content">
        <div class="logo-section">
          <a href="/index.html" class="logo-link" @click.prevent="refreshPage" :aria-label="$t('common.bingWallpaper')">
            <i class="iconfont icon-Bing" aria-hidden="true"></i>
            <span class="logo-text">{{ $t('common.bingWallpaper') }}</span>
          </a>
        </div>
        
        <!-- 桌面端菜单 -->
        <nav class="desktop-menu" role="navigation" :aria-label="$t('common.bingWallpaper')">
          <el-menu 
            :default-active="activeIndex" 
            mode="horizontal" 
            @select="handleSelect" 
            router
            class="nav-menu"
          >
            <el-menu-item index="/index.html">
              <i class="iconfont icon-home" aria-hidden="true"></i>
              <span slot="title">{{ $t('common.home') }}</span>
            </el-menu-item>
            
            <el-menu-item index="/about.html">
              <i class="iconfont icon-guanyu" aria-hidden="true"></i>
              <span slot="title">{{ $t('common.about') }}</span>
            </el-menu-item>
            
            <el-menu-item index="/blog">
              <a href="https://blog.aqcoder.cn" target="_blank" rel="noopener" class="external-link">
                <i class="iconfont icon-bokeyuan" aria-hidden="true"></i>
                <span slot="title">{{ $t('common.blog') }}</span>
              </a>
            </el-menu-item>
          </el-menu>
        </nav>
        
        <!-- 语言切换 + 移动端菜单 -->
        <div class="header-right">
          <!-- 语言切换 -->
          <el-dropdown trigger="click" class="lang-dropdown" @command="handleLangChange">
            <span class="lang-dropdown-link">
              <i class="el-icon-earth" aria-hidden="true"></i>
              <span class="lang-label">{{ currentLangLabel }}</span>
              <i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="zh-CN" :class="{ 'is-active': currentLocale === 'zh-CN' }">
                中文
              </el-dropdown-item>
              <el-dropdown-item command="en-US" :class="{ 'is-active': currentLocale === 'en-US' }">
                English
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>

          <!-- 移动端菜单按钮 -->
          <el-dropdown trigger="click" class="mobile-menu-dropdown" @command="handleMobileMenuCommand">
            <span class="el-dropdown-link" tabindex="0" :aria-label="$t('common.openMenu')">
              <i class="el-icon-menu" aria-hidden="true"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="/index.html">
                <i class="iconfont icon-home" aria-hidden="true"></i>
                {{ $t('common.home') }}
              </el-dropdown-item>
              <el-dropdown-item command="/about.html">
                <i class="iconfont icon-guanyu" aria-hidden="true"></i>
                {{ $t('common.about') }}
              </el-dropdown-item>
              <el-dropdown-item>
                <a href="https://blog.aqcoder.cn" target="_blank" rel="noopener" class="external-link">
                  <i class="iconfont icon-bokeyuan" aria-hidden="true"></i>
                  {{ $t('common.blog') }}
                </a>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
    </header>
    
    <!-- 主内容区域 -->
    <main class="main-content" role="main">
      <router-view></router-view>
    </main>
    
    <!-- 底部版权信息 -->
    <footer class="footer" role="contentinfo">
      <div class="footer-content">
        <span class="footer-item">
          <i class="el-icon-picture" aria-hidden="true"></i>
          <span>{{ $t('common.copyright') }}</span>
        </span>
        <span class="divider" aria-hidden="true">|</span>
        <span class="footer-item">
          <i class="el-icon-user" aria-hidden="true"></i>
          <span v-html="$t('common.visitorCount', { count: visitorCountHtml })"></span>
        </span>
        <span class="divider" aria-hidden="true">|</span>
        <span class="footer-item">
          <i class="el-icon-star-off" aria-hidden="true"></i>
          <span>{{ $t('common.footerCopyright', { year: currentYear }) }}
            <a target="_blank" href="https://blog.aqcoder.cn" rel="noopener" class="stats-link">
              <i class="el-icon-link">枫叶</i>
            </a>
          </span>
          <a target="_blank" href="https://v6.51.la/s/W8n3xjD4r3Vjfl6" rel="noopener" class="stats-link">
            <img src="https://sdk.51.la/icon/1-1.png" alt="51la" class="stats-icon">
          </a>
        </span>
      </div>
    </footer>
  </div>
</template>

<script>
import { setLocale, getLocale } from '@/locale'

export default {
  name: 'App',
  data() {
    return {
      activeIndex: '/',
      currentYear: new Date().getFullYear(),
      visitorCount: '---'
    };
  },
  computed: {
    currentLocale() {
      return this.$i18n.locale
    },
    currentLangLabel() {
      return this.currentLocale === 'zh-CN' ? '中文' : 'EN'
    },
    visitorCountHtml() {
      return '<span id="busuanzi_value_site_uv" class="highlight">' + this.visitorCount + '</span>'
    }
  },
  mounted() {
    this.initVisitorCount();
  },
  methods: {
    handleSelect(key, keyPath) {
      if (key !== this.$route.path) {
        this.$router.push(key);
      }
    },
    
    handleMobileMenuCommand(command) {
      if (command && command !== this.$route.path) {
        this.$router.push(command);
      }
    },
    
    handleLangChange(lang) {
      setLocale(lang)
    },
    
    refreshPage() {
      window.location.reload();
    },
    
    initVisitorCount() {
      try {
        if (document.getElementById('busuanzi_value_site_uv')) {
          const checkBusuanzi = setInterval(() => {
            if (window._hmt) {
              clearInterval(checkBusuanzi);
            }
          }, 1000);
        }
      } catch (error) {
        // visitor count loading
      }
    }
  }
};
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f7fa;
  overflow-x: hidden;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 头部样式 */
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  padding: 0;
  height: 60px !important;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.logo-section {
  display: flex;
  align-items: center;
}

.logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  transition: transform 0.3s ease;
}

.logo-link:hover {
  transform: scale(1.05);
}

.logo-link .icon-Bing {
  font-size: 32px;
  margin-right: 8px;
}

.logo-text {
  background: linear-gradient(90deg, #fff, #e0e0e0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-menu {
  background: transparent !important;
  border-bottom: none !important;
  display: flex;
  align-items: center;
}

.nav-menu .el-menu-item,
.nav-menu .el-submenu__title {
  color: rgba(255, 255, 255, 0.85) !important;
  height: 60px;
  line-height: 60px;
  transition: all 0.3s ease;
}

.nav-menu .el-menu-item:hover,
.nav-menu .el-submenu__title:hover {
  background: rgba(255, 255, 255, 0.15) !important;
  color: #fff !important;
}

.nav-menu .el-menu-item.is-active {
  background: rgba(255, 255, 255, 0.2) !important;
  color: #fff !important;
  border-bottom-color: #fff !important;
}

.nav-menu .el-submenu .el-menu {
  background: #fff !important;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.nav-menu .el-submenu .el-menu-item {
  color: #606266 !important;
  height: 44px;
  line-height: 44px;
}

.nav-menu .el-submenu .el-menu-item:hover {
  background: #f5f7fa !important;
  color: #667eea !important;
}

.external-link {
  color: inherit;
  text-decoration: none;
}

/* Header right section */
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Language switcher */
.lang-dropdown {
  cursor: pointer;
}

.lang-dropdown-link {
  display: flex;
  align-items: center;
  gap: 4px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.15);
  transition: all 0.3s ease;
  white-space: nowrap;
}

.lang-dropdown-link:hover {
  background: rgba(255, 255, 255, 0.25);
}

.lang-dropdown-link .el-icon-earth {
  font-size: 18px;
}

.lang-label {
  font-size: 13px;
}

.lang-dropdown-menu .el-dropdown-menu__item.is-active {
  color: #667eea;
  font-weight: 600;
}

/* 移动端菜单样式 */
.mobile-menu-dropdown {
  display: none;
}

.el-dropdown-link {
  color: #fff;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  transition: transform 0.3s ease;
}

.el-dropdown-link:hover {
  transform: scale(1.1);
}

.el-dropdown-menu {
  min-width: 150px;
}

.el-dropdown-menu .el-dropdown-menu__item {
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.el-dropdown-menu .el-dropdown-menu__item i {
  font-size: 16px;
  color: #667eea;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  padding: 24px;
  background-color: #f5f7fa;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}

/* 底部样式 */
.footer {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: rgba(255, 255, 255, 0.8);
  padding: 20px 20px;
  text-align: center;
  overflow: hidden;
}

.footer-content {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  max-width: 100%;
  width: 100%;
}

.footer-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.footer-item i {
  font-size: 16px;
  color: rgba(255, 255, 255, 1);
}

.divider {
  margin: 0 12px;
  color: rgba(255, 255, 255, 0.4);
}

.highlight {
  color: #f39c12;
  font-weight: bold;
  margin: 0 4px;
}

.stats-link {
  display: inline-block;
  vertical-align: middle;
  margin-left: 8px;
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.stats-link:hover {
  opacity: 1;
}

.stats-icon {
  width: 16px;
  height: 16px;
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .header-content {
    padding: 0 12px;
  }
  
  .logo-text {
    font-size: 16px;
  }
  
  .desktop-menu {
    display: none;
  }
  
  .mobile-menu-dropdown {
    display: block;
  }
  
  .main-content {
    padding: 12px;
  }
  
  .footer-content {
    gap: 12px;
  }
  
  .footer-item {
    font-size: 12px;
  }
  
  .footer-item i {
    font-size: 14px;
  }
  
  .divider {
    margin: 0 8px;
  }
}

@media screen and (max-width: 480px) {
  .header-content {
    padding: 0 8px;
    min-height: 60px;
    display: flex;
    align-items: center;
  }

  .main-content {
    padding: 8px;
  }
  
  .logo-section {
    margin-right: 8px;
    flex-shrink: 0;
  }
  
  .logo-text {
    display: block;
    font-size: 14px;
  }
  
  .logo-link .icon-Bing {
    font-size: 28px;
    display: block;
  }
  
  .el-dropdown-link {
    font-size: 20px;
    padding: 6px;
  }

  .lang-label {
    display: none;
  }

  .lang-dropdown-link {
    padding: 8px;
  }
  
  .footer-content {
    flex-direction: column;
    gap: 8px;
    padding: 0 10px;
  }
  
  .footer-item {
    font-size: 12px;
    white-space: normal;
    text-align: center;
  }
  
  .divider {
    display: none;
  }
}

@media screen and (max-width: 375px) {
  .header-content {
    padding: 0 6px;
  }

  .main-content {
    padding: 6px;
  }
  
  .logo-link .icon-Bing {
    font-size: 24px;
  }
  
  .el-dropdown-link {
    font-size: 18px;
    padding: 4px;
  }
  
  .footer {
    padding: 16px 10px;
  }
  
  .footer-content {
    gap: 6px;
  }
  
  .footer-item {
    font-size: 11px;
  }
}

/* 移动端下拉菜单优化 */
.el-dropdown-menu {
  border: none;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border-radius: 12px;
  padding: 8px 0;
}

.el-dropdown-menu__item {
  font-size: 14px;
  color: #606266;
  transition: all 0.3s ease;
}

.el-dropdown-menu__item:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.el-dropdown-menu__item i {
  margin-right: 8px;
}

.el-dropdown-menu__item a {
  color: inherit;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 移动端优化 */
@media screen and (max-width: 768px) {
  .header {
    height: 56px !important;
  }
  
  .header-content {
    height: 56px;
  }
  
  .logo-link {
    font-size: 18px;
  }
  
  .logo-link .icon-Bing {
    font-size: 28px;
  }
  
  .el-dropdown-link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.15);
    transition: all 0.3s ease;
  }
  
  .el-dropdown-link:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: scale(1.05);
  }
  
  .el-dropdown-link:active {
    transform: scale(0.95);
  }
}

/* Element UI 覆盖样式 */
.el-menu--horizontal > .el-menu-item {
  border-bottom: none !important;
}

.el-menu--horizontal > .el-submenu .el-submenu__title {
  border-bottom: none !important;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
