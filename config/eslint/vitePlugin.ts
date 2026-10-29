import { ESLint } from 'eslint'
import type { ConfigEnv, Plugin } from 'vite'

const checkESLint = async (files: string[]) => {
  const eslint = new ESLint({ warnIgnored: false })
  const results = await eslint.lintFiles(files)
  const formatter = await eslint.loadFormatter('stylish')

  return {
    message: await formatter.format(results),
    hasErrors: results.some((result) => result.errorCount > 0),
  }
}

/**
 * 创建开发和构建共用的 ESLint 检查插件。
 * @param command Vite 当前执行的 serve 或 build 命令。
 */
export const createESLintPlugin = (command: ConfigEnv['command']): Plugin => ({
  name: 'eslint-check',
  enforce: 'pre',
  async transform(_code, id) {
    if (
      command !== 'serve' ||
      id.includes('/node_modules/') ||
      !/\.(?:[cm]?[jt]sx?|vue)$/.test(id)
    ) {
      return
    }

    // 模块加载失败会触发 Vite 的浏览器错误浮层。
    const { message, hasErrors } = await checkESLint([id])
    if (hasErrors) this.error(message)
  },
  async buildStart() {
    if (command !== 'build') return

    const { message, hasErrors } = await checkESLint(['.'])
    if (hasErrors) this.error(message)
    if (message) this.warn(message)
  },
  async configureServer(server) {
    const reportESLint = async (files: string[]) => {
      const { message, hasErrors } = await checkESLint(files)
      if (hasErrors) server.config.logger.error(message)
      else if (message) server.config.logger.warn(message)
      else server.config.logger.info('[ESLint] 检查通过')
    }

    await reportESLint(['.'])
    server.watcher.on('all', (event, file) => {
      if (!['add', 'change'].includes(event) || !/\.(?:[cm]?[jt]sx?|vue)$/.test(file)) {
        return
      }

      reportESLint([file]).catch((error: unknown) => {
        const reason = error instanceof Error ? error.message : String(error)
        server.config.logger.error(`[ESLint] 检查文件 ${file} 失败：${reason}`)
      })
    })
  },
})
