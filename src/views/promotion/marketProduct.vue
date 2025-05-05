<template>
  <div class="app-container">

    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input
        v-model="listQuery.productId"
        clearable
        size="mini"
        class="filter-item"
        style="width: 200px;"
        placeholder="请输入产品ID"
      />
      <el-input
        v-model="listQuery.productName"
        clearable
        size="mini"
        class="filter-item"
        style="width: 200px;"
        placeholder="请输入产品名称"
      />
      <el-select
        v-model="listQuery.productSeriesId"
        clearable
        size="mini"
        style="width: 200px"
        class="filter-item"
        placeholder="请选择产品系列"
      >
        <el-option
          v-for="item in productSeriesList"
          :key="item.seriesId"
          :label="item.seriesName"
          :value="item.seriesId"
        />
      </el-select>
      <el-select
        v-model="listQuery.productLevelId"
        clearable
        size="mini"
        style="width: 200px"
        class="filter-item"
        placeholder="请选择产品等级"
      >
        <el-option
          v-for="item in productLevels"
          :key="item.levelId"
          :label="item.levelName"
          :value="item.levelId"
        />
      </el-select>
      <el-button
        size="mini"
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >查找</el-button>
      <el-button
        size="mini"
        class="filter-item"
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
        label="产品ID"
        prop="productId"
        sortable
      />

      <el-table-column
        align="center"
        label="产品名"
        prop="productName"
      />

      <el-table-column
        align="center"
        label="所属系列"
        prop="productSeriesName"
      />

      <el-table-column
        align="center"
        label="产品等级"
        prop="productLevelName"
      />

      <el-table-column
        align="center"
        label="产品兑换所需勋章"
        prop="productBadge"
      />
      <el-table-column
        align="center"
        min-width="200px"
        label="产品轮播图"
      >
        <template slot-scope="scope">
          <div v-if="scope.row.productImage">
            <div
              v-for="(img, index) in scope.row.productImage.split(';')"
              :key="index"
            >
              <img
                :src="img"
                style="width: 50px; height: 50px; margin-right: 5px;"
              >
            </div>
          </div>
          <span v-else>无详情图片</span>
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        min-width="200px"
        label="产品详请"
      >
        <template slot-scope="scope">
          <div v-if="scope.row.productDetail">
            <div
              v-for="(img, index) in scope.row.productDetail.split(';')"
              :key="index"
            >
              <img
                :src="img"
                style="width: 50px; height: 50px; margin-right: 5px;"
              >
            </div>
          </div>
          <span v-else>无详情图片</span>
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        label="是由有效"
        prop="available"
      >
        <template slot-scope="scope">
          <el-tag :type="scope.row.isHot ? 'success' : 'error' ">{{ scope.row.available ? '是' : '否' }}</el-tag>
        </template>
      </el-table-column>

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
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item
          label="产品名称"
          prop="productName"
        >
          <el-input v-model="dataForm.productName" />
        </el-form-item>
        <el-form-item label="商品等级">
          <el-select
            v-model="dataForm.productLevelId"
            class="elinput"
          >
            <el-option
              v-for="item in productLevels"
              :key="item.levelId"
              :label="item.levelName"
              :value="item.levelId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属系列">
          <el-select
            v-model="dataForm.productSeriesId"
            class="elinput"
          >
            <el-option
              v-for="item in productSeriesList"
              :key="item.seriesId"
              :label="item.seriesName"
              :value="item.seriesId"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="产品所需勋章"
          prop="productBadge"
        >
          <el-input v-model="dataForm.productBadge" />
        </el-form-item>
        <el-form-item label="产品封面轮播图">
          <el-upload
            :headers="headers"
            :action="uploadPath"
            :multiple="true"
            :file-list="productImagefileList"
            :on-success="handleProductImageUploadSuccess"
            :on-remove="handleProductImageRemove"
            :before-upload="beforeProductImageUpload"
            list-type="picture-card"
            accept=".jpg,.jpeg,.png,.gif"
          >
            <i class="el-icon-plus" />
            <div
              slot="file"
              slot-scope="{file}"
            >
              <img
                class="el-upload-list__item-thumbnail"
                :src="file.url"
                alt=""
              >
              <span class="el-upload-list__item-actions">
                <span
                  class="el-upload-list__item-preview"
                  @click="handleProductImagePictureCardPreview(file)"
                >
                  <i class="el-icon-zoom-in" />
                </span>
                <span
                  class="el-upload-list__item-delete"
                  @click="handleProductImageRemove(file)"
                >
                  <i class="el-icon-delete" />
                </span>
              </span>
            </div>
          </el-upload>
          <el-dialog :visible.sync="productImageVisible">
            <img
              width="100%"
              :src="productImageUrl"
              alt=""
            >
          </el-dialog>
        </el-form-item>

        <el-form-item label="产品详情">
          <el-upload
            :headers="headers"
            :action="uploadPath"
            :multiple="true"
            :file-list="fileList"
            :on-success="handleProductDetailUploadSuccess"
            :on-remove="handleProductDetailRemove"
            :before-upload="beforeProductDetailUpload"
            list-type="picture-card"
            accept=".jpg,.jpeg,.png,.gif"
          >
            <i class="el-icon-plus" />
            <div
              slot="file"
              slot-scope="{file}"
            >
              <img
                class="el-upload-list__item-thumbnail"
                :src="file.url"
                alt=""
              >
              <span class="el-upload-list__item-actions">
                <span
                  class="el-upload-list__item-preview"
                  @click="handleProductDetailPictureCardPreview(file)"
                >
                  <i class="el-icon-zoom-in" />
                </span>
                <span
                  class="el-upload-list__item-delete"
                  @click="handleProductDetailRemove(file)"
                >
                  <i class="el-icon-delete" />
                </span>
              </span>
            </div>
          </el-upload>
          <el-dialog :visible.sync="dialogVisible">
            <img
              width="100%"
              :src="dialogImageUrl"
              alt=""
            >
          </el-dialog>
        </el-form-item>
        <el-form-item
          label="是否有效"
          prop="available"
        >
          <el-radio-group v-model="dataForm.available">
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
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
import { getMarketProductList, getMarketProductById, deleteMarketProduct, addMarketProduct, updateMarketProduct, getMarketSeries, getProductLevels } from '@/api/business/marketProduct'
import { uploadPath } from '@/api/business/storage'
import { getToken } from '@/utils/auth'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {
  name: 'MarketProduct',
  components: { Pagination },
  data() {
    return {
      uploadPath,
      list: undefined,
      total: 0,
      listLoading: true,
      productSeriesList: [],
      productLevels: [],
      listQuery: {
        page: 1,
        limit: 20,
        id: undefined,
        name: undefined,
        sort: 'add_time',
        order: 'desc'
      },
      dataForm: {
        id: undefined,
        name: '',
        keywords: '',
        level: 'L2',
        pid: undefined,
        desc: '',
        iconUrl: undefined,
        picUrl: undefined,
        productImage: '',
        productDetail: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      rules: {
        name: [{ required: true, message: '产品名不能为空', trigger: 'blur' }]
      },
      downloadLoading: false,
      productImagefileList: [],
      productImageVisible: false, // 用于显示已上传图片列表
      productImageUrl: '',
      fileList: [],
      dialogVisible: false, // 用于显示已上传图片列表
      dialogImageUrl: ''

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
    this.init()
    if (this.dataForm.productImage) {
      this.productImagefileList = this.dataForm.productImage.split(';').filter(url => url).map(url => {
        return {
          name: url.substring(url.lastIndexOf('/') + 1),
          url: url
        }
      })
    }
    if (this.dataForm.productDetail) {
      this.fileList = this.dataForm.productDetail.split(';').filter(url => url).map(url => {
        return {
          name: url.substring(url.lastIndexOf('/') + 1),
          url: url
        }
      })
    }
  },
  methods: {
    init: function() {
      getMarketSeries().then(response => {
        this.productSeriesList = response.data.data.items
      })

      getProductLevels().then(response => {
        this.productLevels = response.data.data.items
      })
    },

    getList() {
      this.listLoading = true
      getMarketProductList(this.listQuery)
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
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    resetForm() {
      this.dataForm = {
        id: undefined,
        name: '',
        keywords: '',
        level: 'L2',
        pid: undefined,
        desc: '',
        iconUrl: undefined,
        picUrl: undefined,
        productImagefileList: [],
        fileList: []
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
          addMarketProduct(this.dataForm)
            .then(response => {
              this.list.unshift(response.data.data)
              this.dialogFormVisible = false
              this.$notify.success({
                title: '成功',
                message: '创建成功'
              })
              this.productImagefileList = []
              this.fileList = []
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
      this.loadExistingImages(row)
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          updateMarketProduct(this.dataForm)
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
              this.productImagefileList = []
              this.fileList = []
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
      deleteMarketProduct(row)
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
    loadExistingImages(row) {
      // 假设从API获取数据
      getMarketProductById({ 'productId': row.productId }).then(response => {
        console.log(response.data)
        this.dataForm.productImage = response.data.data.productImage
        this.dataForm.productDetail = response.data.data.productDetail

        // 将分号分隔的URL转换为fileList格式
        if (this.dataForm.productImage) {
          this.productImagefileList = this.dataForm.productImage.split(';')
            .filter(url => url.trim()) // 过滤空字符串
            .map(url => {
              return {
                name: this.extractFileName(url),
                url: url,
                status: 'success' // 标记为已上传成功
              }
            })
        }

        if (this.dataForm.productDetail) {
          this.fileList = this.dataForm.productDetail.split(';')
            .filter(url => url.trim()) // 过滤空字符串
            .map(url => {
              return {
                name: this.extractFileName(url),
                url: url,
                status: 'success' // 标记为已上传成功
              }
            })
        }
      })
    },
    // 从URL提取文件名
    extractFileName(url) {
      return url.substring(url.lastIndexOf('/') + 1)
    },
    // 上传前的处理
    beforeProductImageUpload(file) {
      const isImage = file.type.includes('image/')
      const isLt5M = file.size / 1024 / 1024 < 5

      if (!isImage) {
        this.$message.error('只能上传图片文件!')
      }
      if (!isLt5M) {
        this.$message.error('图片大小不能超过5MB!')
      }
      return isImage && isLt5M
    },
    // 上传前的处理
    beforeProductDetailUpload(file) {
      const isImage = file.type.includes('image/')
      const isLt5M = file.size / 1024 / 1024 < 5

      if (!isImage) {
        this.$message.error('只能上传图片文件!')
      }
      if (!isLt5M) {
        this.$message.error('图片大小不能超过5MB!')
      }
      return isImage && isLt5M
    },
    // 上传成功处理
    handleProductImageUploadSuccess(response, file, fileList) {
      // 假设response.data.url是返回的图片地址
      const newUrl = response.data.url

      // 更新fileList显示
      this.productImagefileList = fileList.map(item => {
        if (item.response) {
          return {
            name: newUrl.substring(newUrl.lastIndexOf('/') + 1),
            url: newUrl
          }
        }
        return item
      })
      // 更新productImage为分号分隔的字符串
      this.updateProductImage()
    },

    // 删除图片处理
    handleProductImageRemove(file) {
      this.fileList = this.fileList.filter(filefilter => filefilter.name !== file.name)
      this.updateProductImage()
    },

    // 预览图片
    handleProductImagePictureCardPreview(file) {
      this.productImageUrl = file.url
      this.productImageVisible = true
    },

    // 更新活动详情图片数据
    updateProductImage() {
      this.dataForm.productImage = this.productImagefileList
        .map(file => file.url)
        .join(';')
    },
    updateProductDetail() {
      this.dataForm.productDetail = this.fileList
        .map(file => file.url)
        .join(';')
    },
    formatPercentage(row, column, cellValue) {
      return cellValue + '%'
    },
    // 上传成功处理
    handleProductDetailUploadSuccess(response, file, fileList) {
      // 假设response.data.url是返回的图片地址
      const newUrl = response.data.url

      // 更新fileList显示
      this.fileList = fileList.map(item => {
        if (item.response) {
          return {
            name: newUrl.substring(newUrl.lastIndexOf('/') + 1),
            url: newUrl
          }
        }
        return item
      })
      // 更新productDetail为分号分隔的字符串
      this.updateProductDetail()
    },
    // 删除图片处理
    handleProductDetailRemove(file) {
      this.fileList = this.fileList.filter(filefilter => filefilter.name !== file.name)
      this.updateProductDetail()
    },

    // 预览图片
    handleProductDetailPictureCardPreview(file) {
      this.dialogImageUrl = file.url
      this.dialogVisible = true
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
</style>
