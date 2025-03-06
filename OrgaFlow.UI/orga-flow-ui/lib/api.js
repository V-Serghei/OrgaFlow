
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5023/api/task/',
    withCredentials: true, 
});

export default api;