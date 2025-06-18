import axios from "axios";

const API_URL = "/api/notifications";

const getNotificationsByUser = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching notifications:", error);
        throw error;
    }
};

export default {
    getNotificationsByUser,
};
