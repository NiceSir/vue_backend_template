import assert from 'node:assert/strict'
import { test } from 'node:test'

import { createServer } from 'vite'

import { createUserMockPlugin } from './vitePlugin.ts'
import type { MockUser } from '../../mock/users.ts'

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
        data: { token: string; user: MockUser } | null
      }
      if (expectedStatus === 200) {
        assert.ok(result.data)
        assert.equal(result.data.user.username, username)
        assert.equal('password' in result.data.user, false)
        const currentResponse = await fetch(`${baseURL}/me`, {
          headers: { Authorization: `Bearer ${result.data.token}` },
        })
        assert.equal(currentResponse.status, 200)
        const current = (await currentResponse.json()) as { data: MockUser }
        assert.equal(current.data.username, username)
        assert.equal('password' in current.data, false)
      }
    }
  } finally {
    await server.close()
  }
})
