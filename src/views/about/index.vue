<template>
<div>
    <el-main class="about-container">
      <div class="log-container">
        <el-timeline>
          <el-timeline-item timestamp="2022/10/6" placement="top">
            <el-card>
              <h4>完善各个页面</h4>
              <p>2022/10/06 22:09</p>
            </el-card>
          </el-timeline-item>
          <el-timeline-item timestamp="2022/9/5" placement="top">
            <el-card>
              <h4>第一个版本，完成基本布局</h4>
              <p>2022/9/5 20:46</p>
            </el-card>
          </el-timeline-item>
          <el-timeline-item timestamp="2023/6/6" placement="top">
            <el-card>
              <h4>修复分页器无法正常显示的bug</h4>
              <p>2022/6/6 14:04</p>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>

      <div class="link-comtainer">
        <el-row :gutter="24">
          <el-col :span="24">
            <el-card shadow="always">
              <div class="post1">
                <p>前端项目地址：<a href="https://github.com/flow2000/bing-wallpaper" target="_blank"><span>bing-wallpaper</span></a></p>
                <p>后端项目地址：<a href="https://github.com/flow2000/bing-wallpaper-api" target="_blank"><span>bing-wallpaper-api</span></a></p>
                <p>后端教程：<a href="https://blog.aqcoder.cn/posts/af9f/" target="_blank">自搭建必应api</a></p>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <div class="post-container">
        <el-row :gutter="24">
          <el-col :span="24">
            <el-card shadow="hover">
              <div class="post2">
                <p>
                  后端搭建使用了文档数据库<a href="https://cloud.momongodb.com/">Mongodb</a>作为数据存储，
                  使用了无限量构建的CI/CD持续集成工具<a href="https://github.com/features/actions">Github Action</a>获取每日壁纸数据并存储到Mongodb，
                  使用了Python高性能异步<a href="https://fastapi.tiangolo.com">FastApi</a>作为后端框架，
                  使用了<a href="https://vercel.com/">Vercel</a>承载用户的请求实现serverless。前端搭建使用了<a href="https://element.eleme.cn/#/zh-CN" target="_blank">ElementUI</a>框架速开
                </p>
                <el-divider></el-divider>
                <p>
                  刚开始接触必应壁纸时只是在必应上看到了许多优秀的壁纸，想要个api当作博客的背景图片使用，
                  后面自己也学着搭建了一个api。一路上磕磕绊绊，后端api学到了许多知识，
                  比如Python第三方库pymongo的简单使用，FastAPI的搭建，Python的模块化设计；
                  前端学到了导航栏的布局，三方图标库的导入，vue-router的使用，axios封装的请求库，分页器的加载。
                </p>
                <el-divider></el-divider>
                <p>
                  期间也遇到了许多困难， 后端翻了很多资料才知道必应壁纸api可以分地区， 但是国区还被强制重定向了，
                  vercel搞了好久也解决不了后端和前端同时放在一起的请求方式，FastAPI也走了许多小坑，
                  查了好久的资料加上模仿大佬的设计才完成Python的模块化设计。
                  前端<a href="https://element.eleme.cn/#/zh-CN" target="_blank">ElementUI</a>
                  翻了N遍，bug还出现了一堆，vue-router学着官网的的例子才懂，分页器还有一个bug没解决，
                  PS：这个bug还不能去掉，项目依靠这个bug运行。
                </p>
                <el-divider></el-divider>
                <p>
                  现在，bing-wallpaper开通<a href="https://twikoo.js.org/">Twikoo</a>评论系统，大家有问题可以在此留言
                </p>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
      <div id="tcomment"></div>
    </el-main>
</div>
</template>

<script>
  export default {
    name: 'about',
    created(){
    },
    mounted(){
      twikoo.init({
        envId: 'https://twikoo.bimg.cc/',
        el: '#tcomment', // 容器元素
      })
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .about-container{
    width: 100%;
    padding: 2%;
  }
  a{
    text-decoration: none;
  }
  .post1 {
    font-size: 20px;
    line-height: 30px;
    text-align: left;
  }
  .post2 {
    font-size: 15px;
    line-height: 30px;
    text-align: left;
  }
</style>
