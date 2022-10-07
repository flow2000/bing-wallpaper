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

</style>
