<template>
  <div class="app-container">
    <!-- 顶部导航栏 -->
    <el-header class="header">
      <div class="header-content">
        <div class="logo-section">
          <a href="/" class="logo-link" @click.prevent="refreshPage">
            <i class="iconfont icon-Bing"></i>
            <span class="logo-text">必应壁纸</span>
          </a>
        </div>
        
        <!-- 桌面端菜单 -->
        <el-menu 
          :default-active="activeIndex" 
          mode="horizontal" 
          @select="handleSelect" 
          router
          class="nav-menu desktop-menu"
        >
          <el-menu-item index="/">
            <i class="iconfont icon-home"></i>
            <span slot="title">首页</span>
          </el-menu-item>
          
          <el-menu-item index="/about">
            <i class="iconfont icon-guanyu"></i>
            <span slot="title">关于</span>
          </el-menu-item>
          
          <el-menu-item index="/blog">
            <a href="https://blog.aqcoder.cn" target="_blank" class="external-link">
              <i class="iconfont icon-bokeyuan"></i>
              <span slot="title">博客</span>
            </a>
          </el-menu-item>
        </el-menu>
        
        <!-- 移动端菜单按钮 -->
        <el-dropdown trigger="click" class="mobile-menu-dropdown" @command="handleMobileMenuCommand">
          <span class="el-dropdown-link">
            <i class="el-icon-menu"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="/">
              <i class="iconfont icon-home"></i>
              首页
            </el-dropdown-item>
            <el-dropdown-item command="/about">
              <i class="iconfont icon-guanyu"></i>
              关于
            </el-dropdown-item>
            <el-dropdown-item>
              <a href="https://blog.aqcoder.cn" target="_blank" class="external-link">
                <i class="iconfont icon-bokeyuan"></i>
                博客
              </a>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-header>
    
    <!-- 主内容区域 -->
    <el-main class="main-content">
      <router-view></router-view>
    </el-main>
    
    <!-- 底部版权信息 -->
    <el-footer class="footer">
      <div class="footer-content">
        <span class="footer-item">
          <i class="el-icon-picture"></i>
          <span>本站所有图片均来自必应搜索</span>
        </span>
        <span class="divider">|</span>
        <span class="footer-item">
          <i class="el-icon-user"></i>
          <span>您是本站第 <span id="busuanzi_value_site_uv" class="highlight">{{ visitorCount }}</span> 个小伙伴</span>
        </span>
        <span class="divider">|</span>
        <span class="footer-item">
          <i class="el-icon-star-off"></i>
          <span>Copyright © 2022 - {{ currentYear }} 
            <a target="_blank" href="https://blog.aqcoder.cn" class="stats-link">
              <i class="el-icon-link">枫叶</i>
            </a>
          </span>
          <a target="_blank" href="https://v6.51.la/s/W8n3xjD4r3Vjfl6" class="stats-link">
            <img src="https://sdk.51.la/icon/1-1.png" alt="51la统计" class="stats-icon">
          </a>
        </span>
      </div>
    </el-footer>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      activeIndex: '/',
      currentYear: new Date().getFullYear(),
      visitorCount: '---',
      // 地区选项配置
      regionOptions: [
        { value: 'de-DE', label: '德国' },
        { value: 'en-CA', label: '加拿大' },
        { value: 'en-GB', label: '英国' },
        { value: 'en-IN', label: '印度' },
        { value: 'en-US', label: '美国' },
        { value: 'fr-FR', label: '法国' },
        { value: 'it-IT', label: '意大利' },
        { value: 'ja-JP', label: '日本' },
        { value: 'zh-CN', label: '中国' }
      ]
    };
  },
  mounted() {
    this.initVisitorCount();
  },
  methods: {
    handleSelect(key, keyPath) {
      console.log('导航选择:', key, keyPath);
      if (key !== this.$route.path) {
        this.$router.push(key);
      }
    },
    
    handleMobileMenuCommand(command) {
      if (command && command !== this.$route.path) {
        this.$router.push(command);
      }
    },
    
    refreshPage() {
      window.location.reload();
    },
    
    initVisitorCount() {
      // 尝试获取访客数量
      try {
        if (document.getElementById('busuanzi_value_site_uv')) {
          // 等待 busuanzi 脚本加载
          const checkBusuanzi = setInterval(() => {
            if (window._hmt) {
              clearInterval(checkBusuanzi);
            }
          }, 1000);
        }
      } catch (error) {
        console.log('访客统计加载中...');
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
