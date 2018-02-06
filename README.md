一键下载所有依赖的类型声明文件（`@types/*`）！使用`tyty`，优雅地和`typescript`相处。

```
npm i tyty -g
```

# 如何使用
在项目路径输入 `tyty`，将自动根据 package.json 为你的项目依赖下载typescript类型依赖（@types/*）。

如果当前路径下没有 package.json，则会自动前往上一级目录寻找，不断重复。

```
  Usage: tyty [options]

  Options:

    -V, --version   output the version number
    -s, --save      (default) add type declaration as a dependency
    -d, --save-dev  add type declaration as a dev-dependency
    -h, --help      output usage information
```

# 如何贡献
- 翻译这篇文档
- 向朋友们、同事们推荐这个工具
- 任何问题、bug、建议，欢迎提出issus
- 欢迎 fork 及 pull request

# todo-list
- 如果类型声明已经存在，则跳过下载
- 添加 yarn 选项（可以选择使用 yarn 下载类型依赖）
- 添加 cnpm 选项（可以选择使用 cnpm 下载类型依赖）