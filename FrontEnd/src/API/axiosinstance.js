import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8083/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

//  Tự động gắn token vào mọi request
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.error('Token không hợp lệ hoặc hết hạn!');
            localStorage.removeItem('token');
            // Chuyển hướng đến trang đăng nhập
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;