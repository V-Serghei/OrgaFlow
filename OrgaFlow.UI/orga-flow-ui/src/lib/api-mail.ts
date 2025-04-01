import axios from "axios"

/**
 * Axios instance для отправки запросов на сервер
 */
export const apiMail = axios.create({
    baseURL: "http://localhost:5023/api/mail/",
    withCredentials: true,
})


