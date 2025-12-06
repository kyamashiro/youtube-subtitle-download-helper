import { defineManifest } from "@crxjs/vite-plugin";
import pkg from "./package.json";

export default defineManifest({
  manifest_version: 3,
  name: "Youtube Subtitle Download Helper",
  version: pkg.version,
  description:
    "This extension allows you to download  captions data from Youtube. You can download captions data in multiple file formats.",
  permissions: ["downloads", "activeTab", "storage"],
  icons: {
    48: "public/icon.png",
  },
  action: {
    default_icon: {
      48: "public/icon.png",
    },
    default_popup: "src/features/popup/index.html",
  },
  options_page: "src/features/options/index.html",
  content_scripts: [
    {
      js: ["src/features/content/main.ts"],
      matches: ["https://*.youtube.com/*"],
    },
  ],
  background: {
    service_worker: "src/features/background/index.ts",
    type: "module",
  },
});
