import axios from "axios"

/**
 * Axios instance для отправки запросов на сервер
 */
export const apiNotify = axios.create({
    baseURL: "http://192.168.15.51:5023/api/notifications/",
    withCredentials: true,
})


