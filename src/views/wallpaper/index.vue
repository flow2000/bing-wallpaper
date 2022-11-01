<template>
  <div class="container">
    <div v-for="item in picList" :key="item.id" class="pic">
      <a :href="item.url" target="_blank" class="a-item">
        <el-image class="image-item" :src="item.tiny_url" fit="fill" :alt="item.title" lazy/>
      </a>
    </div>
    <div class="page-content">
      <i class="iconfont icon-bug"><span class="demonstration">分页器依靠这个bug存活</span></i>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :hide-on-single-page="true"
        :current-page="currentPage"
        :page-sizes="[15, 30, 45, 60]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        bingApi: "https://api.bimg.cc",          //api 
        picList: [],                             //数据列表
        total: 0,                               //数据总数
        currentPage: 1,                         //当前页数
        currentLimit: 15,                        //当前每页数量
        currentMkt: "zh-CN",                    //当前地区
        page: 1,                                 //默认当前页
        limit: 15,                              //默认每页数量
        mkt: "zh-CN",                           //默认地区
      };
    },
    methods: {
      getPicList() {
        this.picList.splice(0, this.picList.length);
        this.$axios.get(
          this.bingApi + "/all?mkt=" + this.currentMkt + "&page=" + this.currentPage + "&limit=" + this.currentLimit
        ).then(res => {
          for (let pic of res.data.data) {
            pic['tiny_url'] = pic['url'].replace("1920x1080", "800x480");
            this.picList.push(pic)
          }
          // console.log(this.picList)
        })
      },
      getTotal() {
        this.$axios.get(this.bingApi + "/total?mkt=" + this.currentMkt).then(res => {
          this.total = res.data.data;
        })
      },
      handleSizeChange(val) {
        this.currentLimit = val;
        this.currentPage = this.page;
        this.getPicList();
        // console.log(`每页 ${val} 条`);
      },
      handleCurrentChange(val) {
        this.currentPage = val;
        this.getPicList();
        // console.log(`当前页: ${val}`);
      },
    },
    created() {

    },
    mounted() {
      this.getPicList();
      this.getTotal();
    },
    watch: {
      $route(to, from) {
        // console.log(to);
        const url = to.hash;
        if (url.length > 1 && url.charAt(0) === "#") {
          this.currentMkt = to.hash.split("#")[1];
          this.currentPage = this.page;
          this.currentLimit = this.limit;
          this.getPicList();
          this.getTotal();
        }
      }
    }
  };
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  @media screen and (max-device-width: 400px) {
    .pic {
      width: 100%;
      display: flex;
      height: auto;
      position: relative;
      border: none;
    }
  }

  .container {
    position: relative;
    font-size: 0;
    margin: 0 auto;
  }

  .pic {
    position: relative;
    border: none;
  }

  .image-item{
    width: 33.33%;
    float: left;
    height: auto;
  }

  .el-pagination {
    text-align: center;
  }

  .demonstration {
    font-size: 10px;
    font-weight: bold;
  }
</style>
