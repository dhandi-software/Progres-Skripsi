import axios from "axios";

// Hardcode to port 5000 to fix connection issues
const API_URL = "http://localhost:5002/api";

export const client = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    // Enable sending cookies with requests
    withCredentials: true,
});

// Request interceptor to add token
client.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("jwt");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle errors
client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Handle unauthorized (e.g., redirect to login)
            console.warn("Unauthorized request - JWT might be expired");
        }
        return Promise.reject(error);
    }
);
