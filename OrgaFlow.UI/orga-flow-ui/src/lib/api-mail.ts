    import axios from "axios"

export const apiMail = axios.create({
    baseURL: "http://192.168.15.51:5023/api/mail/",
    withCredentials: true,
})

