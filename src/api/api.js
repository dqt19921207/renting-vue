import axios from 'axios';

let base = 'http://localhost:8080';

export const requestLogin = params => { return axios.post(`${base}/renting/login`, params).then(res => res.data); };

export const getUserList = params => { return axios.post(`${base}/user/list`, { params: params }); };

export const getUserListPage = params => { return axios.post(`${base}/user/list`, { params: params }); };

export const removeUser = params => { return axios.get(`${base}/user/remove`, { params: params }); };

export const batchRemoveUser = params => { return axios.get(`${base}/user/batchremove`, { params: params }); };

export const editUser = params => { return axios.get(`${base}/user/edit`, { params: params }); };

export const addUser = params => { return axios.get(`${base}/user/add`, { params: params }); };