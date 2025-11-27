# Stylish

English | [简体中文](README.zh-CN.md)

Stylish is a Chrome extension for managing custom website styles. Write CSS for any site, preview the changes instantly, and organize per-domain or per-path rules in the side panel so every page looks exactly the way you want.

## Demo Video

<video src="https://github.com/user-attachments/assets/88101c66-ce5d-4d59-9e63-3aed749c3ddb" controls></video>

## Chrome Extension Installation & Usage

- Chrome Web Store: <https://chromewebstore.google.com/detail/stylish-custom-css-for-an/ilakagpbhjngamjimodcmhndgjjlhien>
- Click **Add to Chrome**, then open the extension icon to launch the side panel.
- On any page, press the **+** button in the panel to create a rule, edit the CSS, and use the toggle to enable or disable it.
- Rules are grouped into **Current page** and **Other pages** for quick discovery and management.

## Core Features

- **Site-aware rule list**: Rules are grouped by the active tab URL so you always know which styles apply to the page in view.
- **Visual element picker**: Launch the picker, hover to highlight elements, and click to pick CSS selectors.
- **Live preview**: Temporary rules are injected while editing, letting you see the final result before saving.
- **Switch & sort friendly**: Enable, disable, edit, and delete each rule with states persisted via `chrome.storage.local`.
- **Non-intrusive injection**: Content scripts dynamically create `<style>` tags for matching URLs without mutating the original DOM.

## Getting Started

### Requirements

- Node.js ≥ 18
- `pnpm` recommended (replace commands if using `npm` or `yarn`)
- Chrome 116+ (Manifest V3 side panel support)

### Install Dependencies

```bash
pnpm install
```

### Local Development

1. Start the dev build:

   ```bash
   pnpm dev
   ```

2. Open `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, and select the `dist/` folder in the project root.
3. Click the extension icon to open the side panel (the action and panel are bound automatically on first install).
4. The dev server watches files; after saving, refresh the panel or page to see the latest changes.

### Build for Release

```bash
pnpm build
```

After building:

- Production assets land in `dist/` and can be loaded directly via **Load unpacked**.
- A `release/crx-stylish-<version>.zip` archive is generated for uploading to the Chrome Web Store.

## Usage Guide

1. Visit any webpage and open the side panel.
2. Click the bottom-right **+** button to add a rule:
   - `URL` supports the `*` wildcard and defaults to the current tab.
   - Use the selector button to start the element picker; press `Esc` to exit.
   - Write styles in the `CSS Style` textarea; rules are injected automatically for preview.
3. After saving, rules persist and apply immediately. Use toggles to control activation at any time.
4. Rules are separated by **Current page** and **Other pages** columns for faster targeting.

## Project Structure

| Path                 | Description                                                            |
| -------------------- | ---------------------------------------------------------------------- |
| `manifest.config.ts` | Generates the Manifest V3 config using CRXJS.                          |
| `src/sidepanel/`     | Side panel app built with React + TanStack Form.                       |
| `src/components/`    | Shared UI and domain components (rule list, creation dialog, etc.).    |
| `src/content/`       | Content scripts that inject styles, watch routing, and run the picker. |
| `src/background/`    | Service worker that ties the action to the side panel after install.   |
| `src/lib/`           | Helpers for URL matching, messaging, and CSS selector utilities.       |
| `release/`           | Auto-generated zip bundles after builds.                               |

## Technical Highlights

- **React 19 + TypeScript + Vite 7**: Modern stack paired with `@crxjs/vite-plugin` for HMR and manifest generation.
- **Radix UI + custom components**: Consistent buttons, forms, and dialogs.
- **TanStack React Form + Zod**: Manage rule-form state with immediate validation feedback.
- **chrome.storage + custom hooks**: `useListLocalStorage` wraps the MV3 storage API as React state and syncs across instances.
- **Messaging layer**: `chrome.tabs.sendMessage` and `chrome.runtime.sendMessage` keep the panel, content scripts, and background worker coordinated, auto-injecting missing scripts when needed.
- **Route listening**: Content scripts hook `history.pushState / replaceState` and `popstate` to re-render rules after SPA navigation.

## Available Scripts

| Command        | Purpose                                                                   |
| -------------- | ------------------------------------------------------------------------- |
| `pnpm dev`     | Start Vite in dev mode and watch the CRX build.                           |
| `pnpm build`   | Run TypeScript checks, build the production bundle, and create zip files. |
| `pnpm preview` | Preview the built static assets for validation.                           |

You're now ready to debug, customize, and ship your own Stylish extension. For advanced needs (rule syncing, cloud backups, etc.), extend the existing storage and messaging modules.
