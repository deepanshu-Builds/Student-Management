
import axios from "axios";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:5000/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
});

// Reusable API request function
export const apiRequest = async (method, endpoint, data = null) => {
    try {
        const response = await api({
            method,
            url: endpoint,
            data
        });

        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export default api;
