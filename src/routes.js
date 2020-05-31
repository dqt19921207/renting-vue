import Login from './views/Login.vue'
import NotFound from './views/404.vue'
import Home from './views/Home.vue'
import Main from './views/Main.vue'
import Table from './views/nav1/Table.vue'
import Form from './views/nav1/Form.vue'
import user from './views/nav1/user.vue'
import Page4 from './views/nav2/Page4.vue'
import Page5 from './views/nav2/Page5.vue'
import Page6 from './views/nav3/Page6.vue'
import echarts from './views/charts/echarts.vue'

import userlist from './views/user/userlist.vue'
import buildinglist from './views/rent/buildinglist.vue'
import roomslist from './views/rent/roomslist.vue'
import peoplelist from './views/rent/peoplelist.vue'
import historylist from './views/rent/peopleHistorylist.vue'

let routes = [
    {
        path: '/login',
        component: Login,
        name: '',
        hidden: true
    },
    {
        path: '/404',
        component: NotFound,
        name: '',
        hidden: true
    },
    //{ path: '/main', component: Main },

    {
        path: '/user',
        component: Home,
        name: '用户管理',
        iconCls: 'el-icon-message',//图标样式class
        children: [
            { path: '/userlist', component: userlist, name: '用户管理' },
        ]
    },
    {
        path: '/building',
        component: Home,
        name: '出租管理',
        iconCls: 'el-icon-message',//图标样式class
        children: [
            { path: '/buildinglist', component: buildinglist, name: '楼栋管理' },
            { path: '/roomslist', component: roomslist, name: '房屋管理' },
            {
                path: '/peoplelist', component: peoplelist, name: '人员管理', hidden: true
            },
            { path: '/peopleHistoryList', component: historylist, name: '历史入住', hidden: true },
        ]
    },
    {
        path: '/',
        component: Home,
        name: '导航一',
        iconCls: 'el-icon-message',//图标样式class
        children: [
            { path: '/main', component: Main, name: '主页', hidden: true },
            { path: '/table', component: Table, name: 'Table' },
            { path: '/form', component: Form, name: 'Form' },
            { path: '/user', component: user, name: '列表' },
        ], hidden: true
    },
    {
        path: '/',
        component: Home,
        name: '导航二',
        iconCls: 'fa fa-id-card-o',
        children: [
            { path: '/page4', component: Page4, name: '页面4' },
            { path: '/page5', component: Page5, name: '页面5' }
        ], hidden: true
    },
    {
        path: '/',
        component: Home,
        name: '',
        iconCls: 'fa fa-address-card',
        leaf: true,//只有一个节点
        children: [
            { path: '/page6', component: Page6, name: '导航三' }
        ], hidden: true
    },
    {
        path: '/',
        component: Home,
        name: 'Charts',
        iconCls: 'fa fa-bar-chart',
        children: [
            { path: '/echarts', component: echarts, name: 'echarts' }
        ], hidden: true
    },
    {
        path: '*',
        hidden: true,
        redirect: { path: '/404' }
    },

];
export default routes;