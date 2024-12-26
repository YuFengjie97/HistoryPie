## package.json
- `包`cross-env 跨平台指定node环境
- `包`npm-run-all 并行(这个报也能顺序运行)运行多条命令(dev:*)
- `命令`dev:background 插件service-worker
- `命令`dev:content 插件页面注入脚本
- `命令`dev:popup 插件的弹出框
- `命令`dev:page 插件内部的跳转页

## vite.config.*.ts
> 浏览器插件是在插件环境下运行,需要打包,而不是热更新,所以开发环境下都是build
- `background` `content`入口为js,`build.lib` 单独配置文件,以构建为库的方式组织代码.
- `popup` `page` 入口为html, `rollupOptions.input`配置多html为入口