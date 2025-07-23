// Service để xử lý các API calls liên quan đến user management
import axiosInstance from "../utils/axiosInstance.js";

const API_BASE_URL = 'http://localhost:8080/api/users';

class UserService {
    // Lấy tất cả users hoặc tìm kiếm theo query parameters
    async getAllUsers(searchParams = {}, token = null) {
        try {
            const queryString = new URLSearchParams();
            
            // Thêm các query parameters nếu có
            if (searchParams.fullname) queryString.append('fullname', searchParams.fullname);
            if (searchParams.email) queryString.append('email', searchParams.email);
            if (searchParams.phone) queryString.append('phone', searchParams.phone);
            if (searchParams.address) queryString.append('address', searchParams.address);

            const url = queryString.toString() 
                ? `${API_BASE_URL}?${queryString.toString()}`
                : API_BASE_URL;

            console.log('GET Request URL:', url);

            const headers = {
                'Content-Type': 'application/json',
            };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const response = await fetch(url, {
                method: 'GET',
                headers,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('GET Response data:', data);
            return data;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    }

    // Lấy user theo ID
    async getUserById(id, token = null) {
        try {
            console.log('Getting user by ID:', id);
            const headers = {
                'Content-Type': 'application/json',
            };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'GET',
                headers,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('GET by ID Response data:', data);
            return data;
        } catch (error) {
            console.error('Error fetching user by ID:', error);
            throw error;
        }
    }

    // Tạo user mới
    async createUser(userData, token = null) {
        try {
            console.log('Creating user with data:', userData);
            const headers = {
                'Content-Type': 'application/json',
            };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers,
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Create user error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('POST Response data:', data);
            return data;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    // Cập nhật user
    async updateUser(id, userData, token = null) {
        try {
            console.log('Updating user ID:', id, 'with data:', userData);
            const headers = {
                'Content-Type': 'application/json',
            };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(userData),
            });

            console.log('Update response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Update user error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('PUT Response data:', data);
            return data;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    // Xóa user
    async deleteUser(id, token = null) {
        try {
            console.log('Deleting user ID:', id);
            const headers = {
                'Content-Type': 'application/json',
            };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'DELETE',
                headers,
            });

            console.log('Delete response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Delete user error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            return true;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }

    // Thay đổi status user (block/unblock)
    async changeUserStatus(id, token = null) {
        try {
            console.log('Changing status for user ID:', id);
            const headers = {
                'Content-Type': 'application/json',
            };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const response = await fetch(`${API_BASE_URL}/${id}/status`, {
                method: 'PUT',
                headers,
            });

            console.log('Change status response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Change status error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            return true;
        } catch (error) {
            console.error('Error changing user status:', error);
            throw error;
        }
    }

    // Tìm kiếm nâng cao
    async advancedSearch(searchParams, token = null) {
        return this.getAllUsers(searchParams, token);
    }

    // Lấy profile user
    async getProfile(token = null) {
        const headers = {
            'Content-Type': 'application/json',
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const response = await fetch(`${API_BASE_URL}/profile`, {
            method: 'GET',
            headers,
        });
    }
    //api get all staff
    async getAllStaff(token = null) {
        const response = await axiosInstance.get(`${API_BASE_URL}/staff`);
        console.log('Getting all staff for user token:', response);
        return response;
    }
}

// Export instance của service
const userService = new UserService();
export default userService; 
