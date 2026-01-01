<template>
  <div>
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'index',
  }
</script>

<style>
  /* 全局样式 */
  * {
    margin: 0px;
    padding: 0px;
  }

  /* el-main样式 */
  .el-main {
    padding: 1px;
    margin: 0;
    overflow: hidden;
  }

  /* 浏览器滚动条样式 */
  ::-webkit-scrollbar {
    width: 5px;
    height: 1px;
  }

  ::-webkit-scrollbar-thumb {
    border-radius: 5px;
    background-color: #3CB9FF;
  }

  ::-webkit-scrollbar-track {
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    background: #ededed;
    border-radius: 5px;
  }

  /* 应用容器 */
  .app-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* 底部样式 */
  .site-footer {
    margin-top: auto;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    padding: 24px 0;
    box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.1);
  }

  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    text-align: center;
  }

  .footer-stats {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 24px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.9);
  }

  .stat-item i {
    font-size: 18px;
    color: rgba(255, 255, 255, 1);
  }

  .stat-divider {
    color: rgba(255, 255, 255, 0.4);
    font-size: 16px;
  }

  .highlight {
    color: #ffd700;
    font-weight: bold;
  }

  .footer-copyright {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.8);
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    padding-top: 16px;
  }

  .footer-copyright p {
    margin: 0;
  }

  /* 移动端适配 */
  @media screen and (max-width: 768px) {
    .footer-stats {
      flex-direction: column;
      gap: 12px;
    }

    .site-footer {
      padding: 20px 0;
    }
  }

</style>
