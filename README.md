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

### Compile and Hot-Reload for Development

```sh
pnpm dev
```

开发服务启动时执行 ESLint 全项目检查；保存或新增 JavaScript、TypeScript、Vue 文件时，
重新检查对应文件，错误显示在运行服务的终端中。无需编辑器 ESLint 扩展，不自动修复代码。
加载到的源码存在 ESLint 错误时，浏览器显示 Vite 错误浮层；终端保留检查日志，不自动清屏。

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
确保 `no-extra-semi` 不被关闭。ESLint 关闭分号风格检查不会改变 Prettier 添加分号的行为。

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
