// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  // 禁止使用 console（使用统一的 logger 模块）
  {
    rules: {
      'no-console': 'error', // 禁止所有 console 方法
    },
  },
  // scripts 目录除外（CLI 脚本可以使用 console）
  {
    files: ['scripts/**/*.js', 'scripts/**/*.ts'],
    rules: {
      'no-console': 'off',
    },
  },
]);
