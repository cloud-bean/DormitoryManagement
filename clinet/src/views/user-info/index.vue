<template>
  <div id="UserInfo" class="page-wrapper">
    <!-- 选择器 -->

    <h1 class="main-title">导入学生</h1>
    <div class="wrapper main-card">
      <el-upload
        style="width: 500px;"
        :action="uploadUrl"
        :on-success="handleSuccess"
        :on-error="handleError"
        ref="upload"
        name="file"
        :limit="1"
        :auto-upload="false"
      >
        <el-button slot="trigger" type="primary">选择文件</el-button>
        <el-button type="success" @click="submitUpload">上传到服务器</el-button>
        <div class="el-upload__tip" slot="tip">
          只能上传csv/xls/xlsx文件，且不超过1MB
        </div>
      </el-upload>
    </div>

    <h1 class="main-title">选择学生</h1>
    <div class="wrapper">
      <el-tabs type="border-card">
        <el-tab-pane label="级联选择">
          <GroupSelector :selectorData="selectorData" />
          <el-button
            type="primary"
            @click="fetchUserInfo('id', selectorData.userId)"
            >搜索</el-button
          >
        </el-tab-pane>
        <el-tab-pane label="按学号搜索">
          <StudentSearcher v-model="searchContent" />
          <el-button
            type="primary"
            @click="fetchUserInfo('account', searchContent)"
            >搜索</el-button
          >
        </el-tab-pane>
      </el-tabs>
    </div>
    <!-- 选择器 -->

    <h1 class="main-title">详细信息</h1>
    <div class="wrapper userInfo-wrapper" v-if="studentInfo.id">
      <el-row :gutter="20" class="top">
        <el-col :md="12">
          <div class="userInfo-card">
            <div class="title">
              <span>用户信息</span>
              <el-button icon="el-icon-guide" @click="editModalVisible = true">
                调剂宿舍
              </el-button>
            </div>
            <hr />
            <div class="info-item">
              <label>姓名:</label>
              <span>{{ studentInfo.name }}</span>
            </div>
            <div class="info-item">
              <label>学号:</label>
              <span>{{ studentInfo.account }}</span>
            </div>
            <div class="info-item">
              <label>手机号:</label>
              <span>{{ studentInfo.phone }}</span>
            </div>
            <div class="info-item">
              <label>注册日期:</label>
              <span>{{
                $moment(studentInfo.createdAt).format('YYYY-MM-DD')
              }}</span>
            </div>
          </div>
        </el-col>
        <el-col :md="12">
          <div class="roomInfo-card">
            <PanelGroup :userInfo="studentInfo" />
          </div>
        </el-col>
      </el-row>
      <div class="bottom main-card" style="margin-top: 20px">
        <div class="process-item">
          <span>早起概率：</span>
          <el-progress
            :text-inside="true"
            :stroke-width="26"
            :percentage="Number((studentInfo.getupProb * 100).toFixed(2))"
          ></el-progress>
        </div>
        <div class="process-item">
          <span>早归概率：</span>
          <el-progress
            :text-inside="true"
            :stroke-width="26"
            :percentage="Number((studentInfo.backProb * 100).toFixed(2))"
            status="success"
          ></el-progress>
        </div>
        <div class="process-item">
          <span>打扫概率：</span>
          <el-progress
            :text-inside="true"
            :stroke-width="26"
            :percentage="Number((studentInfo.cleanProb * 100).toFixed(2))"
            status="warning"
          ></el-progress>
        </div>
      </div>
    </div>
    <div class="no-data-tips main-card wrapper" v-else>请选择用户</div>

    <!-- 调剂宿舍模态框 -->
    <UserInfoEditModal
      :visible.sync="editModalVisible"
      :userInfo="studentInfo"
      @update-success="() => fetchUserInfo('id', this.studentInfo.id)"
    />
  </div>
</template>

<script>
import GroupSelector from '@/components/GroupSelector'
import StudentSearcher from './components/StudentSearcher'
import PanelGroup from './components/PanelGroup'
import UserInfoEditModal from './components/UserInfoEditModal.vue'

import { getStudentInfoByIdOrAccount, addStudentsWithFiles } from '@/api/user'
export default {
  name: 'UserInfo',
  components: {
    GroupSelector,
    StudentSearcher,
    PanelGroup,
    UserInfoEditModal
  },
  data() {
    return {
      selectorData: {
        buildingId: null,
        floorId: null,
        roomId: null,
        userId: null
      },
      searchContent: '',
      studentInfo: {},
      editModalVisible: false,
      uploadUrl: 'http://localhost:8080/api/upload', // 你的Koa服务器上的上传接口路径
      fileList: []
    }
  },
  methods: {
    fetchUserInfo(type, value) {
      getStudentInfoByIdOrAccount({ type, value }).then(res => {
        this.studentInfo = res.data
      })
    },
    async submitUpload() {
      console.log('this.fileList :>> ', this.fileList)
      // 调用Element UI的上传组件上传文件
      const res = await this.$refs.upload.submit()
      console.log('res :>> ', res)
    },
    async handleSuccess(response, file, fileList) {
      // 文件上传成功的处理逻辑
      this.fileList = fileList // 更新已上传的文件列表
      console.log('response, file :>> ', response, file)
      const upFileName = response.filename
      console.log('upFileName :>> ', upFileName)

      // /api/addStudentsWithFiles

      const res = await addStudentsWithFiles(upFileName)
      console.log('res :>> ', res);

    },
    handleError(error, file) {
      // 文件上传失败的处理逻辑
      this.$message.error('文件上传失败')
    }
    // upload file
  },
  mounted() {
    if (this.$route.query.userId) {
      this.fetchUserInfo('id', this.$route.query.userId)
    }
  }
}
</script>

<style lang="scss" scoped>
.wrapper {
  margin: 40px 0;
}
.el-tab-pane {
  width: 100%;
  display: flex;
  justify-content: space-between;
}
::v-deep .el-tabs__content {
  padding: 40px 20px;
  width: 100%;
}

.userInfo-wrapper {
  .top {
    .roomInfo-card {
      background-color: #fff;
      padding: 30px;
    }
    .userInfo-card {
      background-color: #fff;
      padding: 30px;
      height: 223px;
      box-sizing: content-box;
      .title {
        font-weight: bold;
        color: $color-primary;
        font-size: 22px;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .info-item {
        margin: 20px 0;
      }
      :nth-child(3) {
        margin-top: 40px;
      }
    }
  }
  .bottom {
    .process-item {
      span {
        display: block;
        margin: 10px 0;
      }
    }
    :first-child span {
      margin-top: 0px;
    }
  }
}
</style>
