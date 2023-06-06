<template>
  <div class="container">
    <div class="picbox">
      <div v-for="item in picList" :key="item.id" class="pic">
        <a :href="item.url" target="_blank" class="a-item">
          <el-image class="image-item" :src="item.tiny_url" :alt="item.title" lazy />
        </a>
      </div>
    </div>
    <div class="pagination">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="currentPage" :page-sizes="[15, 30, 45, 60]" :hide-on-single-page="true" :layout="paginationLayout"
        :total="total">
      </el-pagination>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      BINGAPI: "https://api.bimg.cc",          //api 
      picList: [],                             //数据列表
      total: 0,                               //数据总数
      currentPage: 1,                         //当前页数
      currentLimit: 15,                        //当前每页数量
      currentMkt: "zh-CN",                    //当前地区
      page: 1,                                 //默认当前页
      limit: 15,                              //默认每页数量
      mkt: "zh-CN",                           //默认地区
      paginationLayout: "prev, pager, next, jumper, ->, total",  //分页器样式
    };
  },
  methods: {
    getPicList() {
      let that = this;
      that.picList.splice(0, that.picList.length);
      that.$axios.get(that.BINGAPI + "/total?mkt=" + that.currentMkt).then(res => {
        that.total = res.data.data;
      })
      that.$axios.get(
        that.BINGAPI + "/all?mkt=" + that.currentMkt + "&page=" + that.currentPage + "&limit=" + that.currentLimit
      ).then(res => {
        for (let pic of res.data.data) {
          pic['tiny_url'] = pic['url'].replace("1920x1080", "800x480");
          that.picList.push(pic)
        }
      })
    },
    handleSizeChange(val) {
      this.currentLimit = val;
      this.currentPage = this.page;
      this.getPicList();
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getPicList();
    },
    updateLayout() {
      if (window.innerWidth < 769) {
        this.paginationLayout = 'prev, next, jumper, ->, total';
      } else {
        this.paginationLayout = 'prev, sizes, pager, next, jumper, ->, total';
      }
    }
  },
  created() {
    this.getPicList();
  },
  mounted() {
    this.updateLayout();
    window.addEventListener('resize', this.updateLayout);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.updateLayout);
  },
  watch: {
    $route(to, from) {
      const url = to.hash;
      if (url.length > 1 && url.charAt(0) === "#") {
        this.currentMkt = to.hash.split("#")[1];
        this.currentPage = this.page;
        this.currentLimit = this.limit;
        this.getPicList();
      }
    }
  }
};
</script>

<style scoped>
.container {
  position: relative;
  font-size: 0;
  margin: 0 auto;
}

.pagination {
  text-align: center;
}

@media screen and (max-device-width: 400px) {

  .image-item {
    position: relative;
    width: 100%;
    float: left;
    height: auto;
  }
}

@media screen and (min-width: 400px) and (max-width: 769px) {
  .picbox {
    height: 1000px;
    border: none;
    padding-top: 2%;
  }

  .image-item {
    position: relative;
    width: 100%;
    float: left;
    height: auto;
  }
}

@media screen and (min-width: 769px) {
  .picbox {
    height: 1000px;
    border: none;
    padding-top: 2%;
  }

  .image-item {
    position: relative;
    width: 33.33%;
    float: left;
    height: auto;
  }

}
</style>
