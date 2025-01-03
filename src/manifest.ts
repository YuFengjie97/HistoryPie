import { isDev, r, port } from "../scripts/utils";
import fs from 'fs-extra'
import type PkgType from '../package.json'

export async function getMainfest() {
  const pkg = await fs.readJSON(r('package.json')) as typeof PkgType

  const manifest = {
    manifest_version: 3,
    name: "__MSG_app_name__",
    version: pkg.version,
    description: "__MSG_app_description__",
    action: {
      default_icon: 'assets/icon-pie.png',
      // default_popup: "dist/popup/index.html"
    },
    icons: {
      16: "assets/icon-pie.png",
      32: "assets/icon-pie.png",
      48: "assets/icon-pie.png",
      128: "assets/icon-pie.png"
    },
    // content_scripts: [
    //   {
    //     js: ["dist/content/index.global.js"],
    //     matches: [
    //       "<all_urls>"
    //     ]
    //   }
    // ],
    background: {
      service_worker: "dist/background/index.mjs",
    },
    permissions: ["tabs", "storage", "activeTab", "scripting"],
    web_accessible_resources: [
      {
        resources: ["dist/chart/index.html"],
        matches: ["<all_urls>"]
      }
    ],
    default_locale: "en",
    content_security_policy: {
      extension_pages: isDev
      ? `script-src \'self\' http://localhost:${port}; object-src \'self\'`
      : 'script-src \'self\'; object-src \'self\'',
    }
  }

  return manifest
}