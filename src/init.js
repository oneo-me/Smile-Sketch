// 配置
var configs = {
    // 保存时排序
    saveAutoSorting: false,
    // 列数
    number: 10,
    // 间距
    space: 80,
    // 默认输出目录
    out: "out",
    // 忽略标记 && 符号标记
    // 如果符号名称是这个，则不重置名称
    flag: "@",
    // 导入标记
    // 矩形：导入图片文件
    // 图片：导入图片文件
    // 文本：导入文本文件
    flagI: "@ ",
    // 导出标记
    flagE: "@E ",
    // 位置大小设置
    fixedR: "@R ",
    // 位置设置
    fixedP: "@P ",
    // 大小设置
    fixedS: "@S ",
    // 动作标记
    action: "@A "
}

// 插件
var LS = {
    init: function (context) {
        // 获取当前选择的图层
        function getSelects(document) {
            var items = []
            document.currentPage().children().forEach(layer => {
                if (layer.isSelected()) {
                    items.push(layer)
                }
            })
            return items
        }
        // 初始化环境变量
        LS.pluginRoot = context.scriptPath.stringByDeletingLastPathComponent().stringByDeletingLastPathComponent().stringByDeletingLastPathComponent()
        LS.resourcesRoot = LS.pluginRoot + "/Contents/Resources"
        LS.document = context.document || context.actionContext.document
        LS.documentRoot = LS.document.fileURL().path().stringByDeletingLastPathComponent()
        LS.pages = LS.document.pages()
        LS.page = LS.document.currentPage()
        LS.selects = getSelects(LS.document)
    }
}