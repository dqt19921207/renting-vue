import axios from 'axios';

let base = 'http://localhost:8080';

export const requestLogin = params => { return axios.post(`${base}/renting/login`, params).then(res => res.data); };

export const getUserList = params => { return axios.post(`${base}/user/list`, params).then(res => res.data);};

export const getUserListPage = params => { return axios.post(`${base}/user/list`, params).then(res => res.data);};

export const removeUser = params => { return axios.post(`${base}/user/remove`,  params).then(res => res.data);};

export const batchRemoveUser = params => { return axios.post(`${base}/user/batchremove`, params).then(res => res.data);};

export const editUser = params => { return axios.post(`${base}/user/updateUser`, params).then(res => res.data);};

export const addUser = params => { return axios.post(`${base}/user/addUser`, params).then(res => res.data);};


export const editBuilding = params => { return axios.post(`${base}/building/updateBuilding`, params).then(res => res.data);};

export const addBuilding = params => { return axios.post(`${base}/building/addBuilding`, params).then(res => res.data);}; 

export const getBuildingListPage = params => { return axios.post(`${base}/building/list`, params).then(res => res.data);};

export const editRooms = params => { return axios.post(`${base}/rooms/updateRooms`, params).then(res => res.data);};

export const addRooms = params => { return axios.post(`${base}/rooms/addRooms`, params).then(res => res.data);}; 

export const getRoomsListPage = params => { return axios.post(`${base}/rooms/list`, params).then(res => res.data);};

export const editPeople = params => { return axios.post(`${base}/people/updatePeople`, params).then(res => res.data);};

export const addPeople = params => { return axios.post(`${base}/people/addPeople`, params).then(res => res.data);}; 

export const getPeopleListPage = params => { return axios.post(`${base}/people/list`, params).then(res => res.data);};

export const getHistoryFee = params => { return axios.post(`${base}/people/getHistoryFee`, params).then(res => res.data);};
export const getNumList = params => { return axios.post(`${base}/people/getNumList`, params).then(res => res.data);};
export const calcPayFee = params => { return axios.post(`${base}/people/calcPayFee`, params).then(res => res.data);};
export const peopleOut = params => { return axios.post(`${base}/people/peopleOut`, params).then(res => res.data);};
export const historyList = params => { return axios.post(`${base}/people/historyList`, params).then(res => res.data);};


// get 的寫法
// export const getUserList = params => { return axios.post(`${base}/user/list`, { params: params }); };