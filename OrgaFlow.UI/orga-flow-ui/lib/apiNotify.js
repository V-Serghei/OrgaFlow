import axios from 'axios';

const apiNotify = axios.create({
    baseURL: 'http://localhost:5023/api/notifications/',
    withCredentials: true,
});

export default apiNotify;