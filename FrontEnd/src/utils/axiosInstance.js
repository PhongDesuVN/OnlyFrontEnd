import axios from "axios";
import Cookies from "js-cookie";

const instance = axios.create({
    baseURL: "http://localhost:8080", // sửa baseURL đúng theo backend bạn

    //   "https://operator-management-system.onrender.com" "http://localhost:8080"
    headers: {
        "Content-Type": "application/json"
    }
});

// Gắn token tự động vào mỗi request
instance.interceptors.request.use(
    (config) => {
        const token = Cookies.get("authToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default instance;
