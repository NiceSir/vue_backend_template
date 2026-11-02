<template>
    <main class="login-main">
        <img class="login-main-left" src="@/assets/images/backend_bg.jpg" alt="" />
        <section class="login-main-right" aria-labelledby="login-main-title">
            <h2 id="login-main-title">运营后台</h2>
            <el-form
                ref="loginFormRef"
                class="login-main-form"
                :model="loginForm"
                :rules="loginRules"
                label-width="auto"
                style="max-width: 300px"
            >
                <el-form-item prop="username">
                    <el-input
                        v-model="loginForm.username"
                        placeholder="请输入账号"
                        :prefix-icon="User"
                        type="text"
                    />
                </el-form-item>
                <el-form-item prop="password">
                    <el-input
                        v-model="loginForm.password"
                        placeholder="请输入密码"
                        :prefix-icon="Lock"
                        type="password"
                    />
                </el-form-item>
                <el-form-item>
                    <el-button
                        class="login-form-btn"
                        round
                        color="#9c7deb"
                        size="large"
                        :loading="isSubmitting"
                        @click="handleSubmit"
                    >
                        登录
                    </el-button>
                </el-form-item>
            </el-form>
        </section>
    </main>
</template>

<script lang="ts" setup>
import { isAxiosError } from 'axios';
import { reactive, ref, useTemplateRef } from 'vue';
import { useRouter } from 'vue-router';
import { User, Lock } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';

import { useUserManager } from '@/managers/user';

const router = useRouter();
const userManager = useUserManager();
const loginFormRef = useTemplateRef<FormInstance>('loginFormRef');
const isSubmitting = ref(false);
const loginForm = reactive({
    username: '',
    password: '',
});

const loginRules: FormRules = {
    username: [
        {
            required: true,
            message: '请输入账号',
            trigger: 'blur',
        },
    ],
    password: [
        {
            required: true,
            message: '请输入密码',
            max: 16,
            trigger: 'blur',
        },
    ],
};


const handleSubmit = async () => {
    if (!loginFormRef.value || isSubmitting.value) return;

    isSubmitting.value = true;
    try {
        await loginFormRef.value.validate(async (isValid) => {
            if (!isValid) return;

            await userManager.login(loginForm);
            await router.replace({ name: 'home' });
            ElMessage.success('登录成功');
        });
    } catch (error: unknown) {
        if (isAxiosError<{ message: string }>(error)) {
            ElMessage.error(error.response?.data.message ?? '网络请求失败，请稍后重试');
        } else {
            console.error('登录提交失败', error);
            ElMessage.error('登录失败，请稍后重试');
        }
    } finally {
        isSubmitting.value = false;
    }
};
</script>

<style lang="less" scoped>
@import (reference) '@/less/mixins.less';

.login-main {
    height: 600px;
    min-width: 800px;
    position: absolute;
    top: 8%;
    left: 50%;
    transform: translateX(-50%);
    background-color: #fff;
    border-radius: 24px;
    .u-flex(row,flex-start);

    .login-main-left {
        width: 360px;
        height: 100%;
        border-radius: 24px 0 0 24px;
    }

    .login-main-right {
        flex: 1;
        .u-flex();
        gap: 40px;

        #login-main-title {
            .u-no-select();
            color: #9c7deb;
            font-size: 30px;
        }
        .login-main-form {
            .u-flex();

            .el-input {
                width: 260px;
                border: none;
            }

            .login-form-btn {
                margin-top: 20px;
                text-align: center;
                color: #fff;
                width: 160px;
            }
        }
    }
}
</style>
