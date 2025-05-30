<template>
  <div class="app-container">

    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input
        v-model="listQuery.couponName"
        clearable
        size="mini"
        class="filter-item"
        style="width: 200px;"
        placeholder="请输入优惠券名称"
      />
      <el-input
        v-model="listQuery.redemptionCode"
        clearable
        size="mini"
        class="filter-item"
        style="width: 200px;"
        placeholder="请输入优惠券兑换码"
      />
      <el-select
        v-model="listQuery.status"
        clearable
        size="mini"
        style="width: 200px"
        class="filter-item"
        placeholder="请选择优惠券状态"
      >
        <el-option
          v-for="type in statusOptions"
          :key="type.value"
          :label="type.label"
          :value="type.value"
        />
      </el-select>
      <el-button
        v-permission="['GET /admin/coupon/list']"
        size="mini"
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >查找</el-button>
      <el-button
        v-permission="['POST /admin/coupon/create']"
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
        min-width="100px"
        label="优惠券ID"
        prop="couponId"
        sortable
      />

      <el-table-column
        align="center"
        min-width="100px"
        label="优惠券名称"
        prop="couponName"
      />

      <el-table-column
        align="center"
        min-width="80px"
        label="优惠券类型"
        prop="couponType"
      >
        <template slot-scope="scope">
          <el-tag :type="scope.row.couponType === 1 ? '' : 'success'">
            {{ scope.row.couponType === 1 ? '无门槛券' : '满减券' }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 新增：最低消费金额列 -->
      <el-table-column
        align="center"
        min-width="80px"
        label="最低消费金额"
        prop="minOrderAmount"
      >
        <template slot-scope="scope">
          {{ scope.row.couponType === 2 ? `${scope.row.minOrderAmount}元` : '无限制' }}
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        min-width="80px"
        label="优惠金额"
        prop="couponAmount"
      >
        <template slot-scope="scope">{{ scope.row.couponAmount }}元</template>
      </el-table-column>

      <el-table-column
        align="center"
        min-width="80px"
        label="优惠券数量"
        prop="totalQuantity"
      />

      <el-table-column
        align="center"
        min-width="80px"
        label="剩余数量"
        prop="remainingQuantity"
      />

      <el-table-column
        align="center"
        min-width="100px"
        label="有效期"
        prop="expireTime"
      />

      <el-table-column
        align="center"
        min-width="100px"
        label="兑换码"
        prop="redemptionCode"
      />

      <el-table-column
        align="center"
        min-width="60px"
        label="状态"
        prop="status"
      >
        <template slot-scope="scope">{{ scope.row.status | formatStatus }}</template>
      </el-table-column>

      <el-table-column
        align="center"
        min-width="100px"
        label="操作"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            v-permission="['GET /admin/coupon/read']"
            type="primary"
            size="mini"
            @click="handleDetail(scope.row)"
          >详情</el-button>
          <el-button
            v-permission="['POST /admin/coupon/update']"
            type="primary"
            size="mini"
            @click="handleUpdate(scope.row)"
          >编辑</el-button>
          <el-button
            v-permission="['POST /admin/coupon/delete']"
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
        <el-form-item
          label="优惠券名称"
          prop="couponName"
        >
          <el-input v-model="dataForm.couponName" />
        </el-form-item>
        <!-- 新增：优惠券类型选择 -->
        <el-form-item
          label="优惠券类型"
          prop="couponType"
        >
          <el-select
            v-model="dataForm.couponType"
            placeholder="请选择优惠券类型"
            style="width: 100%"
            @change="handleCouponTypeChange"
          >
            <el-option
              label="无门槛券"
              :value="1"
            />
            <el-option
              label="满减券"
              :value="2"
            />
          </el-select>
        </el-form-item>
        <!-- 新增：最低订单金额（仅满减券显示） -->
        <el-form-item
          v-if="dataForm.couponType === 2"
          label="最低订单金额"
          prop="minOrderAmount"
        >
          <el-input v-model="dataForm.minOrderAmount">
            <template slot="append">元</template>
          </el-input>
        </el-form-item>
        <el-form-item
          label="优惠金额"
          prop="couponAmount"
        >
          <el-input v-model="dataForm.couponAmount">
            <template slot="append">元</template>
          </el-input>
        </el-form-item>
        <el-form-item
          label="优惠券数量"
          prop="totalQuantity"
        >
          <el-input v-model="dataForm.totalQuantity">
            <template slot="append">张</template>
          </el-input>
        </el-form-item>
        <el-form-item
          label="剩余数量"
          prop="remainingQuantity"
        >
          <el-input v-model="dataForm.remainingQuantity">
            <template slot="append">张</template>
          </el-input>
        </el-form-item>

        <el-form-item
          label="有效期"
          prop="expireTime"
        >
          <el-date-picker
            v-model="dataForm.expireTime"
            type="datetime"
            placeholder="选择优惠结束日期"
            value-format="yyyy-MM-dd HH:mm:ss"
            format="yyyy-MM-dd HH:mm"
            :picker-options="pickerOptions"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item
          label="是否有效"
          prop="status"
        >
          <el-radio-group v-model="dataForm.status">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="2">否</el-radio>
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
import { listCoupon, createCoupon, updateCoupon, deleteCoupon } from '@/api/business/coupon'
import { listRedemptionCode } from '@/api/business/redemptioncode'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

const defaultStatusOptions = [
  {
    label: '有效',
    value: 1
  },
  {
    label: '无效',
    value: 2
  },
  {
    label: '已过期',
    value: 3
  }
]

export default {
  name: 'Coupon',
  components: { Pagination },
  filters: {
    formatStatus(status) {
      if (status === 1) {
        return '有效'
      }
      if (status === 2) {
        return '无效'
      }
      if (status === 3) {
        return '已过期'
      }
    }
  },
  data() {
    return {
      redemptionCodes: [],
      rules: {
        expireTime: [
          { required: true, message: '请选择优惠结束日期', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '优惠券标题不能为空', trigger: 'blur' }
        ],
        couponType: [
          { required: true, message: '请选择优惠券类型', trigger: 'change' }
        ],
        minOrderAmount: [
          { required: false },
          {
            validator: (rule, value, callback) => {
              if (this.dataForm.couponType === 2 && !value) {
                callback(new Error('满减券必须设置最低订单金额'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          },
          {
            pattern: /^\d+(\.\d{1,2})?$/,
            message: '请输入正确的金额格式',
            trigger: 'blur'
          }
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
      statusOptions: Object.assign({}, defaultStatusOptions),
      list: undefined,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        name: undefined,
        type: undefined,
        status: undefined,
        sort: 'add_time',
        order: 'desc'
      },
      dataForm: {
        id: undefined,
        name: undefined,
        desc: undefined,
        tag: undefined,
        total: 0,
        discount: 0,
        min: 0,
        limit: 1,
        type: 0,
        status: 0,
        goodsType: 0,
        goodsValue: [],
        timeType: 0,
        days: 0,
        startTime: null,
        endTime: null,
        expireTime: null,
        couponType: 1, // 默认选择无门槛券
        minOrderAmount: null // 最低订单金额
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    handleCouponTypeChange(value) {
      // 切换优惠券类型时重置最低订单金额
      if (value === 1) {
        this.dataForm.minOrderAmount = null
      }
    },
    loadLSelectOptionData() {
      listRedemptionCode({ available: true, codeType: 0 }).then(response => {
        this.redemptionCodes = response.data.data.items
      })
    },
    getList() {
      this.listLoading = true
      listCoupon(this.listQuery)
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
        name: undefined,
        desc: undefined,
        tag: undefined,
        total: 0,
        discount: 0,
        min: 0,
        limit: 1,
        type: 0,
        status: 0,
        goodsType: 0,
        goodsValue: [],
        timeType: 0,
        days: 0,
        startTime: null,
        endTime: null
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
          const formData = {
            ...this.dataForm,
            // 如果是无门槛券，确保minOrderAmount为null
            minOrderAmount: this.dataForm.couponType === 1 ? null : this.dataForm.minOrderAmount
          }
          createCoupon(formData)
            .then(response => {
              this.list.unshift(response.data.data)
              this.dialogFormVisible = false
              this.$notify.success({
                title: '成功',
                message: '创建优惠券成功'
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
        if (this.dataForm.days === 0) {
          this.dataForm.daysType = 1
        } else {
          this.dataForm.daysType = 0
        }
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          const formData = {
            ...this.dataForm,
            // 如果是无门槛券，确保minOrderAmount为null
            minOrderAmount: this.dataForm.couponType === 1 ? null : this.dataForm.minOrderAmount
          }
          updateCoupon(formData)
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
                message: '更新优惠券成功'
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
      deleteCoupon(row)
        .then(response => {
          this.$notify.success({
            title: '成功',
            message: '删除优惠券成功'
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
    handleDetail(row) {
      this.$router.push({ path: '/promotion/couponDetail', query: { couponId: row.couponId }})
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = [
          '优惠券ID',
          '名称',
          '内容',
          '标签',
          '最低消费',
          '减免金额',
          '每人限领',
          '优惠券数量'
        ]
        const filterVal = [
          'id',
          'name',
          'desc',
          'tag',
          'min',
          'discount',
          'limit',
          'total'
        ]
        excel.export_json_to_excel2(tHeader, this.list, filterVal, '优惠券信息')
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
  width: 120px;
  height: 120px;
  display: block;
}
</style>
