## 命令
- `npm run dev`
  - 开启dev环境,dev的入口命令
- `npm run clear`
  - `rimraf --glob extension/dist`, 删除extension/dist目录.浏览器插件开发中,浏览器加载已解压的扩产程序,即extension目录,之所以在prepare阶段要删除掉dist目录,是因为后面并行运行的 `dev:*` 中的vite.config.*.ts中 `emptyOutDir` 为false,之所以为false,是因为他们是并行运行的. `emptyOutdir` 默认为true,会清空 `outDir` ,并行会引起冲突.之所以要配置多个`vite.config.*.ts` 是因为`background` `content` `html` 的配置方式不同
- `cross-env NODE_ENV=development`, 设置node环境,`cross-env` 是一个跨平台的工具包
- `run-p` `npm-run-all`并行运行多条命令
- `dev:*`
  - `dev:prepare` 删除extesion/dist目录,使用 `chokidar` 来监听html的改变,并在开发环境下根据src中的html来创建对应的html,并修改其在开发环境下静态资源的引用路径
  - `dev:background` 浏览器background(service-worker)部分,只能通过build的方式来生成文件,在vite.config.background.ts中watch会根据是否是开发模式来启动监听来自动打包,这部分与 `dev:content` 中的dev打包逻辑相同
  - `dev:content` 浏览器脚本注入,同样只能通过build的方式来进行dev下的开发
  - `dev:page` vite开发环境,因为是开发环境,所以不会打包html到outDir,所以有了前面prepare中根据src目录的html来手动创建html供浏览器插件环境使用.在这种方式开发时,需要在manifes.json中配置,以保证浏览器插件可以访问本地服务的资源
  ```json
  "content_security_policy": {
    "extension_pages": "script-src 'self' http://localhost:3000; object-src 'self'"
  }
  ```


## vite.config.*.ts
> 浏览器插件是在插件环境下运行,需要打包,而不是热更新,所以开发环境下都是build
- `background` `content`入口为js,`build.lib` 单独配置文件,以构建为库的方式组织代码.
- `popup` `chart` 入口为html, `rollupOptions.input`配置多html为入口

## 碎
- js入口打包build.lib的方式,但是在rollupOptions.ouput.extend为true,这是因为umd/iffe的方式允许模块扩展全局变量,如果为false,会有对全局变量修改的隐患
- background编译为index.mjs  mjs会告诉浏览器我是使用es模块规范的js文件.在明确使用<script type="module"/>时,浏览器对待mjs/js都会将其作为模块使用
- content编译为index.global.js  global只有语义的"全局(content作为页面注入脚本,意为全局)",没有实际作用.