
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

let accessToken = null;
let refreshPromise = null;

export const setAccessToken = (token) => {
    accessToken = token;
};

// Attach access token to every protected request
api.interceptors.request.use((config) => {
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
});

// Automatically refresh expired access tokens
api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status !== 401 ||
            !originalRequest ||
            originalRequest._retry ||
            originalRequest.url?.includes("/auth/login") ||
            originalRequest.url?.includes("/auth/refresh") ||
            originalRequest.url?.includes("/auth/logout")
        ) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            if (!refreshPromise) {
                refreshPromise = api
                    .post("/auth/refresh")
                    .then((response) => {
                        const newToken = response.data.accessToken;

                        if (!newToken) {
                            throw new Error("Access token not received.");
                        }

                        setAccessToken(newToken);
                        return newToken;
                    })
                    .finally(() => {
                        refreshPromise = null;
                    });
            }

            const newToken = await refreshPromise;

            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;

            return api(originalRequest);

        } catch (refreshError) {
            setAccessToken(null);
            window.dispatchEvent(new Event("auth:session-expired"));

            return Promise.reject(refreshError);
        }
    }
);

// Reusable API request function
export const apiRequest = async (
    endpoint,
    options = {},
    token = accessToken
) => {
    try {
        if (typeof endpoint !== "string") {
            throw new Error("API endpoint must be a string.");
        }

        const response = await api({
            url: endpoint,
            method: options.method || "GET",
            data: options.data ?? options.body,
            headers: {
                ...options.headers,
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
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
