import axios from "axios"

/**
 * Axios instance для отправки запросов на сервер
 */
export const apiNotify = axios.create({
    baseURL: "http://localhost:80/api/notifications/",
    withCredentials: true,
})


