import axios from 'axios';

let base = 'http://localhost:8080';

export const requestLogin = params => { return axios.post(`${base}/renting/login`, params).then(res => res.data); };

export const getUserList = params => { return axios.post(`${base}/user/list`, params).then(res => res.data);};

export const getUserListPage = params => { return axios.post(`${base}/user/list`, params).then(res => res.data);};

export const removeUser = params => { return axios.post(`${base}/user/updateUser`,  params).then(res => res.data);};

export const batchRemoveUser = params => { return axios.post(`${base}/user/batchremove`, params).then(res => res.data);};

export const editUser = params => { return axios.post(`${base}/user/updateUser`, params).then(res => res.data);};

export const addUser = params => { return axios.post(`${base}/user/addUser`, params).then(res => res.data);};