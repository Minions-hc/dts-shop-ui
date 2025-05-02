<template>
  <div class="app-container">

    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input
        v-model="listQuery.periodNumber"
        clearable
        size="mini"
        class="filter-item"
        style="width: 200px;"
        placeholder="请输入活动期数"
      />
      <el-input
        v-model="listQuery.activityName"
        clearable
        size="mini"
        class="filter-item"
        style="width: 200px;"
        placeholder="请输入活动名字"
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
        label="活动期数"
        prop="periodNumber"
      />
      <el-table-column
        align="center"
        min-width="200px"
        label="活动名字"
        prop="activityName"
      />
      <el-table-column
        align="center"
        min-width="200px"
        label="活动规则"
        prop="activityRules"
      />
      <el-table-column
        align="center"
        min-width="200px"
        label="开奖日期"
        prop="drawDate"
      />
      <el-table-column
        align="center"
        label="是否生效"
        prop="active"
      >
        <template slot-scope="scope">
          <el-tag :type="scope.row.active ? 'success' : 'error' ">{{ scope.row.active ? '是' : '否' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        min-width="200px"
        label="活动详情"
      >
        <template slot-scope="scope">
          <div v-if="scope.row.activityDetails">
            <div
              v-for="(img, index) in scope.row.activityDetails.split(';')"
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
        style="width: 500px; margin-left:50px;"
      >
        <el-form-item
          label="活动期数"
          prop="periodNumber"
        >
          <el-input v-model="dataForm.periodNumber" />
        </el-form-item>

        <el-form-item
          label="活动名称"
          prop="activityName"
        >
          <el-input v-model="dataForm.activityName" />
        </el-form-item>

        <el-form-item
          label="活动规则"
          prop="activityRules"
        >
          <el-input
            v-model="dataForm.activityRules"
            type="textarea"
            :rows="5"
            placeholder="请输入活动规则，每条规则换行输入，例如：
              1. 每人每天可参与3次
              2. 分享可获得额外机会
              3. 活动最终解释权归主办方所有"
            resize="none"
            show-word-limit
            :maxlength="500"
          />
        </el-form-item>

        <el-form-item
          label="开奖日期"
          prop="drawDate"
        >
          <el-date-picker
            v-model="dataForm.drawDate"
            type="datetime"
            placeholder="选择开奖日期时间"
            value-format="yyyy-MM-dd HH:mm:ss"
            format="yyyy-MM-dd HH:mm"
            :picker-options="pickerOptions"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item
          label="是否生效"
          prop="active"
        >
          <el-radio-group
            v-model="dataForm.active"
            @change="handleActiveChange"
          >
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="活动详情图片">
          <el-upload
            :headers="headers"
            :action="uploadPath"
            :multiple="true"
            :file-list="fileList"
            :on-success="handleUploadSuccess"
            :on-remove="handleRemove"
            :before-upload="beforeUpload"
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
                  @click="handlePictureCardPreview(file)"
                >
                  <i class="el-icon-zoom-in" />
                </span>
                <span
                  class="el-upload-list__item-delete"
                  @click="handleRemove(file)"
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
import { listLuckyDraw, deleteLuckyDraw, createLuckyDraw, updateLuckyDraw, getActivityDetails } from '@/api/business/luckydraw'
import BackToTop from '@/components/BackToTop'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { uploadPath } from '@/api/business/storage'
import { getToken } from '@/utils/auth'

export default {
  name: 'ArticleList',
  components: { BackToTop, Pagination },
  data() {
    return {
      uploadPath,
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        title: undefined,
        sort: 'add_time',
        order: 'desc',
        activityId: undefined
      },
      dialogFormVisible: false,
      dialogStatus: '',
      isEditMode: false,
      textMap: {
        update: '编辑',
        create: '创建'
      },
      dataForm: {
        id: undefined,
        rankName: '',
        rankOrder: undefined,
        percentage: undefined,
        activityDetails: '',
        drawDate: ''
      },
      rules: {
        drawDate: [
          { required: true, message: '请选择开奖日期', trigger: 'blur' }
        ]
      },
      // 日期选择器配置
      pickerOptions: {
        disabledDate(time) {
          // 禁用今天之前的日期
          return time.getTime() < Date.now() - 8.64e7 // 8.64e7是一天的毫秒数
        },
        shortcuts: [{
          text: '今天',
          onClick(picker) {
            const now = new Date()
            now.setHours(19)
            now.setMinutes(0)
            now.setSeconds(0)
            picker.$emit('pick', now)
          }
        }, {
          text: '明天',
          onClick(picker) {
            const now = new Date()
            now.setDate(now.getDate() + 1)
            now.setHours(19)
            now.setMinutes(0)
            now.setSeconds(0)
            picker.$emit('pick', now)
          }
        }, {
          text: '一周后',
          onClick(picker) {
            const now = new Date()
            now.setDate(now.getDate() + 7)
            now.setHours(19)
            now.setMinutes(0)
            now.setSeconds(0)
            picker.$emit('pick', now)
          }
        }]
      },
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
    if (this.dataForm.activityDetails) {
      this.fileList = this.dataForm.activityDetails.split(';').filter(url => url).map(url => {
        return {
          name: url.substring(url.lastIndexOf('/') + 1),
          url: url
        }
      })
    }
  },
  methods: {
    handleActiveChange(value) {
      if (value === true) {
        this.$confirm(
          '只能存在一个有效的活动，生效该活动会导致其他活动失效！',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).then(() => {
          // 用户点击确定后的逻辑
          this.dataForm.active = true
        }).catch(() => {
          // 用户点击取消后恢复为false
          this.dataForm.active = false
        })
      }
    },
    loadExistingImages(row) {
      // 假设从API获取数据
      getActivityDetails({ 'activityId': row.activityId }).then(response => {
        console.log(response.data)
        this.dataForm.activityDetails = response.data.data.activityDetails

        // 将分号分隔的URL转换为fileList格式
        if (this.dataForm.activityDetails) {
          this.fileList = this.dataForm.activityDetails.split(';')
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

    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    // 表单提交方法
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          // 处理表单提交
          console.log('开奖日期:', this.form.drawDate)
        }
      })
    },
    // 上传前的处理
    beforeUpload(file) {
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
    handleUploadSuccess(response, file, fileList) {
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
      // 更新activityDetails为分号分隔的字符串
      this.updateActivityDetails()
    },

    // 删除图片处理
    handleRemove(file) {
      this.fileList = this.fileList.filter(filefilter => filefilter.name !== file.name)
      this.updateActivityDetails()
    },

    // 预览图片
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },

    // 更新活动详情图片数据
    updateActivityDetails() {
      this.dataForm.activityDetails = this.fileList
        .map(file => file.url)
        .join(';')
    },
    formatPercentage(row, column, cellValue) {
      return cellValue + '%'
    },
    getList() {
      this.listLoading = true
      listLuckyDraw(this.listQuery).then(response => {
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
        percentage: undefined,
        activityDetails: '',
        drawDate: ''
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
    createData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          createLuckyDraw(this.dataForm)
            .then(response => {
              this.list.unshift(response.data.data)
              this.dialogFormVisible = false
              this.$notify.success({
                title: '成功',
                message: '创建成功'
              })
              this.getList()
              this.fileList = []
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
          console.log(this.dataForm)
          updateLuckyDraw(this.dataForm)
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
              this.fileList = []
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
      deleteLuckyDraw(row).then(response => {
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
  /* 图片卡片样式 */
.el-upload-list--picture-card .el-upload-list__item {
  width: 145px;
  height: 145px;
}

/* 缩略图样式 */
.el-upload-list__item-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 图片操作按钮样式 */
.el-upload-list__item-actions {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  cursor: default;
  text-align: center;
  color: #fff;
  opacity: 0;
  font-size: 20px;
  background-color: rgba(0, 0, 0, 0.5);
  transition: opacity .3s;
  display: flex;
  justify-content: center;
  align-items: center;
}

.el-upload-list__item-actions span {
  margin: 0 5px;
  cursor: pointer;
}

.el-upload-list__item-actions:hover {
  opacity: 1;
}
</style>
