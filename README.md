# vue_backend

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
pnpm install
```

Vue 系列依赖通过 `pnpm-workspace.yaml` 固定为 `3.6.0-rc.13`，避免添加依赖时因浮动 `rc`
标签顺带升级框架版本。

### Compile and Hot-Reload for Development

```sh
pnpm dev
```

开发服务默认启用 `--host`，局域网设备可通过启动日志中的 Network 地址访问。

开发服务启动时执行 ESLint 全项目检查；保存或新增 JavaScript、TypeScript、Vue 文件时，
重新检查对应文件，错误显示在运行服务的终端中。无需编辑器 ESLint 扩展，不自动修复代码。
加载到的源码存在 ESLint 错误时，浏览器显示 Vite 错误浮层；终端保留检查日志，不自动清屏。

### 用户 Mock 接口

通过 Vite 开发服务提供真实 HTTP 模拟接口，Axios 和 fetch 均可调用，无需浏览器扩展。
Mock.js 和类型声明仅作为开发依赖；接口只在 `pnpm dev` 中启用，构建产物和 preview 不提供这些接口。

| 请求 | 用途 |
| --- | --- |
| `GET /api/mock/users` | 返回两个随机用户及一个固定测试用户：`data.list`、`data.total` |
| `POST /api/mock/login` | JSON 请求体为 `{ username, password }`，仅返回 `data.token` |
| `GET /api/mock/me` | 使用 `Authorization: Bearer <token>` 查询当前管理账号资料及菜单 |

统一返回 `{ code, message, data }`，成功时 `code` 为 `0`，失败时使用对应的 HTTP 状态码。
固定测试账号为 `18888888888`，密码为 `12345678`，角色为 `user`。
另外两个随机账号可通过用户列表获取，密码仍为 `Mock@123456`，角色分别为 `admin` 和 `user`。
用户包含 `id`、`username`、`nickname`、`email`、`role`；
用户列表保持上述账号字段；`/me` 返回 `admin_id`、`authority_area`、`avatar`、`created_at`、
`deleted_at`、`department`、`email`、`is_super`、`name`、`op_per_user`、`op_user`、`phone`、
`updated_at` 和 `menu`。`admin_id` 为数字，`is_super` 为数字 `0` 或 `1`，`deleted_at` 允许为空；
时间格式为 `yyyy-MM-dd HH:mm:ss`。`menu` 为 `MenuInfo[]`，随 `/me` 一起返回，不单独请求菜单接口。
目前所有 Mock 账号均返回现有 `/home` 页的首页菜单，字段为 `path`、`path_id`、`pid`、`title`、
`children`；首页菜单的 `children` 为 `null`，其类型沿用现有 `MenuInfo | null`。
`fetchUserInfo()` 将完整响应保存到 `userInfo`，可通过 `userStore.userInfo?.menu` 读取菜单。
响应不包含密码。用户、资料与 token 保存在开发服务内存中，同一次运行中保持稳定，
重启后重置模拟数据和会话；固定测试账号仍可使用。
这是前端联调用的模拟登录，不代表真实鉴权实现。登录页面校验通过后获取 token，
再请求 `/me` 填充用户资料，两步完成后跳转 `/home`；任一步失败均清空本地会话。

```ts
import { request } from '@/axios';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const { data: usersResult } = await request.get('/users');
await userStore.login({
  username: usersResult.data.list[0].username,
  password: 'Mock@123456',
});
const { data: currentUserResult } = await request.get('/me');
console.log(currentUserResult.data);
```

数据生成位于 `mock/users.ts`，接口处理和会话状态位于 `config/mock/vitePlugin.ts`，
`vite.config.ts` 仅负责注册插件。

Mock 登录回归检查（使用项目声明的 Node.js 版本，无需安装额外依赖）：

```sh
node --experimental-strip-types --test config/mock/vitePlugin.test.ts
```

### Axios 请求封装

`src/axios/index.ts` 导出共享实例 `request`，基础路径读取 `import.meta.env.VITE_API_BASE_URL`。
当前 `.env.development` 配置为 `/api/mock`，`.env.production` 配置为 `/`；
业务接口使用 `/login` 等路径，不重复添加基础路径。
保留完整的 `AxiosResponse<T>`，通过 `response.data` 访问接口响应体。
请求拦截器由 `src/main.ts` 在 Pinia 初始化后注册，使用回调调用用户 Store 的 `getToken()`，
避免请求层反向依赖用户 Store。除 `/login`（含查询参数）外，自动设置
`Authorization: Bearer <token>`；每次请求读取最新 token，缺失时移除旧鉴权头，登录请求也移除鉴权头。
因此业务接口无需手动传递 token；默认的 Authorization 由当前会话统一管理。
请求失败继续抛出，由调用方处理。响应解包、业务错误判断和统一提示由你按实际接口约定添加。

业务接口按模块放在 `src/axios/modules/`，登录接口已提取到 `user/index.ts`：

```ts
import { loginUser } from '@/axios/modules/user';

const { data } = await loginUser({ username: '账号', password: '密码' });
console.log(data.data.token);
```

### 用户状态与业务

`src/stores/` 存放 Pinia Store，`user.ts` 提供 `useUserStore()`，
集中维护 `token`、`userInfo`、`isLoggedIn` 和登录流程。应在组件 setup 或 Pinia 初始化后使用：

```ts
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
await userStore.login({ username: '账号', password: '密码' });
console.log(userStore.isLoggedIn, userStore.userInfo);

// 获取时优先读取 Cookie，不存在时回退到内存中的 token，两者都没有时返回 null。
const token = userStore.getToken();
// 设置时统一写入 Cookie 和内存，使用 config.cookieExpires 指定的有效期。
userStore.setToken('接口返回的 token');
```

登录成功仅依赖 HTTP 状态，业务失败由后端返回非 2xx，不额外检查响应体中的 `code`。
获取 token 后保存 Cookie，再调用 `fetchUserInfo()` 加载资料，完成后才视为整个登录流程成功。
任一步失败时删除 token Cookie，清空内存 token 和用户资料，
再将原错误抛给页面。后端 `message` 约定为面向用户的文案，登录页沿用现有提示方式，
保留表单校验、防重复提交和成功跳转，并在 `finally` 中恢复提交状态。
Cookie 有效期读取 `config/index.ts` 的 `cookieExpires`（单位为天，当前为 7），
从登录成功时计算，读取时不续期；该期限不改变服务端 token 的有效期。
Cookie 读写统一使用 `@vueuse/integrations/useCookies`（底层为 `universal-cookie`），
启用 `doNotParse` 保持 token 的字符串类型，不直接解析或拼接 `document.cookie`。
Cookie 限定当前主机，使用 `Path=/`、`SameSite=Lax`，HTTPS 下附加 `Secure`。
初始化时从 Cookie 恢复 token，不读取旧 sessionStorage，切换后需要重新登录一次。
Cookie 仅用于保存 token，接口仍使用 Bearer token，Axios 拦截器由你自行接入。
`isLoggedIn` 仅表示内存中存在 token，不代表服务端已校验有效；
页面内 Cookie 到期后的状态清理和跳转暂不实现，刷新后会重新读取 Cookie。
用户资料仅保存在内存，刷新后暂不自动恢复，可主动调用 `userStore.fetchUserInfo()` 重新获取。
该方法的 Bearer token 由请求拦截器通过 `getToken()` 统一获取和注入，响应拦截器仍由你自行接入。
`logout()` 仍为预留空方法，待业务规则明确后实现。

用户登录态与 Cookie 存储回归检查：

```sh
node --experimental-strip-types --test src/stores/__tests__/user.test.ts
```

请求鉴权回归检查：

```sh
node --experimental-strip-types --test src/axios/__tests__/request.test.ts
```

### Type-Check, Compile and Minify for Production

```sh
pnpm build
```

构建时也会执行 ESLint 全项目检查，存在 error 时中止构建；warning 不阻止构建。
直接执行 `pnpm build-only` 同样会检查。生产构建会启用生产环境的 `debugger` 检查。

### 代码检查与格式化

使用项目声明的 Node.js 版本：`^22.18.0 || >=24.12.0`。

```sh
pnpm lint          # 检查 JavaScript、TypeScript 和 Vue 代码
pnpm lint:fix      # 自动修复支持修复的规则
pnpm type-check    # 检查 TypeScript 和 Vue 模板类型
pnpm format:check  # 检查 src 的格式
pnpm format        # 格式化 src
```

ESLint 配置位于 `eslint.config.mjs`，按原有配置的显式规则适配 ESLint 10。
Vue 使用 `flat/essential`，TypeScript 使用基础推荐配置，组件脚本使用 `lang="ts"`。
`@vue/standard` 当前版本仅声明支持 ESLint 9，因此改用 `@eslint/js` 和 TypeScript
推荐配置作为基础，不完全复刻 Standard 的所有继承规则。

保留原配置的行为：开发环境允许 `debugger`，仅在 `NODE_ENV=production` 时将其视为错误；
关闭 `no-undef`、`camelcase`、生成器星号空格、函数括号前空格、分号风格和尾逗号检查；
多余分号仍报错，模板解析仅豁免 `x-invalid-end-tag`。此豁免不影响 Vue 编译器的检查。
不额外启用 Promise 类型感知规则或 console 限制，类型错误由 `pnpm type-check` 检查。

位运算通过 `no-bitwise` 检查，保留 `~` 和 `|`，其他位运算符报错。
未使用变量由 `@typescript-eslint/no-unused-vars` 检查，避免基础规则对 TypeScript 语法误报；
参数使用 `args: 'after-used'`：最后一个已使用参数之前的未使用位置参数不报错，
其后的未使用参数仍报错。不添加旧 Babel 的 `regeneratorRuntime` 豁免或小程序全局变量。
保留 Vue 列表 `key` 和控制字符正则检查；缩进、换行及模板格式继续交给 Prettier。

```sh
NODE_ENV=production pnpm lint  # 按原配置启用生产环境 debugger 检查
```

`pnpm dev` 和 `pnpm build` 的 ESLint 检查封装在 `config/eslint/vitePlugin.ts`，
由 `vite.config.ts` 引用，复用项目内的 ESLint。

ESLint 10 不读取 `.eslintignore`；需要排除的目录统一配置在 `eslint.config.mjs` 的
`ignores` 中，当前排除依赖目录、`dist`、`dist-ssr` 和 `coverage`。
格式由 `.prettierrc.json` 管理。Prettier 兼容配置之后保留显式规则覆盖，
确保 `no-extra-semi` 和 `key-spacing` 不被关闭。对象属性冒号前禁止空格，冒号后要求一个空格。
ESLint 关闭分号风格检查不会改变 Prettier 添加分号的行为。

如果还希望在编辑器内显示 ESLint 波浪线和“问题”面板提示，可自行选择安装 ESLint 扩展，
并在本地 `.vscode/settings.json` 中设置。终端中的开发、构建检查不依赖此扩展：

```json
{
  "eslint.enable": true,
  "eslint.validate": ["javascript", "typescript", "vue"],
  "eslint.run": "onSave",
  "editor.formatOnSave": false,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[vue]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "never"
  }
}
```

保存时执行 ESLint 检查，不自动修复或格式化。违反已启用错误规则的代码会显示在
编辑器波浪线和“问题”面板中，不会阻止保存；关闭的规则不会报错。
需要主动修复或格式化时，分别执行 `pnpm lint:fix` 或 `pnpm format`。

项目当前忽略 `.vscode/settings.json`，每台设备需自行设置；扩展推荐列表会随仓库共享。
