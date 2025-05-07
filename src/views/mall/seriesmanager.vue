<template>
  <div class="app-container">

    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input
        v-model="listQuery.seriesId"
        clearable
        size="mini"
        class="filter-item"
        style="width: 200px;"
        placeholder="请输入系列ID"
      />
      <el-input
        v-model="listQuery.seriesName"
        clearable
        size="mini"
        class="filter-item"
        style="width: 200px;"
        placeholder="请输入系列名称"
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
        v-permission="['POST /admin/productSeries/createProductSeries']"
        size="mini"
        class="filter-item"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >添加</el-button>
      <el-button
        :loading="downloadLoading"
        size="mini"
        class="filter-item"
        type="warning"
        icon="el-icon-download"
        @click="handleDownload"
      >导出</el-button>
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
        label="类目ID"
        prop="categoryId"
        sortable
      />
      <el-table-column
        align="center"
        label="类目名"
        prop="categoryName"
      />
      <el-table-column
        align="center"
        label="系列ID"
        prop="seriesId"
        sortable
      />
      <el-table-column
        align="center"
        label="系列名"
        prop="seriesName"
      />

      <el-table-column
        align="center"
        label="系列主图"
        property="seriesImage"
      >
        <template slot-scope="scope">
          <img
            :src="scope.row.seriesImage"
            width="40"
          >
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        label="系列描述"
        prop="seriesDescription"
      />

      <el-table-column
        align="center"
        label="是否魂力赏"
        prop="isSpiritPower"
      >
        <template slot-scope="scope">
          <el-tag :type="scope.row.isSpiritPower ? 'success' : 'error' ">{{ scope.row.isSpiritPower ? '是' : '否' }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        label="是否热榜"
        prop="isHot"
      >
        <template slot-scope="scope">
          <el-tag :type="scope.row.isHot ? 'success' : 'error' ">{{ scope.row.isHot ? '是' : '否' }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        label="是否踩雷"
        prop="isAvoid"
      >
        <template slot-scope="scope">
          <el-tag :type="scope.row.isAvoid ? 'success' : 'error' ">{{ scope.row.isAvoid ? '是' : '否' }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        label="价格区间"
        prop="priceRanges"
      >
        <template #default="{ row }">
          <div
            v-if="row.priceRanges"
            style="white-space: pre-line;"
          >
            {{ formatPriceRanges(row.priceRanges) }}
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        label="是否人气新品"
        prop="isPopularNew"
      >
        <template slot-scope="scope">
          <el-tag :type="scope.row.isPopularNew ? 'success' : 'error' ">{{ scope.row.isPopularNew ? '是' : '否' }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        label="是否爆款推荐"
        prop="isHotRecommend"
      >
        <template slot-scope="scope">
          <el-tag :type="scope.row.isHotRecommend ? 'success' : 'error' ">{{ scope.row.isHotRecommend ? '是' : '否' }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        label="参考价格"
        prop="price"
      />
      <el-table-column
        align="center"
        label="操作"
        width="200"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            v-permission="['POST /admin/productSeries/updateProductSeries']"
            type="primary"
            size="mini"
            @click="handleUpdate(scope.row)"
          >编辑</el-button>
          <el-button
            v-permission="['POST /admin/productSeries/deleteProductSeries']"
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

    <!-- 添加或修改对话框 -->
    <el-dialog
      :title="textMap[dialogStatus]"
      :visible.sync="dialogFormVisible"
    >
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="dataForm"
        status-icon
        label-position="left"
        label-width="100px"
        style="width: 500px; margin-left:50px;"
      >
        <el-form-item
          label="系列名称"
          prop="seriesName"
        >
          <el-input v-model="dataForm.seriesName" />
        </el-form-item>

        <el-form-item
          label="系列描述"
          prop="seriesDescription"
        >
          <el-input v-model="dataForm.seriesDescription" />
        </el-form-item>

        <el-form-item label="所属类目">
          <el-select v-model="dataForm.categoryId">
            <el-option
              v-for="item in categoryList"
              :key="item.categoryId"
              :label="item.categoryName"
              :value="item.categoryId"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="系列主图">
          <el-upload
            :headers="headers"
            :action="uploadPath"
            :show-file-list="false"
            :on-success="uploadPicUrl"
            class="avatar-uploader"
            accept=".jpg,.jpeg,.png,.gif"
          >
            <img
              v-if="dataForm.seriesImage"
              :src="dataForm.seriesImage"
              class="avatar"
            >
            <i
              v-else
              class="el-icon-plus avatar-uploader-icon"
            />
          </el-upload>
        </el-form-item>

        <el-form-item
          label="是否魂力赏"
          prop="isSpiritPower"
        >
          <el-radio-group
            v-model="dataForm.isSpiritPower"
            @change="handleSpiritPowerChange"
          >
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          label="是否热榜"
          prop="isHot"
        >
          <el-radio-group
            v-model="dataForm.isHot"
            :disabled="dataForm.isSpiritPower"
          >
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          label="是否踩雷"
          prop="isAvoid"
        >
          <el-radio-group
            v-model="dataForm.isAvoid"
            :disabled="dataForm.isSpiritPower"
          >
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>

        <div class="form-group">
          <dynamic-range-inputs
            ref="rangeInputsRef"
            v-model="dataForm.priceRanges"
            :is-avoid="dataForm.isAvoid"
            @validation="handleValidation"
          />
        </div>

        <el-form-item
          label="是否人气新品"
          prop="isPopularNew"
        >
          <el-radio-group
            v-model="dataForm.isPopularNew"
            :disabled="dataForm.isSpiritPower"
          >
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          label="是否爆款推荐"
          prop="isHotRecommend"
        >
          <el-radio-group
            v-model="dataForm.isHotRecommend"
            :disabled="dataForm.isSpiritPower"
          >
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          :label="dataForm.isSpiritPower ? '参考魂力值' : '参考价格'"
          prop="price"
        >
          <el-input
            v-model="dataForm.price"
            :placeholder="dataForm.isSpiritPower ? '0' : '0.00'"
          >
            <template slot="append">{{ dataForm.isSpiritPower ? '点' : '元' }}</template>
          </el-input>
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
import { productSeriesList, createProductSeries, updateProductSeries, deleteProductSeries } from '@/api/business/productseries'
import { productCategoryList } from '@/api/business/productcategory'
import { uploadPath } from '@/api/business/storage'
import { getToken } from '@/utils/auth'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import DynamicRangeInputs from './DynamicRangeInputs.vue'

export default {
  name: 'Category',
  components: { Pagination, DynamicRangeInputs },
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
        isSpiritPower: false,
        isHot: false,
        isAvoid: false,
        isPopularNew: false,
        isHotRecommend: false,
        price: '',
        priceRanges: [],
        seriesImage: undefined
      },
      formValid: false,
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      rules: {
        name: [{ required: true, message: '类目名不能为空', trigger: 'blur' }]
      },
      downloadLoading: false,
      categoryList: [],
      rangeErrors: {}
    }
  },
  computed: {
    headers() {
      return {
        'X-Dts-Admin-Token': getToken()
      }
    },
    parsedPriceRanges: {
      get() {
        try {
          return typeof this.dataForm.priceRanges === 'string'
            ? JSON.parse(this.dataForm.priceRanges)
            : this.dataForm.priceRanges || []
        } catch (e) {
          return []
        }
      },
      set(value) {
        this.dataForm.priceRanges = value
      }
    }
  },
  watch: {
    'dataForm.isAvoid'(newVal) {
      if (newVal && (!this.dataForm.priceRanges || this.dataForm.priceRanges.length === 0)) {
        this.dataForm.priceRanges = [{
          minQuantity: null,
          maxQuantity: null,
          price: null
        }]
      }
      this.checkFormValidity()
    },
    'dataForm.isSpiritPower'(newVal) {
      if (newVal) {
        this.dataForm.isHot = false
        this.dataForm.isAvoid = false
        this.dataForm.isPopularNew = false
        this.dataForm.isHotRecommend = false
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    handleSpiritPowerChange(val) {
      if (val) {
        this.dataForm.isHot = false
        this.dataForm.isAvoid = false
        this.dataForm.isPopularNew = false
        this.dataForm.isHotRecommend = false
      }
    },
    formatPriceRanges(priceRanges) {
      try {
        // 1. 处理空值情况
        if (!priceRanges) return '-'

        // 2. 解析数据
        const ranges = typeof priceRanges === 'string'
          ? JSON.parse(priceRanges)
          : priceRanges

        // 3. 验证数据格式
        if (!Array.isArray(ranges)) return '-'

        // 4. 格式化显示
        return ranges
          .filter(range => range && range.minQuantity !== undefined && range.maxQuantity !== undefined)
          .map(range => {
            // 处理可能为null的price
            const price = range.price !== null ? range.price : 0
            return `区间【${range.minQuantity}-${range.maxQuantity}】价格为：${price.toFixed(1)}`
          })
          .join('\n') || '-' // 空数组时显示-
      } catch (e) {
        console.error('格式化价格区间失败:', e)
        return '数据格式错误'
      }
    },
    checkFormValidity() {
      if (!this.dataForm.isAvoid) {
        this.formValid = true
        return
      }

      // 添加空数组检查
      if (!this.dataForm.priceRanges || this.dataForm.priceRanges.length === 0) {
        this.formValid = false
        return
      }

      // 使用从事件获取的错误信息
      const hasErrors = Object.keys(this.rangeErrors).length > 0
      this.formValid = !hasErrors
    },
    handleValidation({ isValid, errors }) {
      this.rangeErrors = errors
      this.formValid = isValid
    },
    getList() {
      this.listLoading = true
      productSeriesList(this.listQuery)
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

      productCategoryList().then(response => {
        this.categoryList = response.data.data.items
      })
    },
    handleCategoryChange(value) {
      this.goods.categoryId = value[value.length - 1]
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    resetForm() {
      this.dataForm = {
        categoryId: undefined,
        categoryName: '',
        keywords: '',
        level: 'L2',
        pid: undefined,
        desc: '',
        iconUrl: undefined,
        seriesImage: undefined,
        priceRanges: []
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
      this.dataForm.seriesImage = response.data.url
    },
    createData() {
      this.$refs['dataForm'].validate(valid => {
        this.checkFormValidity()
        if (!this.formValid) return
        if (valid) {
          // 准备提交数据
          const submitData = {
            ...this.dataForm,
            // 处理 priceRanges 字段
            priceRanges: this.dataForm.isAvoid
              ? JSON.stringify(this.dataForm.priceRanges) // 转为字符串
              : undefined // 不显示时设为 undefined
          }
          // 移除 undefined 字段
          Object.keys(submitData).forEach(key => {
            if (submitData[key] === undefined) {
              delete submitData[key]
            }
          })
          createProductSeries(submitData)
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
      this.dataForm = Object.assign({}, row)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate(valid => {
        this.checkFormValidity()
        if (!this.formValid) return
        if (valid) {
          // 准备提交数据
          const submitData = {
            ...this.dataForm,
            // 处理 priceRanges 字段
            priceRanges: this.dataForm.isAvoid
              ? JSON.stringify(this.dataForm.priceRanges) // 转为字符串
              : undefined // 不显示时设为 undefined
          }

          // 移除 undefined 字段
          Object.keys(submitData).forEach(key => {
            if (submitData[key] === undefined) {
              delete submitData[key]
            }
          })
          updateProductSeries(submitData)
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
      deleteProductSeries(row)
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
    }
  }
}
</script>

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
.form-group {
  margin-bottom: 20px;
}

label {
  margin-right: 10px;
}

.preview-section {
  margin-top: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 4px;
}

.preview-section ul {
  list-style: none;
  padding: 0;
}

.preview-section li {
  padding: 5px 0;
}
</style>
