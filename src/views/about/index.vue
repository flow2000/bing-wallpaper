<template>
<div>
    <el-main class="about-container">
      <article class="about-article">
        <header class="about-header">
          <h1 class="about-h1">{{ $t('about.title') }}</h1>
          <p class="about-subtitle">{{ $t('about.subtitle') }}</p>
        </header>

        <div class="log-container">
          <el-timeline>
            <el-timeline-item timestamp="2022/10/6" placement="top">
              <el-card>
                <h3>{{ $t('about.timeline1Title') }}</h3>
              </el-card>
            </el-timeline-item>
            <el-timeline-item timestamp="2022/9/5" placement="top">
              <el-card>
                <h3>{{ $t('about.timeline2Title') }}</h3>
              </el-card>
            </el-timeline-item>
            <el-timeline-item timestamp="2023/6/6" placement="top">
              <el-card>
                <h3>{{ $t('about.timeline3Title') }}</h3>
              </el-card>
            </el-timeline-item>
            <el-timeline-item timestamp="2026/1/1" placement="top">
              <el-card>
                <h3>{{ $t('about.timeline4Title') }}</h3>
                <h4>{{ $t('about.timeline4Item1') }}</h4>
                <h4>{{ $t('about.timeline4Item2') }}</h4>
                <h4>{{ $t('about.timeline4Item3') }}</h4>
                <h4>{{ $t('about.timeline4Item4') }}</h4>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>

        <div class="link-comtainer">
          <el-row :gutter="24">
            <el-col :span="24">
              <el-card shadow="always">
                <div class="post1">
                  <p>{{ $t('about.frontendProject') }}<a href="https://github.com/flow2000/bing-wallpaper" target="_blank" rel="noopener"><span>bing-wallpaper</span></a></p>
                  <p>{{ $t('about.backendProject') }}<a href="https://github.com/flow2000/bing-wallpaper-api" target="_blank" rel="noopener"><span>bing-wallpaper-api</span></a></p>
                  <p>{{ $t('about.backendTutorial') }}<a href="https://blog.aqcoder.cn/posts/af9f/" target="_blank" rel="noopener">{{ $t('about.selfBuildApi') }}</a></p>
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
                  <p v-html="renderAboutText('about.postPara1')"></p>
                  <el-divider></el-divider>
                  <p v-html="renderAboutText('about.postPara2')"></p>
                  <el-divider></el-divider>
                  <p v-html="renderAboutText('about.postPara3')"></p>
                  <el-divider></el-divider>
                  <p v-html="renderAboutText('about.postPara4')"></p>
                  <el-divider></el-divider>
                  <p v-html="renderAboutText('about.postPara5')"></p>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
        <div id="tcomment"></div>
      </article>
    </el-main>
</div>
</template>

<script>
  const LINK_MAP = {
    link: 'https://cloud.momongodb.com/',
    link2: 'https://github.com/features/actions',
    link3: 'https://fastapi.tiangolo.com',
    link4: 'https://vercel.com/',
    link5: 'https://element.eleme.cn/#/zh-CN'
  }

  export default {
    name: 'about',
    mounted(){
      if (typeof twikoo !== 'undefined') {
        twikoo.init({
          envId: 'https://twikoo.bimg.cc/',
          el: '#tcomment',
        })
      }
    },
    methods: {
      renderAboutText(key) {
        let text = this.$t(key)
        text = text.replace(/\{strong\}(.+?)\{\/strong\}/g, '<strong>$1</strong>')
        text = text.replace(/\{(link\w*)\}(.+?)\{\/\1\}/g, (match, linkKey, content) => {
          const href = LINK_MAP[linkKey]
          return href ? `<a href="${href}" target="_blank" rel="noopener">${content}</a>` : content
        })
        return text
      }
    }
  }
</script>

<style scoped>
  .about-container{
    width: 100%;
    padding: 2%;
  }
  .about-header {
    margin-bottom: 24px;
    padding: 24px 28px;
    background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
    border-radius: 12px;
    border: 1px solid #ebeef5;
  }
  .about-h1 {
    font-size: 26px;
    font-weight: 700;
    color: #303133;
    margin: 0 0 8px 0;
  }
  .about-subtitle {
    font-size: 15px;
    color: #606266;
    margin: 0;
    line-height: 1.6;
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

  @media screen and (max-width: 768px) {
    .about-container {
      padding: 4% 2%;
    }

    .about-header {
      margin-bottom: 16px;
      padding: 18px 20px;
    }

    .about-h1 {
      font-size: 22px;
    }

    .about-subtitle {
      font-size: 14px;
    }

    .post1 {
      font-size: 16px;
      line-height: 26px;
    }

    .post2 {
      font-size: 14px;
      line-height: 26px;
    }

    .post1 p,
    .post2 p {
      word-break: break-all;
    }

    .link-comtainer .el-col,
    .post-container .el-col {
      padding-left: 0 !important;
      padding-right: 0 !important;
    }
  }

  @media screen and (max-width: 480px) {
    .about-container {
      padding: 4% 1%;
    }

    .about-header {
      padding: 14px 16px;
      border-radius: 8px;
    }

    .about-h1 {
      font-size: 19px;
      margin-bottom: 6px;
    }

    .about-subtitle {
      font-size: 13px;
    }

    .post1 {
      font-size: 14px;
      line-height: 24px;
    }

    .post2 {
      font-size: 13px;
      line-height: 24px;
    }

    .post2 p {
      word-break: break-all;
    }

    .about-article .el-card {
      border-radius: 8px;
    }

    .about-article .el-card__body {
      padding: 14px;
    }

    .about-article .el-divider {
      margin: 12px 0;
    }

    #tcomment {
      margin-top: 16px;
    }
  }

  @media screen and (max-width: 375px) {
    .about-header {
      padding: 12px 14px;
    }

    .about-h1 {
      font-size: 17px;
    }

    .post1 {
      font-size: 13px;
    }

    .post2 {
      font-size: 12px;
      line-height: 22px;
    }
  }
</style>
