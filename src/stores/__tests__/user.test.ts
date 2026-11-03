import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { AxiosError, isAxiosError } from 'axios';
import { createPinia } from 'pinia';
import { createServer } from 'vite';

test('Cookie 恢复、有效期、token 优先级及登录失败清理会话', async () => {
    const originalDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
    const originalLocation = Object.getOwnPropertyDescriptor(globalThis, 'location');
    let cookieHeader = 'another_token=ignored; token=old%3Dtoken; other=1';
    let writtenCookie = '';
    let writeCount = 0;
    const stores: Array<{ $dispose: () => void }> = [];
    let removeInterceptor: (() => void) | undefined;
    const location = { protocol: 'https:' };
    Object.defineProperty(globalThis, 'document', {
        configurable: true,
        value: {
            get cookie() {
                return cookieHeader;
            },
            set cookie(value: string) {
                writtenCookie = value;
                cookieHeader = value.includes('Max-Age=0') ? '' : (value.split(';')[0] ?? '');
                writeCount++;
            },
        },
    });
    Object.defineProperty(globalThis, 'location', { configurable: true, value: location });

    const server = await createServer({
        configFile: false,
        envDir: false,
        server: { middlewareMode: true },
        resolve: {
            alias: {
                '@/config': fileURLToPath(new URL('../../../config', import.meta.url)),
                '@': fileURLToPath(new URL('../../', import.meta.url)),
            },
        },
        optimizeDeps: { noDiscovery: true, include: [] },
        logLevel: 'error',
    });
    try {
        const { useUserStore } = (await server.ssrLoadModule(
            '/src/stores/user.ts'
        )) as typeof import('../user.ts');
        const { request, setupRequestInterceptors } = (await server.ssrLoadModule(
            '/src/axios/index.ts'
        )) as typeof import('../../axios/index.ts');
        const { default: config } = (await server.ssrLoadModule(
            '/config/index.ts'
        )) as typeof import('../../../config/index.ts');
        const originalExpires = config.cookieExpires;
        const createStore = () => {
            const store = useUserStore(createPinia());
            stores.push(store);
            return store;
        };
        const restored = createStore();
        assert.equal(restored.token, 'old=token');
        assert.equal(restored.getToken(), 'old=token');
        assert.equal(restored.isLoggedIn, true);
        assert.equal(writeCount, 0);

        cookieHeader = 'token=cookie-priority';
        assert.equal(restored.getToken(), 'cookie-priority');
        assert.equal(restored.token, 'old=token');
        cookieHeader = '';
        assert.equal(restored.getToken(), 'old=token');
        assert.equal(writeCount, 0);
        const store = createStore();
        const interceptorId = setupRequestInterceptors(() => store.getToken());
        removeInterceptor = () => request.interceptors.request.eject(interceptorId);
        assert.equal(store.token, null);
        assert.equal(store.getToken(), null);
        assert.equal(store.isLoggedIn, false);
        const params = { username: '18888888888', password: '12345678' };
        const data = {
            token: 'mock-token=a+b/中',
            user: {
                admin_id: 1,
                authority_area: '',
                avatar: '',
                created_at: '2026-11-02 10:00:00',
                deleted_at: null,
                department: '技术',
                email: 'test@example.com',
                is_super: 0 as const,
                name: '测试用户',
                op_per_user: 'test@example.com',
                op_user: 'test@example.com',
                phone: '',
                updated_at: '2026-11-02 10:00:00',
                menu: [
                    { path: '/home', path_id: 1, pid: 0, title: '首页', children: null },
                ],
            },
        };
        const calls: string[] = [];
        request.defaults.adapter = async (requestConfig) => {
            calls.push(`${requestConfig.method} ${requestConfig.url}`);
            if (requestConfig.url === '/login') {
                assert.equal(requestConfig.headers.has('Authorization'), false);
            } else {
                assert.equal(requestConfig.url, '/me');
                assert.equal(requestConfig.headers.get('Authorization'), `Bearer ${data.token}`);
            }
            return {
                data: {
                    code: 0,
                    message: '请求成功',
                    data: requestConfig.url === '/login' ? { token: data.token } : data.user,
                },
                status: 200,
                statusText: 'OK',
                headers: {},
                config: requestConfig,
            };
        };
        config.cookieExpires = 2;
        const response = await store.login(params);
        assert.equal(response.status, 200);
        assert.deepEqual(response.data.data, { token: data.token });
        assert.deepEqual(calls, ['post /login', 'get /me']);
        assert.equal(store.token, data.token);
        assert.deepEqual(store.userInfo, data.user);
        assert.equal(store.isLoggedIn, true);
        const attributes = new Set(writtenCookie.split('; '));
        assert.ok(attributes.has(`token=${encodeURIComponent(data.token)}`));
        assert.ok(attributes.has('Max-Age=172800'));
        assert.ok(attributes.has('Path=/'));
        assert.ok(attributes.has('SameSite=Lax'));
        assert.ok(attributes.has('Secure'));
        assert.equal(createStore().token, data.token);
        assert.equal(writeCount, 1);
        const userResponse = await store.fetchUserInfo();
        assert.deepEqual(userResponse.data.data, data.user);
        assert.equal(writeCount, 1);

        location.protocol = 'http:';
        config.cookieExpires = originalExpires;
        await store.login(params);
        assert.ok(writtenCookie.includes(`Max-Age=${originalExpires * 24 * 60 * 60}`));
        assert.equal(writtenCookie.includes('; Secure'), false);
        const networkError = new Error('模拟网络失败');
        request.defaults.adapter = async () => {
            throw networkError;
        };
        await assert.rejects(store.login(params), (error) => error === networkError);
        assert.ok(writtenCookie.includes('Max-Age=0'));
        assert.ok(writtenCookie.includes('Path=/'));
        assert.equal(cookieHeader, '');
        assert.equal(store.token, null);
        assert.equal(store.userInfo, null);
        assert.equal(store.isLoggedIn, false);
        assert.equal(store.getToken(), null);
        assert.equal(writeCount, 3);

        cookieHeader = '';
        assert.equal(createStore().isLoggedIn, false);
        assert.equal(store.token, null);
        cookieHeader = 'token=12345678';
        assert.equal(createStore().token, '12345678');
        assert.equal(store.getToken(), '12345678');

        assert.equal(store.setToken('manual-token'), undefined);
        assert.equal(store.token, 'manual-token');
        assert.equal(cookieHeader, 'token=manual-token');
        assert.equal(store.getToken(), 'manual-token');
        assert.ok(writtenCookie.includes(`Max-Age=${originalExpires * 24 * 60 * 60}`));
        cookieHeader = 'token=';
        assert.equal(store.getToken(), '');
        cookieHeader = '';
        assert.equal(store.getToken(), 'manual-token');
        assert.equal(writeCount, 4);

        store.setToken('active-before-401');
        store.userInfo = data.user;
        let httpError: AxiosError | undefined;
        request.defaults.adapter = async (requestConfig) => {
            assert.equal(requestConfig.url, '/login');
            httpError = new AxiosError(
                '账号或密码错误',
                AxiosError.ERR_BAD_REQUEST,
                requestConfig,
                undefined,
                {
                    status: 401,
                    statusText: 'Unauthorized',
                    data: { message: '账号或密码错误' },
                    headers: {},
                    config: requestConfig,
                }
            );
            throw httpError;
        };
        await assert.rejects(
            store.login(params),
            (error) => error === httpError && isAxiosError(error) && error.response?.status === 401
        );
        assert.equal(cookieHeader, '');
        assert.equal(store.getToken(), null);
        assert.equal(store.token, null);
        assert.equal(store.userInfo, null);
        assert.equal(store.isLoggedIn, false);

        store.setToken('old-session-before-user-info-failure');
        store.userInfo = data.user;
        let profileError: AxiosError | undefined;
        const failedCalls: string[] = [];
        request.defaults.adapter = async (requestConfig) => {
            failedCalls.push(`${requestConfig.method} ${requestConfig.url}`);
            if (requestConfig.url === '/login') {
                return {
                    data: { code: 0, message: '登录成功', data: { token: 'new-session' } },
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config: requestConfig,
                };
            }
            assert.equal(requestConfig.url, '/me');
            assert.equal(requestConfig.headers.get('Authorization'), 'Bearer new-session');
            profileError = new AxiosError(
                '获取用户资料失败',
                AxiosError.ERR_BAD_RESPONSE,
                requestConfig,
                undefined,
                {
                    status: 500,
                    statusText: 'Internal Server Error',
                    data: { message: '获取用户资料失败' },
                    headers: {},
                    config: requestConfig,
                }
            );
            throw profileError;
        };
        await assert.rejects(store.login(params), (error) => error === profileError);
        assert.deepEqual(failedCalls, ['post /login', 'get /me']);
        assert.equal(cookieHeader, '');
        assert.equal(store.getToken(), null);
        assert.equal(store.token, null);
        assert.equal(store.userInfo, null);
        assert.equal(store.isLoggedIn, false);
    } finally {
        removeInterceptor?.();
        for (const store of stores) store.$dispose();
        await server.close();
        if (originalDocument) Object.defineProperty(globalThis, 'document', originalDocument);
        else Reflect.deleteProperty(globalThis, 'document');
        if (originalLocation) Object.defineProperty(globalThis, 'location', originalLocation);
        else Reflect.deleteProperty(globalThis, 'location');
    }
});
