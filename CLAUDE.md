# CLAUDE.md

> 给 Claude Code (claude.ai/code) 在本仓库工作时阅读的开发规范与项目说明。请优先遵守本文件中的约定。

---

## 1. 项目概述

**Balance Monitor** 是一个基于 **Electron + React + TypeScript** 的桌面应用,用于定时轮询第三方 API 获取余额/积分数据,解析响应后通过系统托盘通知与 UI 仪表盘展示。当前版本 `v1.1.2`。

主要使用场景:

- 监控多个 API 端点的余额/积分变化
- 通过定时任务自动刷新并触发系统通知
- 通过加密的本地配置存储 + 自动备份保留多套监控方案

---

## 2. 技术栈与版本(必须对齐)

| 类别 | 选型 | 版本 | 说明 |
| --- | --- | --- | --- |
| 桌面框架 | Electron | 39.2.6 | 三进程架构 |
| UI 框架 | React | 19.2.1 | 函数组件 + Hooks |
| 类型系统 | TypeScript | 5.9.3 | `strict` 模式(继承自 `@electron-toolkit/tsconfig`) |
| 构建工具 | electron-vite | 5.0.0 | 主 / 预加载 / 渲染三段构建 |
| 渲染构建 | Vite | 7.2.6 | 配合 `@vitejs/plugin-react` |
| 样式 | TailwindCSS | 4.1.18 | 通过 `@tailwindcss/vite` 插件 |
| 状态管理 | Zustand | 5.0.9 | 仅在渲染进程使用 |
| 通知 | Sonner | 2.0.7 | Toast 通知(`toast.success/error/warning`) |
| 工具库 | @electron-toolkit/{preload,utils} | 3.0.2 / 4.0.0 | 主 / 预加载集成 |
| ID 生成 | uuid | 13.0.0 | `crypto.randomUUID()` 优先 |
| 包管理器 | **pnpm** | - | 通过 `pnpm-lock.yaml` 锁定,**不要改用 npm/yarn** |
| 打包分发 | electron-builder | 26.0.12 | `electron-builder.yml` 配置 |

---

## 3. 包管理器与脚本约定(强制)

**强制使用 pnpm**。`package.json` 中的脚本保留 `npm run` 字面写法(pnpm 会透明转发),但本地/CI 安装与运行命令必须用 pnpm:

```bash
# 装依赖
pnpm install

# 装新依赖(主进程 / 预加载可用)
pnpm add <pkg>
# 装开发依赖
pnpm add -D <pkg>

# 开发 / 构建 / 检查
pnpm dev                # electron-vite dev (HMR)
pnpm start              # electron-vite preview (本地预览打包产物)
pnpm build              # 先 typecheck 再 electron-vite build
pnpm typecheck          # 同时检查 node + web
pnpm typecheck:node     # 主进程 / 预加载
pnpm typecheck:web      # 渲染进程
pnpm lint               # ESLint (--cache)
pnpm format             # Prettier --write .
```

> **禁止**:
> - 不要提交 `package-lock.json` 或 `yarn.lock`;只保留 `pnpm-lock.yaml`。
> - 不要用 `pnpm build:win` / `pnpm build:linux` 在 macOS 上交叉构建未经测试;只跑 `pnpm build:mac`。

---

## 4. 三进程架构与目录规范

```
src/
├── main/                 # 主进程 (Node.js) — tsconfig.node.json
│   ├── index.ts          # 入口:窗口、IPC、生命周期
│   ├── tray-manager.ts   # 系统托盘
│   ├── config-manager.ts # 加密配置 + 自动备份
│   ├── monitor-scheduler.ts # 定时调度
│   ├── api-engine.ts     # HTTP 客户端
│   ├── balance-parser.ts # 响应解析(XPath / JSONPath)
│   └── logger.ts         # 日志(滚动 + IPC 暴露)
├── preload/              # 预加载脚本 — tsconfig.web.json (类型) / tsconfig.node.json (实现)
│   ├── index.ts          # contextBridge 暴露 API
│   └── index.d.ts        # window.electron / window.api 类型
├── shared/               # 主/预加载/渲染复用的纯类型与工具(约定目录)
└── renderer/             # 渲染进程 — tsconfig.web.json
    ├── index.html
    └── src/
        ├── main.tsx      # createRoot 入口
        ├── App.tsx       # 顶层路由
        ├── env.d.ts
        ├── assets/       # 静态资源
        ├── components/   # 展示型组件
        ├── hooks/        # 自定义 Hook(useElectronAPI / useBalanceMonitor / useConfigManager)
        ├── store/        # Zustand store
        ├── services/     # 渲染端服务层
        ├── config/       # 渲染端常量配置
        ├── types/        # 渲染端类型
        └── utils/        # 工具函数
```

**模块职责清晰,不跨层引用**:
- `src/main/**` 禁止 `import` 任何来自 `src/renderer/**` 的代码。
- `src/renderer/src/**` 通过 `window.electron.*` 与主进程通信,不得直接 `require('electron')`。
- 跨进程共享的类型放 `src/shared/`,通过路径别名 `@shared/*` 引用。

---

## 5. 路径别名(强制)

`tsconfig.web.json` + `electron.vite.config.ts` 已配置:

```ts
'@renderer/*' → 'src/renderer/src/*'   // 渲染端内部
'@shared/*'   → 'src/shared/*'         // 三进程共享
```

- 渲染端内部 import 一律走 `@renderer/...`,避免 `../../..` 长链。
- 新建 `src/shared/*` 后必须在两个 `tsconfig` 的 `include` 中已覆盖(默认已包含)。

---

## 6. 代码风格

### 6.1 Prettier(强制)

`.prettierrc.yaml`:

```yaml
singleQuote: true       # 单引号
semi: false             # 行末不加分号
printWidth: 100         # 100 字符折行
trailingComma: none     # 不带尾随逗号
```

`.prettierignore`: `out`、`dist`、`pnpm-lock.yaml`、`tsconfig*.json` 等自动产物不参与格式化。

### 6.2 ESLint(强制)

`eslint.config.mjs` 启用了 `@electron-toolkit/eslint-config-ts` + React + Prettier 兼容,关键放宽项:

- `@typescript-eslint/no-explicit-any`: **off**(允许 any,但仅在确实无更精确类型时使用,新代码应优先 `unknown` + 收窄)
- `@typescript-eslint/explicit-function-return-type`: off(允许类型推断)
- `react-hooks/set-state-in-effect`: off
- `react/no-unescaped-entities`: off

提交前 `pnpm lint` 必须无错。

### 6.3 EditorConfig

- UTF-8 / LF / 2 空格缩进 / 文件末尾保留换行 / 去掉行尾空白

### 6.4 命名约定

| 类型 | 规则 | 示例 |
| --- | --- | --- |
| 文件 (组件) | PascalCase.tsx | `ConfigManager.tsx` |
| 文件 (Hook) | camelCase,use 前缀 | `useConfigManager.ts` |
| 文件 (工具) | camelCase | `balance-parser.ts`(允许 kebab-case 短横线) |
| 组件 | PascalCase | `function StatusPanel()` |
| Hook | use 前缀 | `useBalanceMonitor()` |
| Zustand store | useXxxStore | `useConfigStore` |
| 类型 / 接口 | PascalCase | `BalanceMonitorConfig` |
| 常量 | UPPER_SNAKE | `MAX_LOG_LINES` |
| IPC channel | kebab-case 字符串 | `'save-config'` |

### 6.5 注释与文案

- 源码注释、commit message、CHANGELOG **统一使用中文**。
- 公开导出的函数 / class 必须有中文 JSDoc 风格注释说明用途。
- 关键业务分支(尤其 IPC 处理器、调度器、托盘事件)必须有行内中文注释解释意图。

### 6.6 React 组件约定

- 仅函数组件 + Hooks,**禁止 class 组件**。
- 文件默认 `function` 声明 + `export default`,仅在被多处引用时才用具名 export。
- 不要在 `useEffect` 内同步 setState 触发级联(本项目已关闭此规则,但要自觉避免)。
- 渲染层状态用 **Zustand**(`store/`),不引入 Redux / Context 全局 Provider(局部 Context 仍可)。
- 样式统一用 **Tailwind utility class**;不引入 CSS-in-JS。

### 6.7 TypeScript 约定

- 避免 `any`;新代码应 `unknown` + 类型守卫或定义精确类型。
- IPC handler 参数在 preload 一侧显式声明类型,不依赖 `any` 透传。
- 共享类型放 `src/shared/types/`(或 `src/shared/index.ts`),三端统一 import。

---

## 7. IPC 通信规范

### 7.1 Channel 命名

- 全部 kebab-case 字符串字面量;**主进程与 preload 必须共用同一字面量**。
- 命名采用动词短语: `save-config` / `load-config` / `test-api-connection`。

### 7.2 主进程 → 渲染(事件)

| 事件 | 含义 |
| --- | --- |
| `balance-update` | 新的余额数据 |
| `status-change` | 监控状态变更 |
| `app-ready` | 主进程初始化完成 |
| `navigate-to-config` | 托盘菜单触发的导航请求 |

`preload/index.ts` 中的事件包装函数必须返回反注册函数,组件 `useEffect` 清理时调用,避免内存泄漏。

### 7.3 渲染 → 主进程(Invoke)

- 全部走 `ipcMain.handle` / `ipcRenderer.invoke`。
- 不在主进程返回原始错误堆栈,统一用 `logger.error()` 记录后抛 `Error('友好描述')`。
- 所有 handler 包 `try/catch`,失败也要 resolve 一个布尔值或 null,不要 reject。

### 7.4 安全设置(`src/main/index.ts` 中已启用)

- `contextIsolation: true`、`nodeIntegration: false`、`sandbox: false`(为兼容 preload 引入 ESM)
- `webviewTag: false`、插件关闭、`safeDialogs: true`
- 任何外部链接走 `shell.openExternal`,**禁止** `setWindowOpenHandler` 直接打开。

---

## 8. 配置存储与加密

- 配置目录:`~/.balance-monitor/`(macOS/Linux) / `%USERPROFILE%\.balance-monitor\`(Windows)
- 加密文件:`configs.enc.json`(所有配置)
- 活动配置:`active.json`
- 自动备份:`backups/`(由 `ConfigManager` 自动维护)
- 修改 `ConfigManager` 时,务必保留向后兼容(旧版本用户首次升级不应丢配置)。

---

## 9. 日志规范

- 使用 `Logger.getInstance(scope)` 或 `new Logger(scope)`;**scope 必填**(如 `'Main'`、`'Scheduler'`)。
- 5 个等级: `debug` / `info` / `success` / `warn` / `error`。
- 关键操作(保存/删除配置、启停监控、解析失败、网络错误)必须打 `info` 级别。
- 错误必须打印原始 `error` 对象(包括 message 和 stack)以便排查。
- 日志经 `get-logs` IPC 暴露给渲染层,默认返回最近 100 条。

---

## 10. 构建与发布

### 10.1 本地构建

```bash
pnpm build             # typecheck + electron-vite build
pnpm build:unpack      # 仅打包出不安装的目录(用于冒烟测试)
pnpm build:win         # Windows NSIS 安装包(需在 Windows 或 wine 环境)
pnpm build:mac         # macOS .dmg(需在 macOS 环境)
pnpm build:linux       # AppImage / snap / deb
```

### 10.2 electron-builder 关键配置

- `appId`: `com.radishon.balance-monitor`
- `productName`: `Balance Monitor`
- `directories.buildResources`: `build/`(注意:不是 `resources/`)
- 图标源:`resources/icon.{ico,icns,png}`(代码内通过 `?asset` 引入)
- `asarUnpack`: `resources/**`(确保图标文件不被打进 asar)
- 自动更新 URL: `https://radishon.com/auto-updates`(发布时需同步上传 latest.yml / latest-mac.yml)

### 10.3 发布前自检清单

- [ ] `pnpm typecheck` 通过
- [ ] `pnpm lint` 通过
- [ ] `pnpm format` 已执行
- [ ] `pnpm build:unpack` 在本机冒烟启动无白屏
- [ ] 更新 `package.json` 的 `version`
- [ ] 新增 `doc/changelog/release-notes-v{version}.md`
- [ ] 追加 `doc/changelog/CHANGELOG.md`
- [ ] 提交遵循 §12 提交规范

---

## 11. Git 工作流

- **默认分支**: `master`
- 主分支(PR base): `master`
- 分支命名:`feat/<scope>-<short-desc>` / `fix/<scope>-<short-desc>` / `chore/<scope>`
- 提交粒度:一次提交只做一件事;同一 feature 的多次提交 rebase 后再合入。
- 推 PR 前**必须** `pnpm typecheck && pnpm lint`,CI 同样会跑这两个。

---

## 12. 提交信息规范(强制)

遵循 Conventional Commits,使用中文描述:

```
类型(范围): 简短描述

详细描述(可选,中文)

- 变更点 1
- 变更点 2

关联Issue: #123
```

**类型:**

| 类型 | 用途 |
| --- | --- |
| `feat` | 新功能 |
| `fix` | 错误修复 |
| `docs` | 文档(CLAUDE.md / README / doc/**) |
| `style` | 纯格式(不影响功能) |
| `refactor` | 重构(既非 feat 也非 fix) |
| `perf` | 性能优化 |
| `test` | 测试相关 |
| `chore` | 构建 / 工具 / 依赖更新 |
| `revert` | 回滚 |

**范围示例:** `main`、`preload`、`renderer`、`tray`、`scheduler`、`config`、`parser`、`deps`、`docs`、`ci`。

**示例:**

```
feat(scheduler): 支持为单个配置单独启停监控

- 新增 startConfigMonitor / stopConfigMonitor IPC
- 托盘菜单增加按配置启停入口

关联Issue: #42
```

---

## 13. 版本与 Changelog 规范

### 13.1 SemVer

- **MAJOR**:不兼容的 API / 配置格式变更
- **MINOR**:向下兼容的功能新增
- **PATCH**:向下兼容的 bug 修复

### 13.2 文件

- **单次发布说明**:`doc/changelog/release-notes-v{version}.md`
- **总目录**:`doc/changelog/CHANGELOG.md`(每次发布向顶端追加)

### 13.3 内容分类

- **功能新增 (Features)**
- **问题修复 (Bug Fixes)**
- **代码质量 (Code Quality)**(重构 / 格式化 / 类型 / 文档)
- **依赖更新 (Dependencies)**

模板参考 `doc/changelog/release-notes-v1.1.2.md`。

### 13.4 发布流程

1. 累计一组 `feat` / `fix` 提交于 `master`
2. 升级 `package.json` 的 `version`
3. 新建 `doc/changelog/release-notes-v{version}.md`,参考既有模板
4. 在 `doc/changelog/CHANGELOG.md` 顶部追加新版本链接
5. 本地 `pnpm build:unpack` 冒烟
6. 打 tag:`git tag v{version}` 并推送
7. 运行 `pnpm build:mac/win/linux` 上传安装包到更新服务器

> 可选自动化:`standard-version` 或 `conventional-changelog` 简化 1~3 步。

---

## 14. Claude Code 协作约定

- **不得**直接修改 `out/`、`dist/`、`node_modules/`、`pnpm-lock.yaml` 之外不要手改。
- 修改公共模块(`config-manager`、`monitor-scheduler`、`tray-manager`、`balance-parser`、`api-engine`、`logger`)时,优先 `Read` 整个文件再动手,保持现有中文注释风格。
- 改动后必须跑 `pnpm typecheck` 与 `pnpm lint`;若涉及 IPC schema,需同时检查 `src/preload/index.d.ts`。
- 调试 / 排查问题时优先使用应用内日志(`get-logs` IPC),不要在源码中残留 `console.log`。
- 不要在提交中夹带 `.omc/`、`.claude/`、`.playwright-mcp/`、`.DS_Store`(已在 `.gitignore`)。
- 涉及主进程窗口 / 托盘 / 调度逻辑的改动,必须确认 `app.whenReady → initializeServices → setupIPCHandlers → createWindow` 启动顺序未被打乱。
- 输出代码时,**注释使用中文**,匹配既有仓库风格;不要大段重写或"优化"未被要求改动的代码。

---

## 15. 关键依赖备忘

- `@electron-toolkit/utils`:`electronApp.setAppUserModelId`、`optimizer.watchWindowShortcuts`、`is.dev`
- `@electron-toolkit/preload`:`electronAPI`(提供 `ipcRenderer` 封装)
- `zustand`:渲染端 store;`create<State>()((set, get) => ({ ... }))`
- `sonner`:`toast.success / error / warning`,**不要**用 `alert` 或 `window.confirm`
- `uuid`:`crypto.randomUUID()` 优先,需要 v4 时再 `import { v4 as uuidv4 } from 'uuid'`

---

## 16. 故障排查速查

| 现象 | 优先检查 |
| --- | --- |
| 托盘不显示 | `tray-manager.ts` 中 `getTray()` 返回值;`Tray` 构造前是否已 `app.whenReady` |
| IPC 调用无响应 | preload 是否在 `contextBridge.exposeInMainWorld`;`ipcMain.handle` 是否注册 |
| HMR 失效 | `electron-vite` 版本;`@electron-toolkit/utils` 的 `is.dev` 判定 |
| 构建后空白页 | `webPreferences.preload` 路径;`out/main/index.js` 与 `out/preload/index.js` 相对位置 |
| 配置文件损坏 | `~/.balance-monitor/backups/` 恢复;`configs.enc.json` 是否被外部改写 |
| macOS Dock 图标未更新 | `app.dock.setIcon(nativeImage.createFromPath(iconMac))` 是否在 `whenReady` 内调用 |
