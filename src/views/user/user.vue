<template>
  <div class="app-container">

    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input v-model="listQuery.userId" clearable size="small" class="filter-item" style="width: 200px;" placeholder="请输入用户ID"/>
      <el-input v-model="listQuery.userName" clearable size="small" class="filter-item" style="width: 200px;" placeholder="请输入用户名"/>
      <el-input v-model="listQuery.phone" clearable size="small" class="filter-item" style="width: 200px;" placeholder="请输入手机号"/>
      <el-button class="filter-item" type="primary" size="mini" icon="el-icon-search" @click="handleFilter">查找</el-button>
      <el-button :loading="downloadLoading" size="mini" class="filter-item" type="warning" icon="el-icon-download" @click="handleDownload">导出</el-button>
    </div>

    <!-- 查询结果 -->
    <el-table v-loading="listLoading" :data="list" size="small" element-loading-text="正在查询中..." border fit highlight-current-row>

      <el-table-column align="center" width="100px" label="用户ID" prop="userId" sortable/>

      <el-table-column align="center" label="用户名" prop="userName"/>

      <el-table-column align="center" label="手机号码" prop="phone"/>

      <el-table-column align="center" label="积分" prop="points"/>

      <el-table-column align="center" label="邀请码" prop="inviteCode"/>

      <el-table-column align="center" label="上级邀请人ID" prop="inviterId"/>

      <el-table-column align="center" label="红包余额" prop="redPacketBalance"/>

      <el-table-column align="center" label="注册时间" prop="createTime"/>

    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

  </div>
</template>

<script>
import { fetchList, approveAgency, detailApprove } from '@/api/business/user'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {
  name: 'User',
  components: { Pagination },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        username: undefined,
        mobile: undefined,
        sort: 'add_time',
        order: 'desc'
      },
      downloadLoading: false,
      genderDic: ['未知', '男', '女'],
      levelDic: ['普通用户', 'VIP用户', '代理'],
      statusDic: ['可用', '禁用', '注销', '代理申请'],
      detailDialogVisible: false,
      agencyDetail: {},
      approveDialogVisible: false,
      approveForm: {
        userId: undefined,
        settlementRate: undefined
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
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
    handleDetail(row) {
      this.agencyDetail = {
        shareUrl: undefined,
        settlementRate: undefined
      }
      detailApprove(row.id).then(response => {
        this.agencyDetail = response.data.data
      })
      this.detailDialogVisible = true
    },
    handleApproveAgency(row) {
      this.approveForm.userId = row.id

      this.approveDialogVisible = true
      this.$nextTick(() => {
        this.$refs['approveForm'].clearValidate()
      })
    },
    confirmApprove() {
      this.$refs['approveForm'].validate((valid) => {
        if (valid) {
          approveAgency(this.approveForm).then(response => {
            this.approveDialogVisible = false
            this.$notify.success({
              title: '成功',
              message: '审批成功'
            })
            this.getList()
          }).catch(response => {
            this.$notify.error({
              title: '审批失败',
              message: response.data.errmsg
            })
          })
        }
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['用户名', '手机号码', '性别', '生日', '状态']
        const filterVal = ['username', 'mobile', 'gender', 'birthday', 'status']
        excel.export_json_to_excel2(tHeader, this.list, filterVal, '用户信息')
        this.downloadLoading = false
      })
    }
  }
}
</script>
