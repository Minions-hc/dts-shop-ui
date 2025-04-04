<template>
  <div class="app-container">

    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input v-model="listQuery.id" clearable size="mini" class="filter-item" style="width: 200px;" placeholder="请输入类目ID"/>
      <el-input v-model="listQuery.name" clearable size="mini" class="filter-item" style="width: 200px;" placeholder="请输入类目名称"/>
      <el-button v-permission="['GET /admin/category/list']" size="mini" class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查找</el-button>
      <el-button v-permission="['POST /admin/category/create']" size="mini" class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">添加</el-button>
      <el-button :loading="downloadLoading" size="mini" class="filter-item" type="warning" icon="el-icon-download" @click="handleDownload">导出</el-button>
    </div>

    <!-- 查询结果 -->
    <el-table v-loading="listLoading" :data="list" size="small" element-loading-text="正在查询中。。。" border fit highlight-current-row>

      <el-table-column align="center" label="箱子ID" prop="boxId" sortable/>

      <el-table-column align="center" label="箱子编号" prop="boxNumber"/>

      <el-table-column align="center" label="系列ID" prop="seriesId"/>

      <el-table-column align="center" label="系列名称" prop="seriesName"/>

      <el-table-column align="center" label="操作" width="200" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button v-permission="['POST /admin/category/update']" type="primary" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button v-permission="['POST /admin/category/delete']" type="danger" size="mini" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <!-- 添加或修改对话框 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="dataForm" status-icon label-position="left" label-width="100px" style="width: 1000px; margin-left:50px;">
        <el-form-item label="箱子编号" prop="boxNumber">
          <el-input style="width: 200px;" v-model="dataForm.boxNumber" :disabled="dialogStatus === 'update'"/>
        </el-form-item>
        <el-form-item label="所属系列" prop="seriesId">
          <el-select style="width: 200px;" v-model="dataForm.seriesId"  @change="handleOptionChange" :disabled="dialogStatus === 'update'">
            <el-option v-for="item in productSeriesList" :key="item.seriesId" :label="item.seriesName" :value="item.seriesId"/>
          </el-select>
        </el-form-item>

        <el-form-item label="产品列表" v-if="products.length > 0">
          <el-table
            :data="products"
            v-loading="loading"
            style="width: 1000px"
            :default-sort="{prop: 'productId', order: 'ascending'}"
            >
            <el-table-column prop="productId" label="ID" width="100" sortable header-align="center" align="center"/>
            <el-table-column prop="productName" label="产品名称" width="200" header-align="center" align="center"/>
            <el-table-column prop="productPrice" label="价格" width="80" header-align="center" align="center"/>
            <el-table-column prop="productSeriesName" label="系列名称" width="200" header-align="center" align="center"/>
            <el-table-column prop="productLevelName" label="产品等级" width="200" header-align="center" align="center"/>
            
            <el-table-column label="库存" width="100" header-align="center" align="center">
              <template #default="scope">
                <el-form-item 
                  :prop="'products.' + scope.$index + '.quantity'"
                >
                  <el-input 
                    v-model.number="scope.row.quantity" 
                    type="number"
                    :min="0"
                    :step="1"
                    oninput="value=value.replace(/[^\d]/g,'')"
                  />
                </el-form-item>
              </template>
            </el-table-column>
          </el-table>
          <div v-if="!loading && products.length === 0" class="empty-tip">
            <el-empty description="该系列暂无产品"></el-empty>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">确定</el-button>
        <el-button v-else type="primary" @click="updateData">确定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #20a0ff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  line-height: 120px;
  text-align: center;
}
.avatar {
  width: 145px;
  height: 145px;
  display: block;
}
.empty-tip {
  margin-top: 20px;
  text-align: center;
  background: #f5f7fa;
  padding: 20px;
  border-radius: 4px;
}
</style>

<script>
import { getProductSeries, listProductBox, createProductBox, queryProductsInBox, updateProductBox, deleteProductBox } from '@/api/business/productbox'
import { getProductList } from '@/api/business/goods'
import { uploadPath } from '@/api/business/storage'
import { getToken } from '@/utils/auth'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {
  name: 'Category',
  components: { Pagination },
  data() {

    return {
      uploadPath,
      list: undefined,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        id: undefined,
        name: undefined,
        sort: 'add_time',
        order: 'desc'
      },
      catL1: {},
      dataForm: {
        id: undefined,
        name: '',
        keywords: '',
        level: 'L2',
        pid: undefined,
        desc: '',
        iconUrl: undefined,
        picUrl: undefined
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      rules: {
        boxNumber: [{ required: true, message: '箱子编号不能为空', trigger: 'blur' }],
        seriesId: [{ required: true, message: '请选择系列', trigger: 'blur' }]
      },
     
      downloadLoading: false,
      productSeriesList: [],
      products: []
    }
  },
  computed: {
    headers() {
      return {
        'X-Dts-Admin-Token': getToken()
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      listProductBox(this.listQuery)
        .then(response => {
          this.list = response.data.data.items
          this.total = response.data.data.total
          this.listLoading = false
        })
        .catch(() => {
          this.list = []
          this.total = 0
          this.listLoading = false
        })

      getProductSeries().then(response => {
        this.productSeriesList = response.data.data.items
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    resetForm() {
      this.dataForm = {
        seriesId: undefined,
        boxNumber: undefined,
        products: undefined
      }
    },
    onLevelChange: function(value) {
      if (value === 'L1') {
        this.pid = undefined
      }
    },
    handleCreate() {
      this.resetForm()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    uploadIconUrl: function(response) {
      this.dataForm.iconUrl = response.data.url
    },
    uploadPicUrl: function(response) {
      this.dataForm.picUrl = response.data.url
    },
    createData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          this.dataForm.products = this.products
          console.log(this.dataForm)
          createProductBox(this.dataForm)
            .then(response => {
              this.list.unshift(response.data.data)
              this.dialogFormVisible = false
              this.$notify.success({
                title: '成功',
                message: '创建成功'
              })
            })
            .catch(response => {
              this.$notify.error({
                title: '失败',
                message: response.data.errmsg
              })
            })
        }
      })
    },
    handleUpdate(row) {
      this.dataForm = Object.assign({}, row)
      queryProductsInBox({"boxId" : this.dataForm.boxId, "boxNumber" : this.dataForm.boxNumber}).then(response => {
        this.products = response.data.data.items
      }).catch(() => {
        this.products = []
      })
      this.dataForm.products = this.products
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          updateProductBox(this.dataForm)
            .then(() => {
              for (const v of this.list) {
                if (v.id === this.dataForm.id) {
                  const index = this.list.indexOf(v)
                  this.list.splice(index, 1, this.dataForm)
                  break
                }
              }
              this.dialogFormVisible = false
              this.$notify.success({
                title: '成功',
                message: '更新成功'
              })
            })
            .catch(response => {
              this.$notify.error({
                title: '失败',
                message: response.data.errmsg
              })
            })
        }
      })
    },
    handleDelete(row) {
      deleteProductBox(row)
        .then(response => {
          this.$notify.success({
            title: '成功',
            message: '删除成功'
          })
          const index = this.list.indexOf(row)
          this.list.splice(index, 1)
        })
        .catch(response => {
          this.$notify.error({
            title: '失败',
            message: response.data.errmsg
          })
        })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = [
          '类目ID',
          '名称',
          '关键字',
          '级别',
          '父类目ID',
          '类目图标',
          '类目图片',
          '简介'
        ]
        const filterVal = [
          'id',
          'name',
          'keywords',
          'level',
          'pid',
          'iconUrl',
          'picUrl',
          'desc'
        ]
        excel.export_json_to_excel2(
          tHeader,
          this.list,
          filterVal,
          '商品类目信息'
        )
        this.downloadLoading = false
      })
    },
    handleOptionChange(productSeriesId) {
      console.log(productSeriesId);
      if (!productSeriesId) {
        this.products = [];
        return;
      }
      this.loading = true;
      getProductList({"productSeriesId" : productSeriesId}).then(response => {
        this.products = response.data.data.items
      }).catch(() => {
        this.products = []
      })
      this.loading = false;
    }
  }
}
</script>
