<template>
  <div class="app-container">

    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input v-model="listQuery.productId" clearable size="mini" class="filter-item" style="width: 200px;" placeholder="请输入商品编号"/>
      <el-input v-model="listQuery.productName" clearable size="mini" class="filter-item" style="width: 200px;" placeholder="请输入商品名称"/>

       <el-select v-model="listQuery.productSeriesId" size="mini" style="width: 200px" class="filter-item" placeholder="请选择产品系列">
        <el-option
          v-for="item in this.productSeriesList"
          :key="item.seriesId"
          :label="item.seriesName"
          :value="item.seriesId">
        </el-option>
       </el-select>
       
       <el-select v-model="listQuery.productLevelId" size="mini" style="width: 200px" class="filter-item" placeholder="请选择产品等级">
        <el-option
          v-for="item in this.productLevels"
          :key="item.levelId"
          :label="item.levelName"
          :value="item.levelId">
        </el-option>
       </el-select>

      <el-button size="mini" class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查找</el-button>
      <el-button size="mini" class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">添加</el-button>
      <el-button :loading="downloadLoading" size="mini" class="filter-item" type="warning" icon="el-icon-download" @click="handleDownload">导出</el-button>
    </div>

    <!-- 查询结果 -->
    <el-table v-loading="listLoading" :data="list" size="small" element-loading-text="正在查询中。。。" border fit highlight-current-row>

      <el-table-column align="center" min-width="110" label="商品编号" prop="productId"/>

      <el-table-column align="center" min-width="200" label="名称" prop="productName" sortable/>

      <el-table-column align="center" property="productImage" label="图片">
        <template slot-scope="scope">
          <img :src="scope.row.productImage" width="40">
        </template>
      </el-table-column>

      <el-table-column align="center" label="所属系列" prop="productSeriesName"/>

      <el-table-column align="center" label="产品等级" prop="productLevelName"/>

      <el-table-column align="center" label="积分" prop="productPoints"/>

      <el-table-column align="center" label="勋章" prop="productBadge"/>

      <el-table-column align="center" label="参考价格" prop="productPrice"/>
  
      <el-table-column align="center" label="操作" width="150" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button type="danger" size="mini" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-tooltip placement="top" content="返回顶部">
      <back-to-top :visibility-height="100" />
    </el-tooltip>

  </div>
</template>

<style>
	.el-dialog {
    width: 60%;
	}
  .table-expand {
    font-size: 0;
  }
  .table-expand label {
    width: 100px;
    color: #99a9bf;
  }
  .table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
  }
  .gallery {
    width: 80px;
    margin-right: 10px;
  }
</style>

<script>
import { getProductList, deleteProduct, getProductSeries, getProductLevels } from '@/api/business/goods'
import BackToTop from '@/components/BackToTop'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {
  name: 'productList',
  components: { BackToTop, Pagination },
  data() {
    return {
      list: [],
      productSeriesList: [],
      productLevels: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        goodsSn: undefined,
        name: undefined,
        sort: 'add_time',
        order: 'desc'
      },
      goodsDetail: '',
      detailDialogVisible: false,
      downloadLoading: false
    }
  },
  created() {
    this.getList()
    this.init()
  },
  methods: {
     init: function() {
      getProductSeries().then(response => {
        this.productSeriesList = response.data.data.items
      })

       getProductLevels().then(response => {
        this.productLevels = response.data.data.items
      })
    },
    getList() {
      this.listLoading = true
      getProductList(this.listQuery).then(response => {
        this.list = response.data.data.items
        this.total = response.data.data.total
        this.listLoading = false
      }).catch(() => {
        this.list = []
        this.total = 0
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleCreate() {
      this.$router.push({ path: '/goods/create' })
    },
    handleUpdate(row) {
      const editDataForm = Object.assign({}, row)
      const productId = editDataForm.productId;
      this.$router.push({ path: '/goods/edit', query: { productId: productId }})
    },
    showDetail(detail) {
      this.goodsDetail = detail
      this.detailDialogVisible = true
    },
    handleDelete(row) {
      deleteProduct(row).then(response => {
        this.$notify.success({
          title: '成功',
          message: '删除成功'
        })
        const index = this.list.indexOf(row)
        this.list.splice(index, 1)
      }).catch(response => {
        this.$notify.error({
          title: '失败',
          message: response.data.errmsg
        })
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['商品ID', '商品编号', '名称', '专柜价格', '当前价格', '是否新品', '是否热品', '是否在售', '首页主图', '宣传图片列表', '商品介绍', '详细介绍', '商品图片', '商品单位', '关键字', '类目ID', '品牌商ID']
        const filterVal = ['id', 'goodsSn', 'name', 'counterPrice', 'retailPrice', 'isNew', 'isHot', 'isOnSale', 'listPicUrl', 'gallery', 'brief', 'detail', 'picUrl', 'goodsUnit', 'keywords', 'categoryId', 'brandId']
        excel.export_json_to_excel2(tHeader, this.list, filterVal, '商品信息')
        this.downloadLoading = false
      })
    }
  }
}
</script>
