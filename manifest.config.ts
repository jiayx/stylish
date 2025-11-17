import { defineManifest } from "@crxjs/vite-plugin"
import pkg from "./package.json"

export default defineManifest({
  manifest_version: 3,
  name: "Stylish - Custom CSS for Any Website",
  version: pkg.version,
  icons: {
    48: "public/logo.png",
  },
  action: {
    default_icon: {
      48: "public/logo.png",
    },
  },
  permissions: ["sidePanel", "storage", "tabs", "scripting"],
  content_scripts: [
    {
      js: ["src/content/main.ts"],
      matches: ["*://*/*"],
    },
  ],
  host_permissions: ["<all_urls>"],
  side_panel: {
    default_path: "src/sidepanel/index.html",
  },
  background: {
    service_worker: "src/background/main.ts",
    type: "module",
  },
})
