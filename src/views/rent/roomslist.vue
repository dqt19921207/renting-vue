<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" :model="filters">
        <el-form-item>
          <el-input v-model="filters.rooms" placeholder="房号"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-on:click="getRoomsList">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleAdd">新增房屋</el-button>
        </el-form-item>
      </el-form>
    </el-col>

    <!--列表-->
    <el-table
      :data="rooms"
      highlight-current-row
      v-loading="listLoading"
      @selection-change="selsChange"
      style="width: 100%;"
    >
      <!-- <el-table-column type="selection"></el-table-column> -->
      <el-table-column prop="id" v-if="false"></el-table-column>
      <el-table-column type="index"></el-table-column>
      <el-table-column prop="buildName" label="楼栋号"></el-table-column>
      <el-table-column prop="rooms" label="房号"></el-table-column>
      <!-- <el-table-column prop="elect" label="电（度）"></el-table-column>
      <el-table-column prop="water" label="水（吨）"></el-table-column> -->
      <el-table-column prop="type" label="户型" :formatter="formatType"></el-table-column>
      <el-table-column prop="pcount" label="入住人数"></el-table-column>
      <!-- <el-table-column prop="fee" label="房租"></el-table-column> -->
      <el-table-column label="操作">
        <template scope="scope">
          <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑房屋</el-button>
          <el-button size="small" @click="turnPeople(scope.$index, scope.row)">人员管理</el-button>
          <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row,1)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--工具条-->
    <el-col :span="24" class="toolbar">
      <!-- <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button> -->
      <el-pagination
        layout="prev, pager, next"
        @current-change="handleCurrentChange"
        :pageSize="10"
        :total="total"
        style="float:right;"
      ></el-pagination>
    </el-col>

    <!--编辑界面-->
    <el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false">
      <el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
        <el-form-item label="id" hidden>
          <el-input v-model="editForm.id" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="楼栋号">
          <el-input v-model="editForm.buildName" disabled auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="房号">
          <el-input v-model="editForm.rooms" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="房型">
          <el-select v-model="editForm.type" placeholder="请选择房型">
            <el-option label="单身公寓" value="1"></el-option>
            <el-option label="两室一厅" value="2"></el-option>
            <el-option label="三室一厅" value="3"></el-option>
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="水表度数">
          <el-input v-model="editForm.water" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="电表度数">
          <el-input v-model="editForm.elect" auto-complete="off"></el-input>
        </el-form-item> -->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="editFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
      </div>
    </el-dialog>

    <!--新增界面-->
    <el-dialog title="新增" v-model="addFormVisible" :close-on-click-modal="false">
      <el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
        <el-form-item label="userId" hidden>
          <el-input v-model="addForm.userId" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="buildId" hidden>
          <el-input v-model="addForm.buildId" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="楼栋">
          <el-autocomplete
            class="inline-input"
            v-model="addForm.buildName"
            :fetch-suggestions="searchBuild"
            placeholder="清选择楼栋"
            :trigger-on-focus="false"
            @select="handleSelect"
          ></el-autocomplete>
        </el-form-item>
        <el-form-item label="房号">
          <el-input v-model="addForm.rooms" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="房型">
          <el-select v-model="addForm.type" placeholder="请选择房型">
            <el-option label="单身公寓" value="1"></el-option>
            <el-option label="两室一厅" value="2"></el-option>
            <el-option label="三室一厅" value="3"></el-option>
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="水表度数">
          <el-input v-model="addForm.water" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="电表度数">
          <el-input v-model="addForm.elect" auto-complete="off"></el-input>
        </el-form-item> -->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="addFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="addSubmit" :loading="addBuildFormVisible">提交</el-button>
      </div>
    </el-dialog>
  </section>
</template>

<script>
import util from "../../common/js/util";
let user = JSON.parse(sessionStorage.getItem("user"));
//import NProgress from 'nprogress'
import {
  getRoomsListPage,
  removeUser,
  batchRemoveUser,
  getBuildingListPage,
  editRooms,
  addRooms
} from "../../api/api";
export default {
  data() {
    return {
      user:{},
      diseaseList: [], //这个值是需要匹配的值
      disease: "", //这个值是用户正在输入的值
      filters: {
        name: ""
      },
      rooms: [],
      total: 0,
      page: 1,
      listLoading: false,
      sels: [], //列表选中列

      editFormVisible: false, //编辑界面是否显示
      editLoading: false,
      addBuildFormVisible: false,
      editFormRules: {
        name: [{ required: true, message: "请输入姓名", trigger: "blur" }]
      },
      //编辑界面数据
      editForm: {
        id: 0,
        name: "",
        addr: "",
        number: "0",
        userId: 0,
        watetFee: 0,
        elcFee: 0,
        del: 0
      },

      addFormVisible: false, //新增界面是否显示
      addLoading: false,
      addFormRules: {
        name: [{ required: true, message: "请输入姓名", trigger: "blur" }]
      },
      //新增界面数据
      addForm: {
        id: 0,
        name: "",
        addr: "",
        number: "0",
        watetFee: 0,
        elcFee: 0,
        del: 0,
        userId: user.id
      }
    };
  },
  methods: {
    
    turnPeople(index,row) {
      sessionStorage.setItem("rooms",row.id);
      this.$router.push({ name: '人员管理', params: { rooms: row.id  }})
      // this.$router.push({ path: "/rent/peoplelist?rooms="+row.id });
    },
    searchBuild(disease, callback) {
      let para = {
        role: user.role,
        userId: user.id,
        number: this.addForm.name
      };
      getBuildingListPage(para).then(res => {
        var list = [{}];
        // NProgress.done();
        let { message, code, datas } = res;
        if (code !== "100000") {
          this.$message({
            message: message,
            type: "error"
          });
        } else {
          datas.list.forEach(item => {
            this.diseaseList.push({
              id: item.number,
              value: item.addr
            });
            for (let i of datas.list) {
              i.value = i.id + "_" + i.addr + "_" + i.name;
            }
            list = datas.list;
          });
          callback(list);
        }
      });
    },
    handleSelect(item) {
      var list = item.value.toString().split("_");
      this.addForm.buildName = list[2];
      this.addForm.buildId = list[0];
    },

    //房型显示转换
    formatType: function(row, column) {
      var type = "";
      if (row.type == 1) return "单身公寓";
      if (row.type == 2) return "两室一厅";
      if (row.type == 3) return "三室一厅";
    },
    handleCurrentChange(val) {
      this.pageNum = val;
      this.getRoomsList();
    },
    //获取
    getRoomsList() {
      
      user = JSON.parse(sessionStorage.getItem("user"));
      let para = {
        page: this.page,
        role: user.role,
        userId: user.id,
        rooms: this.filters.rooms
      };
      this.listLoading = true;
      //NProgress.start();
      console.log(para);
      getRoomsListPage(para).then(res => {
        console.log(res);
        this.total = res.datas.total;
        this.rooms = res.datas.list;
        this.listLoading = false;
      });
    },
    //删除
    handleDel: function(index, row) {
      this.listLoading = true;
      //NProgress.start();
      let para = { id: row.id, del: 1 };
      editRooms(para).then(res => {
        this.listLoading = false;
        //NProgress.done();
        this.$message({
          message: "删除成功",
          type: "success"
        });
        this.getRoomsList();
      });
    },
    //显示编辑界面
    handleEdit: function(index, row) {
      this.editFormVisible = true;
      this.editForm = Object.assign({}, row);
    },
    //显示新增界面
    handleAdd: function() {
      this.addFormVisible = true;
      this.addForm = {};
    },
    //编辑
    editSubmit: function() {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          this.$confirm("确认提交吗？", "提示", {}).then(() => {
            this.editLoading = true;
            //NProgress.start();
            let para = Object.assign({}, this.editForm);
            editRooms(para).then(res => {
              this.editLoading = false;
              //NProgress.done();
              this.$message({
                message: "提交成功",
                type: "success"
              });
              this.$refs["editForm"].resetFields();
              this.editFormVisible = false;
              this.getRoomsList();
            });
          });
        }
      });
    },
    //新增
    addSubmit: function() {
      this.$refs.addForm.validate(valid => {
        if (valid) {
          this.$confirm("确认提交吗？", "提示", {}).then(() => {
            this.addLoading = true;
            //NProgress.start();
            this.addForm.userId = user.id;
            let para = Object.assign({}, this.addForm);

            console.log(para);
            // if (para.password != para.password1) {
            //   alert("两次密码输入不一致！");
            //   return;
            // }
            addRooms(para).then(res => {
              console.log(res);
              this.addLoading = false;
              //NProgress.done();

              let { message, code, datas } = res;
              if (code !== "100000") {
                this.$message({
                  message: message,
                  type: "error"
                });
              } else {
                this.$message({
                  message: "提交成功",
                  type: "success"
                });
                this.$refs["addForm"].resetFields();
                this.addFormVisible = false;
                this.getRoomsList();
              }
            });
          });
        }
      });
    },
    selsChange: function(sels) {
      this.sels = sels;
    }
    //批量删除
    // batchRemove: function() {
    //   var ids = this.sels.map(item => item.id).toString();
    //   this.$confirm("确认删除选中记录吗？", "提示", {
    //     type: "warning"
    //   })
    //     .then(() => {
    //       this.listLoading = true;
    //       //NProgress.start();
    //       let para = { ids: ids };
    //       batchRemoveUser(para).then(res => {
    //         this.listLoading = false;
    //         //NProgress.done();
    //         this.$message({
    //           message: "删除成功",
    //           type: "success"
    //         });
    //         this.getRoomss();
    //       });
    //     })
    //     .catch(() => {});
    // }
  },
  mounted() {
    this.user = JSON.parse(sessionStorage.getItem("user"));
    this.getRoomsList();
  }
};
</script>

<style scoped>
</style>