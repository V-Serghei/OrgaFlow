// src/lib/apiMail.ts
import axios from "axios"

export const apiAuth = axios.create({
    baseURL: "http://localhost:5023/api/user/",
    withCredentials: true, 
})
