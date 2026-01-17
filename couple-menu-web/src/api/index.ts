import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const instance = axios.create({
	baseURL: API_BASE_URL,
	timeout: 10000,
});

// 根据当前路径获取对应的 token key
const getTokenKey = () => {
	const path = window.location.pathname;
	return path.startsWith('/admin') ? 'admin_token' : 'app_token';
};

instance.interceptors.request.use(
	(config) => {
		const tokenKey = getTokenKey();
		const token = localStorage.getItem(tokenKey);
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error),
);

instance.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			const tokenKey = getTokenKey();
			localStorage.removeItem(tokenKey);
			// 根据当前路径决定重定向到哪个登录页
			const currentPath = window.location.pathname;
			if (currentPath.startsWith('/admin')) {
				window.location.href = '/admin/login';
			} else {
				window.location.href = '/app/login';
			}
		}
		return Promise.reject(error);
	},
);

export default instance;
