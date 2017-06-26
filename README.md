# Smile Sketch

文档快速整理排序，资源导入与导出

**主要功能**

- 页面列表排序
- 图层列表排序
- 画板排序
    - 这里会自动还原 Symbols 的名称
- 导入资源
    - 导入文本到 Text 图层
    - 导入图片到 Image & Shape 图层
- 导出资源
    - 导出切片
        - 特性：会自动压缩 jpg & png & svg(需要全局安装 [Svgo](https://github.com/svg/svgo)) 图片
    - 导出文本

**使用说明**

导入内容到 Sketch

- 图层命名为 `import 路径`
- 可以导入图片或文本
- 可以在 Image Shape Text 三种图层上使用导入

快速导出内容

- Text 图层可以命名为 `export 路径`，以导出 Text 内容
- 自动导出其他所有切片到相应目录并压缩（默认导出目录为 Sketch 文件所在目录，可以通过修改页面名称来更改导出目录）

页面排序

- 依照名称排序

画板排序

- 可以通过修改页面名称来改变参数

**页面名称 - 程序参数主要存放位置**

名称 | 导出路径, 画板列数, 画板间距, 是否自动保存

名称：可以随便写  
导出路径：以/开头为绝对路径，否则为相对路径，默认：文档目录  
画板列数：数字，默认：5  
画板间距：数字，默认：50  
是否自动保存：布尔，默认：true，可选：false  



**更新说明**

1.1.0
- 清理了一些无用的功能
- 保存文件时排序当前页面画板
- 导出可以正确的导出所有切片了
- 导出附加压缩图片功能（无损）
    - 附加一个压缩程序在插件内部（主要处理 jpg png, svg 需要全局安装 [Svgo](https://github.com/svg/svgo)）
- 插件编译器
    - 重构

1.0.0
- 发布