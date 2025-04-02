import axios from "axios"

export const apiMail = axios.create({
    baseURL: "http://localhost:80/api/mail/",
    withCredentials: true,
})

