import { request } from '@/axios';
import type { UserInfo } from './types';

export type { UserInfo } from './types';

/** 用户登录接口的账号和密码参数。 */
export interface LoginParams {
    username: string;
    password: string;
}

interface LoginResponse {
    code: number;
    message: string;
    data: {
        token: string;
    };
}

interface UserInfoResponse {
    code: number;
    message: string;
    data: UserInfo;
}

/** 使用账号和密码获取 token，返回完整的 Axios 响应。 */
export const loginUser = (params: LoginParams) => request.post<LoginResponse>('/login', params);

/** 获取当前登录用户资料，鉴权头由请求拦截器注入，返回完整的 Axios 响应。 */
export const getUserInfo = () => request.get<UserInfoResponse>('/me');
