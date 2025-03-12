
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:80/api/task/',
    withCredentials: true, 
});

export default api;