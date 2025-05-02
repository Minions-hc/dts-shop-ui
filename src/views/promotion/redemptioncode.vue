<template>
  <div class="app-container">

    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input
        v-model="listQuery.code"
        clearable
        size="mini"
        class="filter-item"
        style="width: 200px;"
        placeholder="请输入兑换码"
      />
      <el-select
        v-model="listQuery.available"
        clearable
        size="mini"
        style="width: 200px"
        class="filter-item"
        placeholder="请选择兑换码状态"
      >
        <el-option
          v-for="type in availableOptions"
          :key="type.value"
          :label="type.label"
          :value="type.value"
        />
      </el-select>
      <el-select
        v-model="listQuery.codeType"
        clearable
        size="mini"
        style="width: 200px"
        class="filter-item"
        placeholder="请选择兑换码类型"
      >
        <el-option
          v-for="type in codeTypeOptions"
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
        label="兑换码"
        prop="code"
      />

      <!-- 是否有效列 -->
      <el-table-column
        align="center"
        label="是否有效"
        prop="available"
      >
        <template slot-scope="scope">
          <el-tag
            v-if="scope.row && scope.row.available !== undefined"
            :type="scope.row.available ? 'success' : 'danger'"
          >
            {{ scope.row.available ? '有效' : '无效' }}
          </el-tag>
          <span v-else>-</span> <!-- 或者显示其他默认值 -->
        </template>
      </el-table-column>

      <!-- 兑换码类型列 -->
      <el-table-column
        align="center"
        label="兑换码类型"
        prop="codeType"
      >
        <template slot-scope="scope">
          <el-tag v-if="scope.row && scope.row.codeType !== undefined">
            {{ formatCodeType(scope.row.codeType) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        min-width="100px"
        label="操作"
      >
        <template slot-scope="scope">
          <el-button
            v-permission="['POST /admin/coupon/delete']"
            :type="scope.row.codeType === 0 ? 'danger' : 'info'"
            size="mini"
            :disabled="scope.row.codeType !== 0"
            :class="{ 'disabled-button': scope.row.codeType !== 0 }"
            @click="handleDelete(scope.row)"
          >
            删除
          </el-button>
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
  </div>
</template>

<script>
import { listRedemptionCode, createRedemptionCode, deleteRedemptionCode } from '@/api/business/redemptioncode'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
const defaultAvailableOptions = [
  {
    label: '有效',
    value: 1
  },
  {
    label: '无效',
    value: 0
  }
]
const defaultCodeTypeOptions = [
  {
    label: '全部',
    value: undefined
  },
  {
    label: '优惠券',
    value: 1
  },
  {
    label: '奖品',
    value: 2
  },
  {
    label: '未分配',
    value: 0
  }
]

export default {
  name: 'Coupon',
  components: { Pagination },
  data() {
    return {
      codeTypeOptions: Object.assign({}, defaultCodeTypeOptions),
      availableOptions: Object.assign({}, defaultAvailableOptions),
      list: undefined,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        code: undefined,
        codeType: undefined,
        available: undefined,
        sort: 'add_time',
        order: 'desc'
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 获取可用性标签类型
    getAvailableTagType(available) {
      if (available === 1) return 'success'
      if (available === 0) return 'danger'
      return 'info'
    },
    // 格式化是否有效
    formatAvailable(available) {
      if (available === 1) return '有效'
      if (available === 0) return '无效'
      return '未知状态' // 处理其他意外情况
    },

    // 格式化兑换码类型
    formatCodeType(codeType) {
      if (codeType === 1) return '优惠券'
      if (codeType === 2) return '奖品'
      if (codeType === null || codeType === 0) return '未分配'
      return '未知类型' // 处理其他意外情况
    },
    getList() {
      this.listLoading = true
      listRedemptionCode(this.listQuery)
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

    handleCreate() {
      createRedemptionCode(this.dataForm)
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
    },

    handleDelete(row) {
      console.log(row)
      console.log(row.code)
      deleteRedemptionCode(row.code)
        .then(response => {
          this.$notify.success({
            title: '成功',
            message: '删除优惠券成功'
          })
          const index = this.list.indexOf(row)
          this.list.splice(index, 1)
          this.getList()
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
.el-tag {
  margin: 2px;
}
.disabled-button {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
