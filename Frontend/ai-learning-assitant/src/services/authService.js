import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPath.js";

// Register User
const register = async (username, email, password) => {
    try {
        const response = await axiosInstance.post(
            API_PATHS.AUTH.REGISTER,
            {
                username,
                email,
                password,
            }
        );

        return response.data;
    } catch (error) {
        throw error.response?.data || {
            message: "An unknown error occurred",
        };
    }
};

// Login User
const login = async (email, password) => {
    try {
        const response = await axiosInstance.post(
            API_PATHS.AUTH.LOGIN,
            {
                email,
                password,
            }
        );

        return response.data;
    } catch (error) {
        throw error.response?.data || {
            message: "An unknown error occurred",
        };
    }
};

// Get User Profile
const getProfile = async () => {
    try {
        const response = await axiosInstance.get(
            API_PATHS.AUTH.GET_PROFILE
        );

        return response.data;
    } catch (error) {
        throw error.response?.data || {
            message: "An unknown error occurred",
        };
    }
};

// Update Profile
const updateProfile = async (userData) => {
    try {
        const response = await axiosInstance.put(
            API_PATHS.AUTH.UPDATE_PROFILE,
            userData
        );

        return response.data;
    } catch (error) {
        throw error.response?.data || {
            message: "An unknown error occurred",
        };
    }
};

// Change Password
const changePassword = async (passwordData) => {
    try {
        const response = await axiosInstance.post(
            API_PATHS.AUTH.CHANGE_PASSWORD,
            passwordData
        );

        return response.data;
    } catch (error) {
        throw error.response?.data || {
            message: "An unknown error occurred",
        };
    }
};

const authService = {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword,
};

export default authService;