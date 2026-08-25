import axios from "axios";

export const apiClient = axios.create({
	baseURL: "",
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
