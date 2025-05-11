<template>
  <div class="app-container">

    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input
        v-model="listQuery.userId"
        clearable
        size="mini"
        class="filter-item"
        style="width: 200px;"
        placeholder="请输入用户ID"
      />
      <el-select
        v-model="listQuery.activityType"
        multiple
        size="mini"
        style="width: 200px"
        class="filter-item"
        placeholder="请选择活动类型"
      >
        <el-option
          v-for="(key, value) in activityTypeMap"
          :key="key"
          :label="key"
          :value="value"
        />
      </el-select>
      <el-select
        v-model="listQuery.status"
        multiple
        size="mini"
        style="width: 200px"
        class="filter-item"
        placeholder="请选择状态"
      >
        <el-option
          v-for="(key, value) in statusMap"
          :key="key"
          :label="key"
          :value="value"
        />
      </el-select>
      <el-button
        v-permission="['GET /admin/order/queryOrderList']"
        size="mini"
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
        min-width="100"
        label="ID"
        prop="id"
        sortable
      />

      <el-table-column
        align="center"
        min-width="100px"
        label="用户ID"
        prop="userId"
      />

      <el-table-column
        align="center"
        min-width="100px"
        label="产品ID"
        prop="productId"
      />

      <el-table-column
        align="center"
        min-width="100px"
        label="产品名称"
        prop="productName"
      />

      <el-table-column
        align="center"
        min-width="100px"
        label="产品勋章数量"
        prop="productBadge"
      />

      <el-table-column
        align="center"
        min-width="100px"
        label="活动类型"
        prop="activityType"
      >
        <template slot-scope="scope">
          <el-tag>{{ scope.row.activityType }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        min-width="100px"
        label="产品级别"
        prop="productLevel"
      >
        <template slot-scope="scope">
          <el-tag>{{ scope.row.productLevel }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        min-width="100px"
        label="状态"
        prop="status"
      >
        <template slot-scope="scope">
          <el-tag>{{ scope.row.status | statusFilter }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        min-width="100px"
        label="关联订单ID"
        prop="orderId"
      />

      <el-table-column
        align="center"
        min-width="100px"
        label="箱子序号"
        prop="boxNumber"
      />

      <el-table-column
        align="center"
        min-width="100px"
        label="获得时间"
        prop="obtainTime"
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
import { listBoxProduct } from '@/api/business/boxproduct'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import checkPermission from '@/utils/permission' // 权限判断函数

const statusMap = {
  'pending': '待处理',
  'locked': '锁定中',
  'shipped': '已提货'
}
const activityTypeMap = {
  '一番赏': '一番赏',
  '踩雷赏': '踩雷赏',
  '魂力赏': '魂力赏',
  '集市换娃': '集市换娃',
  '幸运大抽奖': '幸运大抽奖'
}

export default {
  name: 'BoxProduct',
  components: { Pagination },
  filters: {
    statusFilter(status) {
      return statusMap[status]
    }
  },
  data() {
    return {
      list: undefined,
      total: 0,
      listLoading: true,
      logisticsList: [],
      listQuery: {
        page: 1,
        limit: 20,
        id: undefined,
        name: undefined,
        orderStatusArray: [],
        sort: 'add_time',
        order: 'desc'
      },
      statusMap,
      activityTypeMap,
      orderDialogVisible: false,
      orderDetail: {
        order: {},
        user: {},
        orderGoods: []
      },
      shipForm: {
        orderId: undefined,
        shipChannel: undefined,
        shipSn: undefined
      },
      shipDialogVisible: false,
      refundForm: {
        orderId: undefined,
        refundMoney: undefined
      },
      refundDialogVisible: false,
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    checkPermission,
    getList() {
      this.listLoading = true
      listBoxProduct(this.listQuery).then(response => {
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
    }
  }
}
</script>

<style>

</style>
