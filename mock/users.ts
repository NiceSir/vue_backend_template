import Mock from 'mockjs'

import type { UserInfo } from '../src/axios/modules/user/types.ts'

/** Mock 用户列表中的账号数据，不包含登录密码。 */
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

/**
 * 生成管理账号资料及菜单，不包含登录凭据。
 * @param user 对应的 Mock 登录账号。
 * @param adminId 管理账号的唯一数字标识。
 */
export const createMockUserInfo = (user: MockUser, adminId: number): UserInfo => {
  const createdAt = Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')

  return {
    admin_id: adminId,
    authority_area: '',
    avatar: Mock.Random.image('100x100', '#9c7deb', '#fff', 'User'),
    created_at: createdAt,
    deleted_at: null,
    department: '技术',
    email: user.email,
    is_super: user.role === 'admin' ? 1 : 0,
    name: user.nickname,
    op_per_user: user.email,
    op_user: user.email,
    phone: '',
    updated_at: createdAt,
    menu: [
      {
        path: '/home',
        path_id: 1,
        pid: 0,
        title: '首页',
        children: null,
      },
    ],
  }
}
