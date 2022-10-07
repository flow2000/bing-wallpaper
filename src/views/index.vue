<template>
  <div>
    <el-header>
      <meta name="viewport" content="width=device-width,initial-scale=1.0,user-scalable=0">
      <el-menu :default-active="activeIndex" mode="horizontal" @select="handleSelect" router>
        <el-menu-item index="/">
          <span class="menu-font"><i class="iconfont icon-Bing"></i>必应</span>
        </el-menu-item>
        <el-submenu index="#">
          <template slot="title">
            <span class="menu-font"><i class="iconfont icon-diqu"></i>地区</span>
          </template>
          <el-menu-item index="#de-DE">德国</el-menu-item>
          <el-menu-item index="#en-CA">加拿大</el-menu-item>
          <el-menu-item index="#en-GB">英国</el-menu-item>
          <el-menu-item index="#en-IN">印度</el-menu-item>
          <el-menu-item index="#en-US">美国</el-menu-item>
          <el-menu-item index="#fr-FR">法国</el-menu-item>
          <el-menu-item index="#it-IT">意大利</el-menu-item>
          <el-menu-item index="#ja-JP">日本</el-menu-item>
            <el-menu-item index="#zh-CN">中国</el-menu-item>
        </el-submenu>
        <el-menu-item index="/about">
          <span class="menu-font"><i class="iconfont icon-guanyu"></i>关于</span>
        </el-menu-item>
        <el-menu-item index="/blog">
          <a href="https://blog.panghai.top" target="_blank">
            <span class="menu-font"><i class="iconfont icon-bokeyuan"></i>博客</span>
          </a>
        </el-menu-item>
      </el-menu>
    </el-header>
    <router-view class="main"></router-view>
    <br/>
    <el-footer class="footer">
      本站所有图片均来自必应搜索&nbsp
      您是本站的第<span id="busuanzi_value_site_uv"></span>个小伙伴<br/>
      Copyright © 2022 心流<br/>
      <a target="_blank" href="https://beian.miit.gov.cn/">桂ICP备2021004373号-1</a>&nbsp&nbsp
      <a target="_blank" title="51la网站统计" href="https://v6.51.la/land/JnHw7yNkc1XsvRUB">
        <img src="https://sdk.51.la/icon/1-1.png">
      </a>
    </el-footer>
    <div class="end-container">
      <br/>
      <br/>
      <br/>
    </div>
  </div>
</template>

<script>
  export default {
    name: "index",
    data() {
      return {
        msg: "欢迎来到必应壁纸",
        activeIndex: "/index",
      };
    },
    mounted() {
      this.welcome();
    },
    methods: {
      welcome() {
          this.$message({
            message: this.msg,
            type: "success",
          });
      },
      handleSelect(key, keyPath) {
        console.log(key, keyPath);
        if (key === "/") {
          window.location.href = "/"
        }
      },
    },
  };

</script>

<style scoped>
  @import "//at.alicdn.com/t/c/font_3598888_ucn4wjr1xot.css";

  @media screen and (max-device-width: 350px) {
    .menu-font {
      font-size: 0.1em;
      display: none;
    }
  }

  h1, h2 {
    font-weight: normal;
  }

  ul {
    list-style-type: none;
  }

  li {
    display: inline-block;
  }

  a {
    color: #180C16;
    text-decoration: none;
  }

  font {
    font-family: Source Sans Pro, Helvetica Neue, Arial, sans-serif;
  }

  .el-menu--horizontal > .el-menu-item {
    border-bottom: none;
    text-decoration: none;
  }

  .el-submenu, .el-menu.el-menu--horizontal {
    border-bottom: none;
    text-decoration: none;
  }

  .menu-font {
    font-size: 1.5em;
    color: #909399;
  }

  .menu-font:hover, .iconfont:hover {
    color: #04988A;
  }

  .footer {
    text-align: center;
    font-size: 1.2em;
    line-height: 1.8em;
  }
</style>
