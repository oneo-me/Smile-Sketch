![](card.png)

> 更加快捷的使用 Sketch 的一些功能

## 功能列表

| 功能                         | 模块         | 说明                                                                   |
| ---------------------------- | ------------ | ---------------------------------------------------------------------- |
| 运行动作<br>Ctrl + Shift + R | 导入文本     | 文本图层命名以 `import: filePath` 结尾，即可导入 `filePath` 的文本内容 |
|                              | 导入图片     | 文本图层命名以 `import: filePath` 结尾，即可导入 `filePath` 的图片内容 |
|                              | 还原符号命名 | 符号组件图层还原为组件库的命名                                         |
| 全部导出<br>Ctrl + Shift + E | 导出文本     | 文本图层命名以 `export: filePath` 结尾，即可导出文本到 `filePath` 路径  |
|                              | 导出图层     | 按照导出选项输出图层                                                   |

## 使用帮助（重要）

### filePath 书写方法

插件通过多个维度确定最终所使用的路径，当前图层所在**文件**、**页面**、**图层命名**、**导出选项**

### 例子

假定一个文件环境，（注意 `~` 表示当前用户目录）

- 文件路径 ~/Desktop/files/test.sketch
- 页面：
  - Page1
  - Page2 | testFolder
  - Page3 | ~/Documents
- 图层：
  - TextLayer1 | import: import.txt
  - Image1 |import: import.png
  - TextLayer2 | export: ~/Desktop/text.txt
  - Layer2

接下来我将逐个介绍，每个图层在不同页面下的导入、导出行为

Layout2 假定有两个导出选项（1x, @2x）

Layout2 这种普通图层、或者切片图层，不支持 | 结尾自定义路径

- Page1
  - TextLayer1 将会导出路径 ~/Desktop/files/import.txt 中的内容到图层文本内容
  - Image1 将会导出路径 ~/Desktop/files/import.png 中的内容到图层
  - TextLayer2 将会导出图层文本内容到路径 ~/Desktop/text.txt
  - Layer2 1x 将会导出图层到路径 ~/Desktop/files/Layer2.png
  - Layer2 2x 将会导出图层到路径 ~/Desktop/files/Layer2@2x.png

- Page2
  - TextLayer1 将会导出路径 ~/Desktop/files/testFolder/import.txt 中的内容到图层文本内容
  - Image1 将会导出路径 ~/Desktop/files/testFolder/import.png 中的内容到图层
  - TextLayer2 将会导出图层文本内容到路径 ~/Desktop/text.txt
  - Layer2 1x 将会导出图层到路径 ~/Desktop/files/testFolder/Layer2.png
  - Layer2 2x 将会导出图层到路径 ~/Desktop/files/testFolder/Layer2@2x.png

- Page3
  - TextLayer1 将会导出路径 ~/Documents/testFolder/import.txt 中的内容到图层文本内容
  - Image1 将会导出路径 ~/Documents/testFolder/import.png 中的内容到图层
  - TextLayer2 将会导出图层文本内容到路径 ~/Desktop/text.txt
  - Layer2 1x 将会导出图层到路径 ~/Documents/testFolder/Layer2.png
  - Layer2 2x 将会导出图层到路径 ~/Documents/testFolder/Layer2@2x.png
