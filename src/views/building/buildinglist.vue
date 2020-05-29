<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" :model="filters">
        <el-form-item>
          <el-input v-model="filters.number" placeholder="门牌号"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-on:click="getBuildingList">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleAdd">新增</el-button>
        </el-form-item>
      </el-form>
    </el-col>

    <!--列表-->
    <el-table
      :data="buildings"
      highlight-current-row
      v-loading="listLoading"
      @selection-change="selsChange"
      style="width: 100%;"
    >
      <!-- <el-table-column type="selection"></el-table-column> -->
      <el-table-column type="index"></el-table-column>
      <el-table-column prop="name" label="楼栋号"></el-table-column>
      <el-table-column prop="number" label="门牌号"></el-table-column>
      <el-table-column prop="elcFee" label="电费（元/度）"></el-table-column>
      <el-table-column prop="watetFee" label="水费（元/吨）"></el-table-column>
      <el-table-column prop="addr" label="地址" ></el-table-column>
      <el-table-column label="操作">
        <template scope="scope">
          <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button> 
          <el-button type="danger" size="small"  @click="handleDel(scope.$index, scope.row,1)">删除</el-button>
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
        <el-form-item label="userId" hidden>
          <el-input v-model="editForm.userId" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="楼栋号">
          <el-input v-model="editForm.name"   auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="门牌号">
          <el-input v-model="editForm.number"  auto-complete="off"></el-input>
        </el-form-item>
        <!-- <el-form-item label="重复密码">
          <el-input v-model="editForm.password1" type="password" auto-complete="off"></el-input> -->
        <!-- </el-form-item> -->
        <el-form-item label="电费（元/度）">
          <el-input v-model="editForm.elcFee" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="水费（元/吨）">
          <el-input v-model="editForm.watetFee" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="editForm.addr" auto-complete="off"></el-input>
        </el-form-item>
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
          <el-input v-model="addForm.userId"    auto-complete="off"></el-input>
        </el-form-item> 
        <el-form-item label="楼栋号">
          <el-input v-model="addForm.name"   auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="门牌号">
          <el-input v-model="addForm.number"  auto-complete="off"></el-input>
        </el-form-item>
        <!-- <el-form-item label="重复密码">
          <el-input v-model="editForm.password1" type="password" auto-complete="off"></el-input> -->
        <!-- </el-form-item> -->
        <el-form-item label="电费（元/度）">
          <el-input v-model="addForm.elcFee" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="水费（元/吨）">
          <el-input v-model="addForm.watetFee" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="addForm.addr" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="addFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
      </div>
    </el-dialog>
  </section>
</template>

<script>
import util from "../../common/js/util";
let user=JSON.parse(sessionStorage.getItem('user'));
//import NProgress from 'nprogress'
import {
  getBuildingList,
  removeUser,
  batchRemoveUser,
  editBuilding,
  addBuilding
} from "../../api/api";

export default {
  data() {
    return {
      filters: {
        name: ""
      },
      buildings: [],
      total: 0,
      page: 1,
      listLoading: false,
      sels: [], //列表选中列

      editFormVisible: false, //编辑界面是否显示
      editLoading: false,
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
        watetFee:0,
        elcFee:0,
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
        watetFee:0,
        elcFee:0,
        del: 0,
        userId:user.id
      }
    };
  },
  methods: {
    //禁用显示转换
    formatDel: function(row, column) {
      return row.del == 1 ? "禁用" : row.del == 0 ? "启用" : "未知";
    }, 
    handleCurrentChange(val) {
      this.pageNum = val;
      this.getBuildingList();
    },
    //获取 
    getBuildingList() {
       
      let para = {
        page: this.page,
        role:user.role,
        userId:user.id
      };
      this.listLoading = true;
      //NProgress.start();
      console.log(para)
      getBuildingList(para).then(res => {
        console.log(res)
        this.total = res.datas.total;
        this.buildings = res.datas.list;
        this.listLoading = false;
      });
    },
    //删除
    handleDel: function(index, row ) {
        this.listLoading = true;
          //NProgress.start(); 
          let para = { id: row.id,del: 1 };
          editBuilding(para).then(res => {
            this.listLoading = false;
            //NProgress.done();
            this.$message({
              message: "删除成功",
              type: "success"
            });
            this.getBuildingList();
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
      this.addForm = { 
      };
    },
    //编辑
    editSubmit: function() {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          this.$confirm("确认提交吗？", "提示", {}).then(() => {
            this.editLoading = true;
            //NProgress.start();
            let para = Object.assign({}, this.editForm); 
            editBuilding(para).then(res => {
              this.editLoading = false;
              //NProgress.done();
              this.$message({
                message: "提交成功",
                type: "success"
              });
              this.$refs["editForm"].resetFields();
              this.editFormVisible = false;
              this.getBuildingList();
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
            this.addForm.userId=user.id
            let para = Object.assign({}, this.addForm);
            
              console.log(para);
            // if (para.password != para.password1) {
            //   alert("两次密码输入不一致！");
            //   return;
            // }
            addBuilding(para).then(res => {
              console.log(res);
              this.addLoading = false;
              //NProgress.done();

              let { message, code, datas } = res;
              if (code !== '100000') {
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
                this.getBuildingList();
              }
            });
          });
        }
      });
    },
    selsChange: function(sels) {
      this.sels = sels;
    },
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
    //         this.getBuildings();
    //       });
    //     })
    //     .catch(() => {});
    // }
  },
  mounted() {
    this.getBuildingList();

  }
};
</script>

<style scoped>
</style>