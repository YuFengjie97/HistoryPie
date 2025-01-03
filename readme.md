## HistoryPie
> 一个chrome插件,在你浏览网站时,记录浏览时间,保存到本地

### dev
> 开发模式参考于[vitesse-webext](https://github.com/antfu-collective/vitesse-webext)
```
pnpm run dev
```

### build
```
pnpm run build
```

### pack
```
pnpm run pack:crx
```
```
HistoryPie
├─ crx
│  └─ HistoryPie.crx // chrome插件输出目标
├─ extension
│  ├─ assets // 插件静态资源
│  │  └─ icon-pie.png
│  └─ _locales // 插件本地化
│     ├─ en
│     │  └─ messages.json
│     └─ zh_CN
│        └─ messages.json
├─ scripts
│  ├─ manifest.ts
│  ├─ prepare.ts
│  └─ utils.ts
├─ src
│  ├─ api // 页面与background通信api
│  │  └─ index.ts
│  ├─ background // 插件background
│  │  ├─ index.ts
│  │  └─ utils.ts
│  ├─ chart // 插件跳转页面
│  │  ├─ App.vue
│  │  ├─ index.html
│  │  └─ main.ts
│  ├─ manifest.ts //插件manifest动态生成
│  └─ utils
│     ├─ index.ts
│     └─ locales.ts
├─ vite.config.background.ts
└─ vite.config.ts

```