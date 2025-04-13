// src/lib/apiMail.ts
import axios from "axios"

export const apiAuth = axios.create({
    baseURL: "http://192.168.55.51:5023/api/user/",
    withCredentials: true, 
})
