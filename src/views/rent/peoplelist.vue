<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" :model="filters">
        <!-- <el-form-item>
          <el-input v-model="filters.name" placeholder="姓名"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-on:click="getPeopleList">查询</el-button>
        </el-form-item>-->
        <el-form-item>
          <el-button type="primary" @click="back">返回</el-button>
          <el-button type="primary" @click="handleAdd">新增入住</el-button>
          <el-button type="primary" @click="turnHistory">历史入住</el-button>
        </el-form-item>
      </el-form>
    </el-col>

    <!--列表-->
    <el-table
      :data="people"
      highlight-current-row
      v-loading="listLoading"
      @selection-change="selsChange"
      style="width: 100%;"
    >
      <!-- <el-table-column type="selection"></el-table-column> -->
      <el-table-column type="index"></el-table-column>
      <el-table-column type="id" v-if="false"></el-table-column>
      <el-table-column prop="num" label="房间号"></el-table-column>
      <el-table-column prop="name" label="姓名"></el-table-column>
      <el-table-column prop="sex" label="性别" :formatter="formatSex"></el-table-column>
      <el-table-column prop="fee" label="租金"></el-table-column>
      <el-table-column prop="inTime" label="入住时间" :formatter="dateFormat"></el-table-column>
      <el-table-column label="操作">
        <template scope="scope">
          <el-button size="small" @click="handleDetail(scope.$index, scope.row)">查看详情</el-button>
          <el-button size="small" @click="handleEdit(scope.$index, scope.row)">退租</el-button>
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

    <!--退租界面-->
    <el-dialog title="退租" v-model="editFormVisible" :close-on-click-modal="false">
      <el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
        <el-form-item label="id" hidden>
          <el-input v-model="editForm.id" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="房间号">
          <el-input v-model="editForm.num" readonly auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="editForm.name" readonly auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="性别">
          <el-input v-model="editForm.sex" readonly></el-input>
        </el-form-item>
        <el-form-item label="身份证">
          <el-input v-model="editForm.idcard" readonly auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="editForm.tel" readonly auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="入住水表度数">
          <el-input v-model="editForm.inWater" readonly auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="入住电表度数">
          <el-input v-model="editForm.inElec" readonly auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="当前水表度数">
          <el-input v-model="editForm.outWater" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="当前电表度数">
          <el-input v-model="editForm.outElec" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="租金">
          <el-input v-model="editForm.fee" readonly auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="入住日期">
          <el-date-picker
            type="date"
            placeholder="选择日期"
            readonly
            v-model="editForm.inTime"
            style="width: 100%;"
          ></el-date-picker>
          <!-- <el-input v-model="editForm.inTime"  auto-complete="off"></el-input> -->
        </el-form-item>
        <el-form-item label="账单">
          <el-input v-model="editForm.payFee" readonly auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click.native="calcPayFee">计算租金</el-button>
        <el-button @click.native="cancelOut">取消</el-button>
        <el-button type="danger" @click.native="editSubmit" :loading="editLoading">退租</el-button>
      </div>
    </el-dialog>

    <!--新增界面-->
    <el-dialog title="新增" v-model="addFormVisible" :close-on-click-modal="false">
      <el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
        <el-form-item label="rooms" hidden>
          <el-input v-model="addForm.rooms" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="房间号" label-width="80px">
          <el-autocomplete
            class="inline-input"
            v-model="addForm.num"
            :fetch-suggestions="searchNum"
            placeholder="请选择房间号，如果没有数据就是新增"
            :trigger-on-focus="false"
            @select="handleSelect"
          ></el-autocomplete>
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="addForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="addForm.sex" placeholder="请选择性别">
            <el-option label="男" value="1"></el-option>
            <el-option label="女" value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="身份证">
          <el-input v-model="addForm.idcard" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="addForm.tel" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="籍贯">
          <el-input v-model="addForm.addr" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="水表度数">
          <el-input v-model="addForm.inWater" v-bind:readonly="isReadOnly" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="电表度数">
          <el-input v-model="addForm.inElec" v-bind:readonly="isReadOnly" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="租金">
          <el-input v-model="addForm.fee" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="addFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="addSubmit" :loading="addBuildFormVisible">提交</el-button>
      </div>
    </el-dialog>

    <!--详情界面-->
    <el-dialog title="详情" v-model="detailFormVisible" :close-on-click-modal="false">
      <el-form :model="detailForm" label-width="80px" ref="detailForm">
        <el-form-item label="房间号">
          <el-input v-model="detailForm.num" readonly auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="detailForm.name" readonly auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="性别">
          <el-input v-model="detailForm.sex" readonly></el-input>
        </el-form-item>
        <el-form-item label="身份证">
          <el-input v-model="detailForm.idcard" readonly auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="detailForm.tel" readonly auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="籍贯">
          <el-input v-model="detailForm.addr" readonly auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="水表度数">
          <el-input v-model="detailForm.inWater" readonly auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="电表度数">
          <el-input v-model="detailForm.inElec" readonly auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="租金">
          <el-input v-model="detailForm.fee" readonly auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="detailFormVisible = false">取消</el-button>
      </div>
    </el-dialog>
  </section>
</template>

<script>
import util from "../../common/js/util";
import moment from "moment"; 

let user = JSON.parse(sessionStorage.getItem("user"));
//import NProgress from 'nprogress'
import {
  removeUser,
  batchRemoveUser,
  getPeopleListPage,
  getHistoryFee,
  editPeople,
  addPeople,
  getNumList,
  calcPayFee,
  peopleOut
} from "../../api/api";

export default {
  data() {
    return {
      isReadOnly: false,
      rooms: sessionStorage.getItem("rooms"),
      diseaseList: [], //这个值是需要匹配的值
      disease: "", //这个值是用户正在输入的值
      filters: {
        name: ""
      },
      people: [],
      total: 0,
      page: 1,
      listLoading: false,
      sels: [], //列表选中列

      editFormVisible: false, //编辑界面是否显示
      editLoading: false,
      detailFormVisible: false,
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
      //详情界面数据
      detailForm: {},

      addFormVisible: false, //新增界面是否显示
      addLoading: false,
      addFormRules: {
        name: [{ required: true, message: "请输入姓名", trigger: "blur" }]
      },
      //新增界面数据
      addForm: {
        rooms: this.rooms,
        userId: user.id
      }
    };
  },
  methods: {
    
    back: function() {
      this.$router.back(-1);
    },
    turnHistory() {
      this.$router.push({ name: "历史入住", params: { rooms: this.rooms } });
      // this.$router.push({ path: "/rent/peoplelist?rooms="+row.id });
    },
    //时间格式化
    dateFormat: function(row, column) {
      var date = row[column.property];
      if (date === undefined || date === "") {
        return "";
      }
      return moment(date).format("YYYY-MM-DD HH:mm:ss");
    },
    //禁用显示转换
    formatSex: function(row, column) {
      return row.del == 1 ? "男" : row.del == 0 ? "女" : "未知";
    },
    searchNum(disease, callback) {
      let paras = {
        rooms: this.rooms,
        num: this.addForm.num
      };
      getNumList(paras).then(res => {
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
            console.log(item);
            for (let i of datas.list) {
              i.value = i.num;
            }
            list = datas.list;
          });
          console.log(list);
          callback(list);
        }
      });
    },
    handleSelect(item) {
      this.editLoading = true;
      var in_num = item.value;
      console.log(in_num);
      let par = {
        num: in_num,
        rooms: this.rooms
      };
      getHistoryFee(par).then(res => {
        let { message, code, datas } = res;
        if (code !== "100000") {
          this.$message({
            message: message,
            type: "error"
          });
        } else {
          if (datas.data != undefined) {
            this.addForm.inElec = datas.data.outElec;
            this.addForm.inWater = datas.data.outWater;
            // this.addForm.inElec.isReadOnly=true
            // this.addForm.inWater.isReadOnly=true
            this.isReadOnly = true;
          }
        }

        this.editLoading = false;
      });
    },

    handleCurrentChange(val) {
      this.pageNum = val;
      this.getPeopleList();
    },
    //获取
    getPeopleList() {
      let para = {
        page: this.page,
        role: user.role,
        userId: user.id,
        rooms: this.rooms
      };
      this.listLoading = true;
      //NProgress.start();
      console.log(para);
      getPeopleListPage(para).then(res => {
        console.log(res);
        this.total = res.datas.total;
        this.people = res.datas.list;
        this.listLoading = false;
      });
    },
    //删除
    handleDel: function(index, row) {
      this.listLoading = true;
      //NProgress.start();
      let para = { id: row.id, del: 1 };
      editPeople(para).then(res => {
        this.listLoading = false;
        //NProgress.done();
        this.$message({
          message: "删除成功",
          type: "success"
        });
        this.getPeopleList();
      });
    },
    //显示编辑界面
    handleEdit: function(index, row) {
      this.editFormVisible = true;
      // row.sex = row.sex == 1 ? "男" : row.sex == 0 ? "女" : "未知";
      this.editForm = Object.assign({}, row);
      this.editForm.sex = row.sex == 1 ? "男" : row.sex == 0 ? "女" : "未知";
    },
    //显示详情界面
    handleDetail: function(index, row) {
      this.detailFormVisible = true;
      // row.sex = row.sex == 1 ? "男" : row.sex == 0 ? "女" : "未知";
      this.detailForm = Object.assign({}, row);
      this.detailForm.sex = row.sex == 1 ? "男" : row.sex == 0 ? "女" : "未知";
    },
    //显示新增界面
    handleAdd: function() {
      this.addFormVisible = true;
      this.addForm = {};
    },
    //退租
    editSubmit: function() {
      if (this.editForm.payFee == undefined) {
        alert("请先计算租金！");
        return;
      }
      this.$refs.editForm.validate(valid => {
        if (valid) {
          this.$confirm("确认提交吗？", "提示", {}).then(() => {
            this.editLoading = true;
            //NProgress.start();
            let para = Object.assign({}, this.editForm);
            peopleOut(para).then(res => {
              this.editLoading = false;
              //NProgress.done();
              this.$message({
                message: "提交成功",
                type: "success"
              });
              this.$refs["editForm"].resetFields();
              this.editFormVisible = false;
              this.getPeopleList();
            });
          });
        }
      });
    },
    cancelOut: function() {
      this.editForm = {};
      this.editFormVisible = false;
    },
    //计算租金
    calcPayFee: function() {
      if (
        this.editForm.outElec == undefined ||
        this.editForm.outWater == undefined
      ) {
        alert("请填写当前度数！");
        return;
      }
      this.editLoading = true;
      //NProgress.start();
      let para = Object.assign({}, this.editForm);
      console.log(para);
      calcPayFee(para).then(res => {
        let { message, code, datas } = res;
        if (code !== "100000") {
          this.$message({
            message: message,
            type: "error"
          });
        } else {
          if (datas.fee != undefined) {
            this.editForm.payFee = datas.fee;
          }
        }
      });

      this.editLoading = false;
    },
    //新增
    addSubmit: function() {
      this.$refs.addForm.validate(valid => {
        if (valid) {
          this.addForm.rooms = this.rooms;
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
            addPeople(para).then(res => {
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
                this.getPeopleList();
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
    //         this.getPeoples();
    //       });
    //     })
    //     .catch(() => {});
    // }
  }, 
  mounted() {
    this.rooms = sessionStorage.getItem("rooms");
    this.getPeopleList();
  }
};
</script>

<style scoped>
.inline-input {
  width: 100%;
}
</style>