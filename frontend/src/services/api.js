
import axios from "axios";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:5000/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// Reusable API request function
export const apiRequest = async (endpoint, options = {}) => {
    try {
        if (typeof endpoint !== "string") {
            throw new Error("API endpoint must be a string.");
        }

        const response = await api({
            url: endpoint,
            method: options.method || "GET",
            data: options.data ?? options.body,
            headers: options.headers,
        });

        return response.data;

    } catch (error) {
        console.error(
            "API Request Error:",
            error.response?.data || error.message
        );

        throw error.response?.data || error;
    }
};

export default api;
