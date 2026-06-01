import axiosInstance from "../utils/axiosIntance";
import { API_PATHS } from "../utils/apiPath";

const getDashboardData = async () => {
    try{
        const response = await axiosInstance.get(API_PATHS.PROGRESS.GET_DASHBIARD);
        return response.data;
    }catch(error) {
        throw error.response?.data || { message: 'Failed to fetch dashboard data '};
    }
};

const progressService = {
    getDashboardData,
};

export default progressService;