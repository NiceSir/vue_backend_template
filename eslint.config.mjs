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
            'generator-star-spacing': 'off',
            'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
            'vue/no-parsing-error': ['error', { 'x-invalid-end-tag': false }],
            'no-undef': 'off',
            camelcase: 'off',
            'no-bitwise': ['error', { allow: ['~', '|'] }],
            '@typescript-eslint/no-unused-vars': ['error', { args: 'after-used' }],
            // 放在 Prettier 兼容配置之后，保留原配置的多余分号检查。
            'no-extra-semi': 'error',
            semi: 'off',
            'space-before-function-paren': 'off',
            'comma-dangle': 'off',
        },
    }
);
