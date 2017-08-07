// 保存时排序当前页面
// context.actionContext.document
// 点击时排序全部页面
// context.document

// 排序流程
// 修复错误的位置
// 

@import "utils/sketch.js"
@import "setting.js"
@import "import.js"

function SortPage(context, document, page) {
    // 没有图层则退出
    if (page.layers().count() <= 0) {
        return
    }

    // 获取配置
    var configs = GetConfigs(context, page)

    // 修复错误位置
    {
        var minOffset = [0, 0]
        var maxOffset = [-1, -1]
        page.layers().forEach(layer => {
            if (!IsArtboard(layer)) {
                var x = layer.absoluteRect().rulerX()
                var y = layer.absoluteRect().rulerY()
                // 获取负值
                minOffset[0] = minOffset[0] > x ? x : minOffset[0]
                minOffset[1] = minOffset[1] > y ? y : minOffset[1]
                // 获取最小正值
                maxOffset[0] = maxOffset[0] == -1 ? x : x < maxOffset[0] ? x : maxOffset[0]
                maxOffset[1] = maxOffset[1] == -1 ? y : y < maxOffset[1] ? y : maxOffset[1]
            }
        })
        page.layers().forEach(layer => {
            if (!IsArtboard(layer)) {
                layer.absoluteRect().setRulerX(layer.absoluteRect().rulerX() - minOffset[0] - (minOffset[0] == 0 ? maxOffset[0] : 0))
                layer.absoluteRect().setRulerY(layer.absoluteRect().rulerY() - minOffset[1] - (minOffset[1] == 0 ? maxOffset[1] : 0))
            }
        })
    }

    // 还原符号名称
    {
        if (configs.canRestoreSymbol) {
            page.children().forEach(layer => {
                if (layer.className() == "MSSymbolInstance" && layer.name().indexOf("@ ") != 0) {
                    layer.name = layer.symbolMaster().name()
                }
            })
        }
    }

    // 图层列表排序
    {
        page.layers().sort((b, a) => {
            if (!IsArtboard(a) && IsArtboard(b)) {
                return -1
            }
            if (IsArtboard(a) && IsArtboard(b)) {
                if (String(a.name()) == String(b.name())) {
                    return a.frame().width() * a.frame().height() > b.frame().width() * b.frame().height() ? -1 : 1
                } else {
                    return b.name().localeCompare(a.name())
                }
            }
            return 0
        })
        document.refreshAfterArtboardDeletion()
    }

    // 画板排序
    {
        // 画板列表
        var items = []

        // 开始位置
        var startTop = 0

        // 获取
        for (var m = page.layers().count(); m > 0; m--) {
            var layer = page.layers()[m - 1]
            if (IsArtboard(layer)) {
                // 获取分组
                var itemTitle = layer.name().split("/").slice(0, -1).join("/")
                var isAdd = true
                for (var i = 0; i < items.length; i++) {
                    if (items[i].title == itemTitle) {
                        items[i].items.push(layer)
                        isAdd = false
                        break
                    }
                }
                if (isAdd) {
                    items.push({ title: itemTitle, items: [layer] })
                }
            } else {
                // 获取开始位置
                var th = layer.absoluteRect().rulerY() + layer.frame().height()
                if (th > startTop) {
                    startTop = th
                }
            }
        }

        // 修正开始位置
        if (startTop > 0) {
            startTop += configs.groupSpace
        }

        // 开始排序
        for (var i = 0; i < items.length; i++) {
            var startLeft = 0
            var maxHeight = 0
            for (var n = 0; n < items[i].items.length; n++) {
                var layer = items[i].items[n]
                // 设置当前位置
                layer.absoluteRect().setRulerX(startLeft)
                layer.absoluteRect().setRulerY(startTop + configs.space)
                // 设置下一个的位置
                startLeft += layer.frame().width() + configs.space
                if (maxHeight < layer.frame().height()) {
                    maxHeight = layer.frame().height()
                }
                // 排序换行
                if ((n + 1) % configs.column == 0) {
                    startLeft = 0
                    startTop += maxHeight + configs.space
                    maxHeight = 0
                }
                // 排序换组
                if (n == items[i].items.length - 1) {
                    startLeft = 0
                    startTop += maxHeight + configs.groupSpace
                    maxHeight = 0
                }
            }
        }
    }

    // 刷新导入的资源
    {
        if (configs.canRefreshImport) {
            ImportPage(context, document, page)
        }
    }
}

function Sort(context, onSaved) {
    var document = context.document || context.actionContext.document
    var currentPage = document.currentPage()

    if (onSaved) {
        SortPage(context, document, currentPage)
    } else {
        document.pages().forEach(page => {
            SortPage(context, document, page)
        })
        if (GetConfigs(context).canSortPage) {
            document.pages().sort((a, b) => a.name().localeCompare(b.name()))
            // 刷新页面列表显示
            document.setCurrentPage(document.pages()[document.pages().count() - 1])
            document.addBlankPage()
            document.removePage(document.pages()[document.pages().count() - 1])
            document.setCurrentPage(currentPage)
        }
    }
}