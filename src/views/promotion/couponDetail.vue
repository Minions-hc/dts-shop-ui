<template>
  <div class="app-container">

    <div class="table-layout">
      <el-row>
        <el-col
          :span="4"
          class="table-cell-title"
        >优惠券ID</el-col>
        <el-col
          :span="4"
          class="table-cell-title"
        >优惠券名称</el-col>
        <el-col
          :span="4"
          class="table-cell-title"
        >优惠金额</el-col>
        <el-col
          :span="4"
          class="table-cell-title"
        >总数量</el-col>

      </el-row>
      <el-row>
        <el-col
          :span="4"
          class="table-cell"
        >{{ coupon.couponId }}</el-col>
        <el-col
          :span="4"
          class="table-cell"
        >{{ coupon.couponName }}</el-col>
        <el-col
          :span="4"
          class="table-cell"
        >{{ coupon.couponAmount }}元</el-col>
        <el-col
          :span="4"
          class="table-cell"
        >{{ coupon.totalQuantity }}</el-col>
      </el-row>
      <el-row>
        <el-col
          :span="4"
          class="table-cell-title"
        >剩余数量</el-col>
        <el-col
          :span="4"
          class="table-cell-title"
        >当前状态</el-col>
        <el-col
          :span="4"
          class="table-cell-title"
        >过期时间</el-col>
        <el-col
          :span="4"
          class="table-cell-title"
        >优惠兑换码</el-col>
      </el-row>
      <el-row>
        <el-col
          :span="4"
          class="table-cell"
        >{{ coupon.remainingQuantity }}</el-col>
        <el-col
          :span="4"
          class="table-cell"
        >{{ coupon.status | formatStatus }}</el-col>
        <el-col
          :span="4"
          class="table-cell"
        >{{ coupon.expireTime }}</el-col>
        <el-col
          :span="4"
          class="table-cell"
        >{{ coupon.redemptionCode }}</el-col>
      </el-row>
    </div>

    <!-- 查询操作 -->
    <div class="filter-container">
      <el-input
        v-model="listQuery.userId"
        clearable
        class="filter-item"
        style="width: 200px;"
        placeholder="请输入用户ID"
      />
      <el-select
        v-model="listQuery.status"
        clearable
        style="width: 200px"
        class="filter-item"
        placeholder="请选择使用状态"
      >
        <el-option
          v-for="type in useStatusOptions"
          :key="type.value"
          :label="type.label"
          :value="type.value"
        />
      </el-select>
      <el-button
        v-permission="['GET /admin/coupon/listuser']"
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >查找</el-button>
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
        label="用户ID"
        prop="userId"
      />

      <el-table-column
        align="center"
        label="领取时间"
        prop="createTime"
      />

      <el-table-column
        align="center"
        label="优惠价格"
        prop="couponAmount"
      />

      <el-table-column
        align="center"
        label="使用状态"
        prop="status"
      >
        <template slot-scope="scope">{{ scope.row.status | formatUseStatus }}</template>
      </el-table-column>

      <el-table-column
        align="center"
        label="订单ID"
        prop="orderId"
      />

      <el-table-column
        align="center"
        label="使用时间"
        prop="useTime"
      />

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
import { readCoupon, listCouponUser } from '@/api/business/coupon'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

const defaultUseStatusOptions = [
  {
    label: '未使用',
    value: 1
  },
  {
    label: '已使用',
    value: 2
  },
  {
    label: '已过期',
    value: 3
  }
]

export default {
  name: 'CouponDetail',
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
        return '过期'
      }
    },
    formatUseStatus(status) {
      if (status === 1) {
        return '未使用'
      }
      if (status === 2) {
        return '已使用'
      }
      if (status === 3) {
        return '已过期'
      }
    }
  },
  data() {
    return {
      useStatusOptions: Object.assign({}, defaultUseStatusOptions),
      coupon: {},
      list: undefined,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        couponId: 0,
        userId: undefined,
        status: undefined,
        sort: 'add_time',
        order: 'desc'
      },
      downloadLoading: false
    }
  },
  created() {
    this.init()
  },
  methods: {
    init: function() {
      if (this.$route.query.couponId == null) {
        return
      }
      readCoupon(this.$route.query.couponId).then(response => {
        this.coupon = response.data.data
      })
      this.listQuery.couponId = this.$route.query.couponId
      this.getList()
    },
    getList() {
      this.listLoading = true
      listCouponUser(this.listQuery)
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

    getGoodsScope() {
    }
  }
}
</script>
<style scoped>
  .filter-container {
    margin-top: 20px;
  }

  .table-layout {
    margin-top: 20px;
    border-left: 1px solid #DCDFE6;
    border-top: 1px solid #DCDFE6;
  }
  .table-cell {
    height: 60px;
    line-height: 40px;
    border-right: 1px solid #DCDFE6;
    border-bottom: 1px solid #DCDFE6;
    padding: 10px;
    font-size: 14px;
    color: #606266;
    text-align: center;
    overflow: hidden;
  }
  .table-cell-title {
    border-right: 1px solid #DCDFE6;
    border-bottom: 1px solid #DCDFE6;
    padding: 10px;
    background: #F2F6FC;
    text-align: center;
    font-size: 14px;
    color: #303133;
  }
</style>
