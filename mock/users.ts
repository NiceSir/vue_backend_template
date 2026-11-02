import Mock from 'mockjs'

/** Mock 接口返回的用户资料，不包含登录密码。 */
export interface MockUser {
  id: string
  username: string
  nickname: string
  email: string
  role: 'admin' | 'user'
}

/** 生成两个随机用户及一个固定测试用户。 */
export const createMockUsers = (): MockUser[] => {
  const roles = ['admin', 'user'] as const

  const users = roles.map((role, index) => ({
    id: Mock.Random.guid(),
    username: `mock_${index + 1}_${Mock.Random.word(4, 8)}`,
    nickname: Mock.Random.cname(),
    email: Mock.Random.email(),
    role,
  }))

  users.push({
    id: 'mock-user-18888888888',
    username: '18888888888',
    nickname: '测试用户',
    email: 'test@example.com',
    role: 'user',
  })

  return users
}
