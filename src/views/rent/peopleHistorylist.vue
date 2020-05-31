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
          <el-button type="primary" @click.native="back">返回</el-button>
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
      <el-table-column prop="payFee" label="退租收费"></el-table-column>
      <el-table-column prop="inTime" label="入住时间" :formatter="dateFormat"></el-table-column>
      <el-table-column prop="outTime" label="退租时间" :formatter="dateFormat"></el-table-column>
      <el-table-column label="操作">
        <template scope="scope">
          <el-button size="small" @click="handleDetail(scope.$index, scope.row)">查看详情</el-button>
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
        <el-form-item label="入住时间">
          <el-date-picker
            type="date"
            placeholder="选择日期"
            readonly
            v-model="detailForm.inTime"
            style="width: 100%;"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="入住水表度数">
          <el-input v-model="detailForm.inWater" readonly auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="入住电表度数">
          <el-input v-model="detailForm.inElec" readonly auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="退租时间">
         <el-date-picker
            type="date"
            placeholder="选择日期"
            readonly
            v-model="detailForm.outTime"
            style="width: 100%;"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="退租水表度数">
          <el-input v-model="detailForm.outWater" readonly auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="退租电表度数">
          <el-input v-model="detailForm.outElec" readonly auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="租金">
          <el-input v-model="detailForm.fee" readonly auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="总计金额">
          <el-input v-model="detailForm.payFee" readonly auto-complete="off"></el-input>
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
  historyList,
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
      user: {},
      isReadOnly: false,
      rooms: "",
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
    // back() {
    //   eventBus.$emit("rooms", this.rooms); //传递一个map，id是key，value是value
    //   this.$router.go(-1);
    // },
    back: function() {
      this.$router.back(-1);
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
    historyIn(val) {
      this.pageNum = val;
      // this.getPeopleList();
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
      historyList(para).then(res => {
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
    selsChange: function(sels) {
      this.sels = sels;
    }
  },
  mounted() {
    this.rooms = this.$route.params.rooms;
    this.getPeopleList();
  }
};
</script>

<style scoped>
.inline-input {
  width: 100%;
}
</style>