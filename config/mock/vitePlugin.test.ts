import assert from 'node:assert/strict'
import { test } from 'node:test'

import { createServer } from 'vite'

import { createUserMockPlugin } from './vitePlugin.ts'
import type { MockUser } from '../../mock/users.ts'
import type { UserInfo } from '../../src/axios/modules/user/types.ts'

test('固定用户使用指定密码，随机用户保留原密码，响应不包含密码', async () => {
  const server = await createServer({
    configFile: false,
    envDir: false,
    plugins: [createUserMockPlugin()],
    server: { host: '127.0.0.1', port: 0, strictPort: true },
    optimizeDeps: { noDiscovery: true, include: [] },
    logLevel: 'error',
  })

  try {
    await server.listen()
    const address = server.httpServer?.address()
    assert.ok(address && typeof address !== 'string')
    const baseURL = `http://127.0.0.1:${address.port}/api/mock`
    const usersResponse = await fetch(`${baseURL}/users`)
    const usersResult = (await usersResponse.json()) as {
      data: { list: MockUser[]; total: number }
    }
    assert.equal(usersResult.data.total, 3)
    assert.equal(usersResult.data.list.some((user) => user.username === '18888888888'), true)
    assert.equal(usersResult.data.list.every((user) => !('password' in user)), true)
    const randomUser = usersResult.data.list.find((user) => user.username !== '18888888888')
    assert.ok(randomUser)
    assert.equal((await fetch(`${baseURL}/me`)).status, 401)
    assert.equal((await fetch(`${baseURL}/me`, {
      headers: { Authorization: 'Bearer invalid-token' },
    })).status, 401)

    for (const [username, password, expectedStatus] of [
      ['18888888888', '12345678', 200],
      ['18888888888', 'Mock@123456', 401],
      [randomUser.username, 'Mock@123456', 200],
      [randomUser.username, '12345678', 401],
      ['unknown-user', '12345678', 401],
    ] as const) {
      const response = await fetch(`${baseURL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      assert.equal(response.status, expectedStatus, `账号 ${username} 的登录结果`)
      const result = (await response.json()) as {
        data: { token: string } | null
      }
      if (expectedStatus === 200) {
        assert.ok(result.data)
        assert.deepEqual(Object.keys(result.data), ['token'])
        const currentResponse = await fetch(`${baseURL}/me`, {
          headers: { Authorization: `Bearer ${result.data.token}` },
        })
        assert.equal(currentResponse.status, 200)
        const current = (await currentResponse.json()) as { data: UserInfo }
        const account = usersResult.data.list.find((user) => user.username === username)
        assert.ok(account)
        assert.equal(current.data.name, account.nickname)
        assert.equal(current.data.email, account.email)
        assert.equal(current.data.is_super, account.role === 'admin' ? 1 : 0)
        assert.equal(typeof current.data.admin_id, 'number')
        assert.equal(current.data.deleted_at, null)
        assert.deepEqual(Object.keys(current.data).sort(), [
          'admin_id', 'authority_area', 'avatar', 'created_at', 'deleted_at', 'department',
          'email', 'is_super', 'menu', 'name', 'op_per_user', 'op_user', 'phone', 'updated_at',
        ].sort())
        assert.equal('password' in current.data, false)
        assert.deepEqual(current.data.menu, [
          { path: '/home', path_id: 1, pid: 0, title: '首页', children: null },
        ])
        const repeated = await fetch(`${baseURL}/me`, {
          headers: { Authorization: `Bearer ${result.data.token}` },
        })
        assert.deepEqual((await repeated.json()).data, current.data)
      }
    }
  } finally {
    await server.close()
  }
})
