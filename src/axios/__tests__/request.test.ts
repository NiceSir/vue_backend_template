import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createServer } from 'vite';

test('非登录请求读取最新 token，登录请求及无 token 请求移除旧鉴权头', async () => {
    const server = await createServer({
        configFile: false,
        envDir: false,
        server: { middlewareMode: true },
        optimizeDeps: { noDiscovery: true, include: [] },
        logLevel: 'error',
    });
    let removeInterceptor: (() => void) | undefined;
    try {
        const { request, setupRequestInterceptors } = (await server.ssrLoadModule(
            '/src/axios/index.ts'
        )) as typeof import('../index.ts');
        let token: string | null = 'first-token';
        let reads = 0;
        const interceptorId = setupRequestInterceptors(() => {
            reads++;
            return token;
        });
        removeInterceptor = () => request.interceptors.request.eject(interceptorId);
        request.defaults.headers.common.Authorization = 'Bearer stale-token';
        request.defaults.adapter = async (config) => ({
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
            data: null,
        });

        const response = await request.get('/me', { headers: { 'X-Trace': 'test' } });
        assert.equal(response.config.headers.get('Authorization'), 'Bearer first-token');
        assert.equal(response.config.headers.get('X-Trace'), 'test');
        assert.equal(reads, 1);

        for (const url of ['/login', '/login?redirect=/home']) {
            const loginResponse = await request.post(
                url,
                {},
                {
                    headers: { authorization: 'Bearer manually-specified-token' },
                }
            );
            assert.equal(loginResponse.config.headers.has('Authorization'), false);
            assert.equal(reads, 1);
        }

        token = 'second-token';
        const nextResponse = await request.get('/login/history');
        assert.equal(nextResponse.config.headers.get('Authorization'), 'Bearer second-token');
        assert.equal(reads, 2);

        for (const missingToken of [null, '']) {
            token = missingToken;
            const anonymous = await request.get('/me');
            assert.equal(anonymous.config.headers.has('Authorization'), false);
        }
    } finally {
        removeInterceptor?.();
        await server.close();
    }
});
