# TypeScript 类型检查指南

## 问题说明

在开发过程中发现，命令行的 `tsc --noEmit` 检查和 VS Code IDE 的 TypeScript 检查存在不一致的情况。

### 原因分析

1. **IDE 实时检查更严格**：VS Code 的 TypeScript 语言服务会实时检查所有打开的文件，包括一些边缘情况
2. **命令行检查范围**：`tsc --noEmit` 会检查整个项目，但某些错误可能被配置忽略
3. **配置差异**：IDE 可能使用了工作区特定的 TypeScript 配置

### 典型案例

**问题**：`colorScheme` 类型为 `'light' | 'dark' | null | undefined`，但 `Colors` 对象只接受 `'light' | 'dark'`

```typescript
// ❌ 错误：IDE 会报错，但命令行可能不报错
const color = Colors[colorScheme].background;

// ✅ 正确：使用空值合并运算符提供默认值
const color = Colors[colorScheme ?? 'light'].background;
```

## 解决方案

### 1. 使用统一的检查命令

项目已添加以下 npm scripts：

```bash
# 只运行 TypeScript 类型检查
npm run type-check

# 同时运行类型检查和 ESLint
npm run check
```

### 2. 提交前检查清单

在提交代码前，请确保运行以下命令：

```bash
# 1. TypeScript 类型检查
npm run type-check

# 2. ESLint 检查
npm run lint

# 3. 代码格式化
npm run format

# 或者一次性运行类型检查和 ESLint
npm run check
```

### 3. 配置 Git Hooks（推荐）

可以使用 `husky` 和 `lint-staged` 在提交前自动运行检查：

```bash
# 安装依赖
npm install --save-dev husky lint-staged

# 初始化 husky
npx husky init

# 配置 pre-commit hook
echo "npx lint-staged" > .husky/pre-commit
```

在 `package.json` 中添加：

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "tsc --noEmit",
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

## 常见类型错误及修复

### 1. 索引类型可能为 null/undefined

**错误**：`类型"null"不能作为索引类型使用`

**修复**：使用空值合并运算符

```typescript
// ❌ 错误
const value = obj[key];

// ✅ 正确
const value = obj[key ?? 'default'];
```

### 2. 可选链和空值合并

**错误**：`对象可能为"未定义"`

**修复**：使用可选链和空值合并

```typescript
// ❌ 错误
const name = user.profile.name;

// ✅ 正确
const name = user?.profile?.name ?? 'Unknown';
```

### 3. 数组方法返回值可能为 undefined

**错误**：`类型"undefined"不能赋值给类型"T"`

**修复**：检查返回值或提供默认值

```typescript
// ❌ 错误
const item = array.find(x => x.id === id);
item.name; // item 可能为 undefined

// ✅ 正确
const item = array.find(x => x.id === id);
if (item) {
  item.name;
}

// 或者使用空值合并
const name = array.find(x => x.id === id)?.name ?? 'Unknown';
```

## TypeScript 配置说明

项目的 `tsconfig.json` 配置：

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,  // 启用所有严格类型检查选项
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

`strict: true` 包含以下选项：
- `strictNullChecks`: 严格的 null 检查
- `strictFunctionTypes`: 严格的函数类型检查
- `strictBindCallApply`: 严格的 bind/call/apply 检查
- `strictPropertyInitialization`: 严格的属性初始化检查
- `noImplicitAny`: 禁止隐式 any 类型
- `noImplicitThis`: 禁止隐式 this 类型

## 最佳实践

1. **始终使用 TypeScript 的严格模式**：`"strict": true`
2. **定期运行类型检查**：不要只依赖 IDE 的实时检查
3. **修复所有类型错误**：不要使用 `@ts-ignore` 或 `any` 来绕过类型检查
4. **使用类型守卫**：在运行时检查类型，确保类型安全
5. **提供默认值**：对于可能为 null/undefined 的值，使用 `??` 提供默认值

## 参考资源

- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [TypeScript 严格模式](https://www.typescriptlang.org/tsconfig#strict)
- [Expo TypeScript 配置](https://docs.expo.dev/guides/typescript/)
