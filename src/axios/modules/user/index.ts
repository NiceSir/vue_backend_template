import { request } from '@/axios';

/** 用户登录接口的账号和密码参数。 */
export interface LoginParams {
    username: string;
    password: string;
}

/** 登录接口返回的用户资料，不包含密码。 */
export interface UserInfo {
    id: string;
    username: string;
    nickname: string;
    email: string;
    role: 'admin' | 'user';
}

interface LoginResponse {
    code: number;
    message: string;
    data: {
        token: string;
        user: UserInfo;
    };
}

/** 使用账号和密码登录，返回包含接口数据的完整 Axios 响应。 */
export const loginUser = (params: LoginParams) => request.post<LoginResponse>('/login', params);
