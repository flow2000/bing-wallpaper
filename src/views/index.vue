<template>
  <div>
    <el-header>
      <meta name="viewport" content="width=device-width,initial-scale=1.0,user-scalable=0">
      <el-menu :default-active="activeIndex" mode="horizontal" @select="handleSelect" router
        style="display: flex; justify-content: space-between;">
        <el-menu-item index="/">
          <i class="iconfont icon-Bing"></i><span class="menu-font">必应</span>
        </el-menu-item>
        <el-submenu index="#">
          <template slot="title">
            <i class="iconfont icon-diqu"></i><span class="menu-font">地区</span>
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
          <i class="iconfont icon-guanyu"></i><span class="menu-font">关于</span>
        </el-menu-item>
        <el-menu-item index="/blog">
          <a href="https://blog.aqcoder.cn" target="_blank">
            <i class="iconfont icon-bokeyuan"></i><span class="menu-font">博客</span>
          </a>
        </el-menu-item>
      </el-menu>
    </el-header>
    <router-view class="main"></router-view>
    <br />
    <el-footer class="footer">
      本站所有图片均来自必应搜索&nbsp
      您是本站的第<span id="busuanzi_value_site_uv"></span>个小伙伴<br />
      Copyright © {{ time }} 心流&nbsp&nbsp
      <a target="_blank" title="51la网站统计" href="https://v6.51.la/s/W8n3xjD4r3Vjfl6">
        <img src="https://sdk.51.la/icon/1-1.png">
      </a>
    </el-footer>
    <div class="end-container">
      <br />
      <br />
      <br />
    </div>
  </div>
</template>

<script>
export default {
  name: "index",
  data() {
    return {
      activeIndex: "/index",
      time: "",
    };
  },
  mounted() {
    this.nowtime()
  },
  methods: {
    handleSelect(key, keyPath) {
      console.log(key, keyPath);
      if (key === "/") {
        window.location.href = "/"
      }
    },
    nowtime() {
      let nowDate = new Date();
      let date = {
        // 获取当前年份
        year: nowDate.getFullYear(),
        //获取当前月份
        month: nowDate.getMonth() + 1,
        //获取当前日期
        date: nowDate.getDate(),
      };
      //拼接
      this.time = "2022-" + date.year;
    },
  },
};

</script>

<style scoped>
@import "//at.alicdn.com/t/c/font_3598888_ucn4wjr1xot.css";

@media screen and (max-device-width: 450px) {
  .menu-font {
    font-size: 0.1em;
    display: none;
  }

  .footer {
    text-align: center;
    font-size: 0.6em;
    line-height: 1.8em;
  }

  .menu-font {
    display: none;
  }
}

h1,
h2 {
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

.el-menu--horizontal>.el-menu-item {
  border-bottom: none;
  text-decoration: none;
}

.el-submenu,
.el-menu.el-menu--horizontal {
  border-bottom: none;
  text-decoration: none;
}

.menu-font {
  font-size: 1.5em;
  color: #909399;
}

.menu-font:hover,
.iconfont:hover {
  color: #04988A;
}

.footer {
  text-align: center;
  font-size: 1.2em;
  line-height: 1.8em;
}
</style>
