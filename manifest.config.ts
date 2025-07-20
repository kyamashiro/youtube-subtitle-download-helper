import { defineManifest } from "@crxjs/vite-plugin";
import pkg from "../crxjs-project/package.json";

export default defineManifest({
  manifest_version: 3,
  name: pkg.name,
  version: pkg.version,
  description:
    "This extension allows you to download  captions data from Youtube. You can download captions data in multiple file formats.",
  permissions: ["downloads"],
  icons: {
    48: "public/logo.png",
  },
  action: {
    default_icon: {
      48: "public/logo.png",
    },
    default_popup: "src/popup/index.html",
  },
  content_scripts: [
    {
      js: ["src/content/main.ts"],
      matches: ["https://*.youtube.com/*"],
    },
  ],
});
