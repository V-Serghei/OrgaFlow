import axios from "axios"

export const apiMail = axios.create({
    baseURL: "http://localhost:5023/api/mail/",
    withCredentials: true,
})

