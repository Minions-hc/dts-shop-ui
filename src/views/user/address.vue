<template>
  <div class="app-container">

    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input v-model="listQuery.userId" clearable size="small" class="filter-item" style="width: 200px;" placeholder="请输入用户ID"/>
      <el-input v-model="listQuery.userName" clearable size="small" class="filter-item" style="width: 200px;" placeholder="请输入用户名称"/>
      <el-input v-model="listQuery.receiverName" clearable size="small" class="filter-item" style="width: 200px;" placeholder="请输入收货人名称"/>
      <el-button class="filter-item" type="primary" size="mini" icon="el-icon-search" @click="handleFilter">查找</el-button>
      <el-button :loading="downloadLoading" size="mini" class="filter-item" type="warning" icon="el-icon-download" @click="handleDownload">导出</el-button>
    </div>

    <!-- 查询结果 -->
    <el-table v-loading="listLoading" :data="list" size="small" element-loading-text="正在查询中。。。" border fit highlight-current-row>

      <el-table-column align="center" width="100px" label="地址ID" prop="addressId" sortable/>

      <el-table-column align="center" min-width="100px" label="用户ID" prop="userId"/>

      <el-table-column align="center" min-width="100px" label="用户名称" prop="userName"/>

      <el-table-column align="center" min-width="100px" label="收货人名称" prop="receiverName"/>

      <el-table-column align="center" min-width="100px" label="手机号码" prop="phone"/>

      <el-table-column align="center" min-width="100px" label="所在地区" prop="region"/>

      <el-table-column align="center" min-width="100px" label="详细地址" prop="detailAddress"/>

      <el-table-column align="center" min-width="80px" label="是否默认地址" prop="default">
        <template #default="scope">
          {{ scope.row.default ? '是' : '否' }}
        </template>
      </el-table-column>

      <el-table-column align="center" min-width="80px" label="是否自提地址" prop="pickup">
        <template #default="scope">
          {{ scope.row.pickup ? '是' : '否' }}
        </template>
      </el-table-column>

      <el-table-column align="center" min-width="100px" label="创建时间" prop="createTime"/>


      <el-table-column align="center" min-width="100px" label="修改时间" prop="updateTime"/>

    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

  </div>
</template>

<script>
import { listAddress } from '@/api/business/user'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {
  name: 'UserAddress',
  components: { Pagination },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        name: undefined,
        userId: undefined,
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
    getList() {
      this.listLoading = true
      listAddress(this.listQuery).then(response => {
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
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['地址ID', '用户ID', '收获人', '手机号', '省', '市', '区', '地址', '是否默认']
        const filterVal = ['id', 'userId', 'name', 'mobile', 'province', 'city', 'area', 'address', 'isDefault']
        excel.export_json_to_excel2(tHeader, this.list, filterVal, '用户地址信息')
        this.downloadLoading = false
      })
    }
  }
}
</script>
