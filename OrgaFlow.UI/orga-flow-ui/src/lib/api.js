import axios from 'axios';

const api = axios.create({
    baseURL: 'http://192.168.55.51:5023/api/task/',
    withCredentials: true,
});

export default api;