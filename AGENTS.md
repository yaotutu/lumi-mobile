# Repository Guidelines

## Project Structure & Module Organization
Source routes live under `app/` using Expo Router; each folder maps to a screen and may include `(group)` segments for layout control. Shared UI sits in `components/ui/`, while feature-scoped widgets stay inside `components/pages/`. Global state, services, and utility logic live in `stores/`, `services/`, and `utils/` respectively, with API clients configured through `services/api-client.ts`. Keep theme assets in `constants/` and cross-platform styles in `styles/`. Platform builds are tracked by `ios/` and `android/`, and tests plus diagnostics scripts sit in `__tests__/`.

## Build, Test, and Development Commands
Run `npm start` (Expo) for the Metro server, or `npm run ios` / `npm run android` to launch native simulators. Use `npm run web` for browser previews. Lint locally with `npm run lint`, auto-fix via `npm run lint:fix`, and format markdown/JSON with `npm run format`. Reset a broken workspace with `npm run reset-project`, which re-applies the Expo template files.

## Coding Style & Naming Conventions
We code in strict TypeScript with ES2023 modules. Favor functional, file-scoped components and keep layout props declarative. Follow the established folder-based namespaces—e.g., `components/ui/Button.tsx` and `services/auth/login.ts`. Use camelCase for variables/functions, PascalCase for components and Zustand stores, and kebab-case for file names unless Expo Router requires `PascalCase`. Formatting is enforced by Prettier (`prettier.config`) and lint rules come from `eslint.config.js` extending `eslint-config-expo`. Indentation is 2 spaces to match the current codebase.

## Testing Guidelines
Smoke and integration checks live in `__tests__/*`. Mirror the `auth.test.ts` style: export granular helpers and a `runAllTests` orchestrator. Execute tests via `npx ts-node __tests__/auth.test.ts` (install `ts-node` if it is missing) and capture console output in the pull request. Add new files with the `*.test.ts` suffix and mock async stores through Zustand's `useXXXStore.getState()`. Until automated CI is added, aim for manual coverage of critical flows—auth, routing, and token persistence.

## Commit & Pull Request Guidelines
Commits follow the short, imperative convention visible in `git log` (e.g., `Add model detail overlay with slide animation`). Keep subjects under 72 characters and use additional commits for grouped changes instead of long descriptions. For PRs, include purpose summary, screenshots or recordings for UI updates, reproduction steps, and references to tracked issues. Confirm that linting passes, Expo starts cleanly, and relevant tests have been executed (`npx ts-node __tests__/auth.test.ts`). Tag reviewers who own the affected folder (services, UI, routing) to speed up review.



<!--以下内容为用户自行填写，禁止修改-->
# 参考
/Users/yaotutu/Desktop/code/tope-lumi/lumi-server	 这是我们的服务端代码
/Users/yaotutu/Desktop/code/tope-lumi/lumi-web-next 这是我们的web页面代码

# 重要提示
- 禁止私自运行项目，如需要运行项目，让用户自行运行
- 始终用中文回答我的问题
