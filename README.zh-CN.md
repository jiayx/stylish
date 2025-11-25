# Stylish

[English](README.md) | 简体中文

Stylish 是一款用于网页样式管理的 Chrome 扩展，支持在 Chrome 中为任意网站编写自定义 CSS，实时预览效果，并按域名或路径创建规则。在侧边面板中可统一管理所有站点样式，让网页外观完全按个人偏好呈现。

## Chrome 扩展安装与使用

- Chrome 应用商店地址：<https://chromewebstore.google.com/detail/stylish-custom-css-for-an/ilakagpbhjngamjimodcmhndgjjlhien>
- 点击「添加至 Chrome」完成安装后，点击扩展图标即可打开侧边面板。
- 在任意网页的侧边面板中点击 **+** 按钮创建规则，编辑完成后保存并通过开关控制启用状态。
- 规则自动按照当前页面与其他页面分组，方便快速定位和管理。

## 核心特性

- **站点感知的规则列表**：自动按当前 tab 的 URL 将规则分组，随时知道哪些样式作用于正在浏览的页面。
- **可视化元素选择**：一键调用取色器，鼠标悬停即可高亮元素并生成唯一 CSS Selector。
- **实时预览**：编辑 CSS 时会向当前页面注入临时规则，确保保存前看到最终样子。
- **开关 / 排序友好**：每条规则都支持启用、禁用、编辑、删除操作，状态与变更都存储在 `chrome.storage.local` 中。
- **无侵入式注入**：内容脚本会在匹配 URL 时动态创建 `<style>` 标签，不会修改页面原始 DOM。

## 快速开始

### 环境要求

- Node.js ≥ 18
- 推荐使用 `pnpm`（也可以使用 `npm` 或 `yarn`，命令需自行替换）
- Chrome 116+（支持 Manifest V3 side panel）

### 安装依赖

```bash
pnpm install
```

### 本地开发

1. 启动开发构建：

   ```bash
   pnpm dev
   ```

2. 在 Chrome 打开 `chrome://extensions`，开启「开发者模式」，点击「加载已解压的扩展程序」，选择项目根目录下的 `dist/`。
3. 点击扩展图标即可打开侧边面板（首次安装会自动将 action 和 side panel 关联）。
4. 开发模式会保持监听，保存代码后刷新侧边面板或页面即可看到最新效果。

### 打包发布

```bash
pnpm build
```

构建完成后：

- 生产版文件输出到 `dist/`，可直接用于「加载已解压的扩展程序」。
- 生成 `release/crx-stylish-<version>.zip`，便于上传到 Chrome Web Store。

## 使用指南

1. 浏览任意网页并打开扩展的侧边面板。
2. 点击右下角的 **+** 按钮创建规则：
   - `URL` 支持通配符 `*`，默认填入当前 Tab 地址。
   - 点击选择器按钮启动元素拾取器；按 `Esc` 可退出。
   - 在 `CSS Style` 文本框内书写样式，会自动注入预览。
3. 保存后，规则会被持久化并立刻生效；可随时通过开关控制是否启用。
4. 规则按照「当前页面」与「其他页面」分栏展示，方便快速定位。

## 项目结构

| 路径                 | 说明                                                         |
| -------------------- | ------------------------------------------------------------ |
| `manifest.config.ts` | 使用 CRXJS 生成 Manifest V3 配置。                           |
| `src/sidepanel/`     | 侧边面板应用，基于 React + TanStack Form 构建。              |
| `src/components/`    | 通用 UI 组件与业务组件（规则列表、创建弹窗等）。             |
| `src/content/`       | 内容脚本，负责注入样式、监听路由变化与元素拾取。             |
| `src/background/`    | Service worker，处理安装后 action 与 side panel 的绑定逻辑。 |
| `src/lib/`           | URL 匹配、消息通信、CSS Selector 计算等辅助函数。            |
| `release/`           | 构建后自动生成的 zip 包。                                    |

## 技术要点

- **React 19 + TypeScript + Vite 7**：提供现代化前端开发体验，配合 `@crxjs/vite-plugin` 实现 HMR 与 Manifest 生成。
- **Radix UI + 自定义 UI 组件**：实现一致的表单、按钮、对话框交互。
- **TanStack React Form + Zod**：管理规则表单状态、实时校验。
- **chrome.storage + 自定义 Hooks**：`useListLocalStorage` 将 MV3 storage API 封装成 React 状态，并同步多实例的更新。
- **消息通信**：通过 `chrome.tabs.sendMessage` 与 `chrome.runtime.sendMessage` 让侧边面板、内容脚本、background 三方协同，自动注入缺失的 content script。
- **路由监听**：内容脚本会劫持 `history.pushState / replaceState` 与 `popstate` 事件，确保 SPA 路由切换后也能重新渲染规则。

## 可用脚本

| 命令           | 作用                                                |
| -------------- | --------------------------------------------------- |
| `pnpm dev`     | 启动 Vite 开发模式并监听 CRX 构建。                 |
| `pnpm build`   | 先执行 TypeScript 检查，再生成生产版扩展及 zip 包。 |
| `pnpm preview` | 预览构建后的静态文件，方便验证。                    |

至此，你即可在本地调试、定制和发布自己的 Stylish 扩展。如果需要进一步的功能（如规则同步、云备份等），可以在现有存储和通信模块基础上继续扩展。\*\*\*
