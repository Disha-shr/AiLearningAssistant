import axiosInstance from "../utils/axiosIntance";
import { API_PATHS } from '../utils/apiPath.js';


// Register User
const register = async (username,email,password) => {
    try{
  const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
    username,
    email,
    password
  });
  return response.data; 
}catch(error) {
    throw error.response?.data || { message: 'An unknown error occured'};
}
};
// Login User
const login = async (email,password) => {
    try{
  const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
    email,
    password
  });
  return response.data; 
}catch(error) {
    throw error.response?.data || { message: 'An unknown error occured'};
}
};

// Get User Profile
 const getProfile = async () => {
   try{
  const response = await axiosInstance.post(API_PATHS.AUTH.GET_PROFILE);
  return response.data; 
}catch(error) {
    throw error.response?.data || { message: 'An unknown error occured'};
}
};

// Update Profile
 const updateProfile = async (userData) => {
    try{
  const response = await axiosInstance.post(API_PATHS.AUTH.UPDATE_PROFILE,userDATA);
  return response.data; 
}catch(error) {
    throw error.response?.data || { message: 'An unknown error occured'};
}
};

// Change Password
const changePassword = async (passwordData) => {
   try{
  const response = await axiosInstance.post(API_PATHS.AUTH.CHANGE_PASSWORD,passwords);
  return response.data; 
}catch(error) {
    throw error.response?.data || { message: 'An unknown error occured'};
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
