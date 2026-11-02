import type { IncomingMessage, ServerResponse } from 'node:http'
import { json } from 'node:stream/consumers'

import Mock from 'mockjs'
import type { Plugin } from 'vite'

import { createMockUsers } from '../../mock/users.ts'
import type { MockUser } from '../../mock/users.ts'

const MOCK_PASSWORD = 'Mock@123456'
const ROUTE_METHODS = new Map([
  ['/users', 'GET'],
  ['/login', 'POST'],
  ['/me', 'GET'],
])

interface MockResponse {
  code: number
  message: string
  data: unknown
}

const sendJSON = (response: ServerResponse, status: number, body: MockResponse) => {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  response.end(JSON.stringify(body))
}

/** 创建仅用于 Vite 开发服务的用户 Mock 接口，数据与会话在服务重启时重置。 */
export const createUserMockPlugin = (): Plugin => ({
  name: 'user-mock',
  apply: 'serve',
  configureServer(server) {
    // 每个开发服务独立持有数据，避免每次请求重新随机生成用户。
    const users = createMockUsers()
    const sessions = new Map<string, MockUser>()

    const handleRequest = async (request: IncomingMessage, response: ServerResponse) => {
      const pathname = new URL(request.url ?? '/', 'http://localhost').pathname
      const method = ROUTE_METHODS.get(pathname)

      if (!method) {
        sendJSON(response, 404, { code: 404, message: '模拟接口不存在', data: null })
        return
      }

      if (request.method !== method) {
        response.setHeader('Allow', method)
        sendJSON(response, 405, { code: 405, message: '请求方法不支持', data: null })
        return
      }

      if (pathname === '/users') {
        sendJSON(response, 200, {
          code: 0,
          message: '获取用户列表成功',
          data: { list: users, total: users.length },
        })
        return
      }

      if (pathname === '/login') {
        const body: unknown = await json(request)

        if (
          body === null ||
          typeof body !== 'object' ||
          !('username' in body) ||
          typeof body.username !== 'string' ||
          !('password' in body) ||
          typeof body.password !== 'string'
        ) {
          sendJSON(response, 400, { code: 400, message: '账号和密码必须为字符串', data: null })
          return
        }

        const user = users.find((item) => item.username === body.username)
        const password = body.username === '18888888888' ? '12345678' : MOCK_PASSWORD
        if (!user || body.password !== password) {
          sendJSON(response, 401, { code: 401, message: '账号或密码错误', data: null })
          return
        }

        const token = `mock-${Mock.Random.guid()}`
        sessions.set(token, user)
        sendJSON(response, 200, { code: 0, message: '登录成功', data: { token, user } })
        return
      }

      const authorization = request.headers.authorization
      const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : undefined
      const user = token ? sessions.get(token) : undefined

      if (!user) {
        sendJSON(response, 401, { code: 401, message: '请先登录', data: null })
        return
      }

      sendJSON(response, 200, { code: 0, message: '获取当前用户成功', data: user })
    }

    server.middlewares.use('/api/mock', (request, response) => {
      handleRequest(request, response).catch((error: unknown) => {
        if (error instanceof SyntaxError) {
          sendJSON(response, 400, { code: 400, message: '请求体必须为有效 JSON', data: null })
          return
        }

        const reason = error instanceof Error ? error.message : String(error)
        server.config.logger.error(`[Mock] ${request.method} ${request.url} 处理失败：${reason}`)
        sendJSON(response, 500, { code: 500, message: '模拟接口处理失败', data: null })
      })
    })
  },
})
