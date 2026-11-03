import { useCookies } from '@vueuse/integrations/useCookies';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { ElMessage } from 'element-plus'

import { getUserInfo, loginUser } from '@/axios/modules/user';
import type { LoginParams, UserInfo } from '@/axios/modules/user';
import config from '@/config';

/** 统一管理用户登录态和用户资料，表单校验、跳转与提示由页面处理。 */
export const useUserStore = defineStore('user', () => {
    const cookies = useCookies(['token'], { doNotParse: true });
    const token = ref<string | null>(null);
    const userInfo = ref<UserInfo | null>(null);
    const isLoggedIn = computed(() => Boolean(token.value));

    /** 优先读取 Cookie，不存在时返回内存中的 token，读取时不续期。 */
    const getToken = (): string | null => cookies.get<string | undefined>('token') ?? token.value;

    token.value = getToken();

    /**
     * 按配置有效期将 token 保存到 Cookie，并同步内存状态。
     * @param value 登录接口返回的 token。
     */
    const setToken = (value: string): void => {
        cookies.set('token', value, {
            maxAge: config.cookieExpires * 24 * 60 * 60,
            path: '/',
            sameSite: 'lax',
            secure: location.protocol === 'https:',
        });
        token.value = value;
    };

    // reset userinfo
    const resetUserinfo = () => {
        cookies.remove('token', { path: '/' });
        token.value = null;
        userInfo.value = null;
    }

    /** 获取并更新用户资料，失败时向调用方抛出错误。 */
    const fetchUserInfo = async () => {
        try {
            const response = await getUserInfo();
            userInfo.value = response.data.data;
            ElMessage.success('登录成功');
            return response;
        } catch(error) {
            resetUserinfo();
            throw error;
        }

    };

    /** 获取 token 后加载用户资料；任一步失败均清空本地会话并抛出原错误。 */
    const login = async (params: LoginParams) => {
        try {
            const response = await loginUser(params);
            const data = response.data.data;

            setToken(data.token);

            return response;
        } catch (error: unknown) {
            resetUserinfo();
            throw error;
        }
    };

    /** 退出登录的预留入口，目前不执行任何操作。 */
    const logout = () => {
        // TODO(auth): 待确定退出接口、会话清理和页面跳转规则后实现。
    };

    return { token, userInfo, isLoggedIn, getToken, setToken, login, logout, fetchUserInfo, resetUserinfo};
});
