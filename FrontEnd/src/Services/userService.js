import axiosInstance from '../utils/axiosInstance.js';

// Service để xử lý các API calls liên quan đến user management
class UserService {
    // Lấy tất cả users hoặc tìm kiếm theo query parameters
    async getAllUsers(searchParams = {}) {
        try {
            const params = {};
            if (searchParams.fullname) params.fullname = searchParams.fullname;
            if (searchParams.email) params.email = searchParams.email;
            if (searchParams.phone) params.phone = searchParams.phone;
            if (searchParams.address) params.address = searchParams.address;
            const response = await axiosInstance.get('/api/users', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    }

    // Lấy user theo ID
    async getUserById(id) {
        try {
            const response = await axiosInstance.get(`/api/users/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user by ID:', error);
            throw error;
        }
    }

    // Tạo user mới
    async createUser(userData) {
        try {
            const response = await axiosInstance.post('/api/users', userData);
            return response.data;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    // Cập nhật user
    async updateUser(id, userData) {
        try {
            const response = await axiosInstance.put(`/api/users/${id}`, userData);
            return response.data;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    // Xóa user
    async deleteUser(id) {
        try {
            await axiosInstance.delete(`/api/users/${id}`);
            return true;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }

    // Thay đổi status user (block/unblock)
    async changeUserStatus(id) {
        try {
            await axiosInstance.put(`/api/users/${id}/status`);
            return true;
        } catch (error) {
            console.error('Error changing user status:', error);
            throw error;
        }
    }

    // Tìm kiếm nâng cao
    async advancedSearch(searchParams) {
        return this.getAllUsers(searchParams);
    }

    // Lấy profile user
    async getProfile() {
        const response = await axiosInstance.get('/api/users/profile');
        return response.data;
    }
    //api get all staff
    async getAllStaff() {
        const response = await axiosInstance.get('/api/users/staff');
        return response.data;
    }
}

// Export instance của service
const userService = new UserService();
export default userService;