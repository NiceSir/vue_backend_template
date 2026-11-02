import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { loginUser } from '@/axios/modules/user';
import type { LoginParams, UserInfo } from '@/axios/modules/user';

/** 统一管理用户登录态和用户资料，表单校验、跳转与提示由页面处理。 */
export const useUserManager = defineStore('user', () => {
    const token = ref<string | null>(sessionStorage.getItem('token'));
    const userInfo = ref<UserInfo | null>(null);
    const isLoggedIn = computed(() => Boolean(token.value));

    /** 登录成功后保存会话与用户资料，返回原始响应，失败时向调用方抛出错误。 */
    const login = async (params: LoginParams) => {
        const response = await loginUser(params);
        const data = response.data.data;

        sessionStorage.setItem('token', data.token);
        token.value = data.token;
        userInfo.value = data.user;

        return response;
    };

    /** 退出登录的预留入口，目前不执行任何操作。 */
    const logout = () => {
        // TODO(auth): 待确定退出接口、会话清理和页面跳转规则后实现。
    };

    /** 重新获取用户资料的预留入口，目前不发起请求。 */
    const fetchUserInfo = () => {
        // TODO(user): 待接入用户资料刷新流程后实现。
    };

    return { token, userInfo, isLoggedIn, login, logout, fetchUserInfo };
});
