import axios from 'axios';

/** 项目共享请求实例，保留 Axios 原始响应与错误，拦截器在此按需配置。 */
export const request = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

/**
 * 注册请求鉴权拦截器，通过回调读取 token，避免请求层依赖用户 Store。
 * @param getToken 获取当前 token 的方法。
 * @returns 拦截器 ID，可通过 request.interceptors.request.eject 移除。
 */
export const setupRequestInterceptors = (getToken: () => string | null) =>
    request.interceptors.request.use((config) => {
        if (config.url?.split(/[?#]/)[0] === '/login') {
            config.headers.delete('Authorization');
            return config;
        }

        const token = getToken();
        if (token) {
            config.headers.set('Authorization', `Bearer ${token}`);
        } else {
            config.headers.delete('Authorization');
        }

        return config;
    });
