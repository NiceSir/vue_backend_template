import axios from 'axios';

/** 项目共享请求实例，保留 Axios 原始响应与错误，拦截器在此按需配置。 */
export const request = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});
