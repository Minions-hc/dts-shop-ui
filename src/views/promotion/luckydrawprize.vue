<template>
  <div class="app-container">

    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input
        v-model="listQuery.activityId"
        clearable
        size="mini"
        class="filter-item"
        style="width: 200px;"
        placeholder="请输入活动ID"
      />
      <el-input
        v-model="listQuery.activityName"
        clearable
        size="mini"
        class="filter-item"
        style="width: 200px;"
        placeholder="请输入活动名称"
      />
      <el-input
        v-model="listQuery.productName"
        clearable
        size="mini"
        class="filter-item"
        style="width: 200px;"
        placeholder="请输入产品名称"
      />
      <el-button
        v-permission="['GET /admin/productSeries/getProductSeries']"
        size="mini"
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >查找</el-button>
      <el-button
        class="filter-item"
        size="mini"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >添加</el-button>
    </div>

    <!-- 查询结果 -->
    <el-table
      v-loading="listLoading"
      :data="list"
      size="small"
      element-loading-text="正在查询中。。。"
      border
      fit
      highlight-current-row
    >

      <el-table-column
        align="center"
        min-width="200px"
        label="活动ID"
        prop="activityId"
      />
      <el-table-column
        align="center"
        min-width="200px"
        label="活动名称"
        prop="activityName"
      />
      <el-table-column
        align="center"
        min-width="200px"
        label="奖品名称"
        prop="productName"
      />
      <el-table-column
        align="center"
        min-width="200px"
        label="奖品数量"
        prop="productQuantity"
      />
      <el-table-column
        align="center"
        min-width="100px"
        label="兑换码"
        prop="redemptionCode"
      />

      <el-table-column
        align="center"
        label="操作"
        width="200"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="mini"
            @click="handleUpdate(scope.row)"
          >编辑</el-button>
          <el-button
            type="danger"
            size="mini"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <el-tooltip
      placement="top"
      content="返回顶部"
    >
      <back-to-top :visibility-height="100" />
    </el-tooltip>

    <!-- 添加或修改对话框 -->
    <el-dialog
      :title="textMap[dialogStatus]"
      :visible.sync="dialogFormVisible"
    >
      <el-form
        ref="dataForm"
        :model="dataForm"
        status-icon
        label-position="left"
        label-width="100px"
        style="width: 400px; margin-left:50px;"
      >

        <el-form-item label="活动名称">
          <el-select
            v-model="dataForm.activityId"
            style="width: 300px;"
          >
            <el-option
              v-for="item in activityList"
              :key="item.activityId"
              :label="item.activityName"
              :value="item.activityId"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="奖品名称">
          <el-select
            v-model="dataForm.productName"
            style="width: 300px;"
            @change="handleProductChange"
          >
            <el-option
              v-for="item in products"
              :key="item.productId"
              :label="item.productName"
              :value="item.productId"
            />
          </el-select>
        </el-form-item>

        <el-form-item
          label="奖品数量"
          prop="productQuantity"
        >
          <el-input v-model="dataForm.productQuantity" />
        </el-form-item>

        <el-form-item label="兑换码">
          <el-select
            v-model="dataForm.redemptionCode"
            style="width: 300px;"
            :disabled="dialogStatus === 'update'"
          >
            <el-option
              v-for="item in redemptionCodes"
              :key="item.code"
              :label="item.code"
              :value="item.code"
            />
          </el-select>
        </el-form-item>

      </el-form>

      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button
          v-if="dialogStatus=='create'"
          type="primary"
          @click="createData"
        >确定</el-button>
        <el-button
          v-else
          type="primary"
          @click="updateData"
        >确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listLuckyDrawPrize, deleteLuckyDrawPrize, createLuckyDrawPrize, updateLuckyDrawPrize, getNoSeriesProducts } from '@/api/business/luckydrawprize'
import { listLuckyDraw } from '@/api/business/luckydraw'
import { listRedemptionCode } from '@/api/business/redemptioncode'
import BackToTop from '@/components/BackToTop'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {
  name: 'ArticleList',
  components: { BackToTop, Pagination },
  data() {
    return {
      products: [],
      redemptionCodes: [],
      activityList: [],
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        title: undefined,
        activityId: undefined,
        productName: '',
        sort: 'add_time',
        order: 'desc'
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      dataForm: {
        productId: undefined,
        productName: ''
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    loadLSelectOptionData() {
      listLuckyDraw().then(response => {
        this.activityList = response.data.data.items
      })
      getNoSeriesProducts().then(response => {
        this.products = response.data.data.items
      })
      listRedemptionCode({ available: true, codeType: 0 }).then(response => {
        this.redemptionCodes = response.data.data.items
      })
    },
    handleProductChange(productId) {
      const selected = this.products.find(p => p.productId === productId)
      this.dataForm.productId = productId
      this.dataForm.productName = selected ? selected.productName : ''
    },
    formatPercentage(row, column, cellValue) {
      return cellValue + '%'
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    getList() {
      this.listLoading = true
      listLuckyDrawPrize(this.listQuery).then(response => {
        this.list = response.data.data.items
        this.total = response.data.data.total
        this.listLoading = false
      }).catch(() => {
        this.list = []
        this.total = 0
        this.listLoading = false
      })
    },
    resetForm() {
      this.dataForm = {
        id: undefined,
        rankName: '',
        rankOrder: undefined,
        percentage: undefined
      }
    },
    handleCreate() {
      this.loadLSelectOptionData()
      this.resetForm()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          createLuckyDrawPrize(this.dataForm)
            .then(response => {
              this.list.unshift(response.data.data)
              this.dialogFormVisible = false
              this.$notify.success({
                title: '成功',
                message: '创建成功'
              })
              this.getList()
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
      this.loadLSelectOptionData()
      this.dataForm = Object.assign({}, row)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          console.log(this.dataForm)
          updateLuckyDrawPrize(this.dataForm)
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
              this.getList()
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
      deleteLuckyDrawPrize(row).then(response => {
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
    }
  }
}
</script>

<style>
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
