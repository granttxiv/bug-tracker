import axios from "axios";

export const apiClient = axios.create({
	baseURL: "http://localhost:3000",
	headers: {},
});

apiClient.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error),
);
