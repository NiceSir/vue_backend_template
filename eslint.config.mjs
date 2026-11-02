import js from '@eslint/js';
import { withVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import prettier from 'eslint-config-prettier/flat';
import vue from 'eslint-plugin-vue';
import globals from 'globals';

export default withVueTs(
    {
        // ESLint 10 使用此处的全局忽略配置，不读取 .eslintignore。
        ignores: ['**/node_modules/**', '**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
    },
    js.configs.recommended,
    // @vue/standard 当前仅支持 ESLint 9，使用兼容的基础规则和 TypeScript 规则。
    vue.configs['flat/essential'],
    vueTsConfigs.recommended,
    {
        files: ['src/**/*.{js,ts,vue}'],
        languageOptions: {
            globals: globals.browser,
        },
    },
    {
        files: ['*.config.{js,mjs,ts}'],
        languageOptions: {
            globals: globals.node,
        },
    },
    prettier,
    {
        rules: {
            // 不限制生成器函数 function* 中星号前后的空格。
            'generator-star-spacing': 'off',
            // 仅在 ESLint 运行环境为 production 时禁止 debugger，其他环境允许使用。
            'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
            // Vue 模板解析错误报错，但忽略无效结束标签；不影响 Vue 编译器的检查。
            'vue/no-parsing-error': ['error', { 'x-invalid-end-tag': false }],
            // 关闭 ESLint 的未声明变量检查；TypeScript 自身的类型检查不受影响。
            'no-undef': 'off',
            // 不强制变量和属性使用驼峰命名。
            camelcase: 'off',
            // 禁止位运算，但允许按位取反 ~ 和按位或 |。
            'no-bitwise': ['error', { allow: ['~', '|'] }],
            // 未使用变量报错；最后一个已使用参数之前的未使用位置参数不报错，其后仍检查。
            '@typescript-eslint/no-unused-vars': ['error', { args: 'after-used' }],
            // 多余分号报错；放在 Prettier 兼容配置之后，避免此检查被关闭。
            'no-extra-semi': 'error',
            // 对象属性冒号前不允许空格，冒号后保留一个空格。
            'key-spacing': ['error', { beforeColon: false, afterColon: true }],
            // 不检查语句结尾是否有分号；执行 Prettier 时仍遵循其 semi 配置。
            semi: 'off',
            // 不检查函数参数左括号前是否有空格。
            'space-before-function-paren': 'off',
            // 不检查数组、对象等末尾是否有尾逗号。
            'comma-dangle': 'off',
            // 允许 Index、Login 等单个单词的 Vue 组件名。
            'vue/multi-word-component-names': 'off',
        },
    }
);
