#!/bin/bash

# TypeScript 类型检查脚本
# 确保与 IDE 的检查规则一致

echo "🔍 开始 TypeScript 类型检查..."
echo ""

# 运行 TypeScript 编译器检查
# 使用项目的 tsconfig.json 配置
# 过滤掉第三方库的错误
npx tsc --noEmit --project tsconfig.json 2>&1 | \
  grep -v "ios/Pods" | \
  grep -v "android/" | \
  grep -v "node_modules" | \
  grep "error TS"

# 获取错误数量
ERROR_COUNT=$(npx tsc --noEmit --project tsconfig.json 2>&1 | \
  grep -v "ios/Pods" | \
  grep -v "android/" | \
  grep -v "node_modules" | \
  grep "error TS" | \
  wc -l | \
  tr -d ' ')

echo ""
if [ "$ERROR_COUNT" -eq 0 ]; then
  echo "✅ TypeScript 类型检查通过！"
  exit 0
else
  echo "❌ 发现 $ERROR_COUNT 个 TypeScript 错误"
  exit 1
fi
