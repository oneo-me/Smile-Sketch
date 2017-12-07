@import "utils/sketch.js"
@import "utils/configs.js"
@import "import.js"

function sortPage(context, document, page) {

    // 没有图层，不需要整理
    if (page.layers().count() <= 0) {
        return
    }

    // 获取配置
    var canRestoreSymbol = Configs.Get("canRestoreSymbol", true) == true
    var maxColumn = PageConfigs.Get(context, page, "column", 10)
    var space = PageConfigs.Get(context, page, "space", 50)
    var groupSpace = PageConfigs.Get(context, page, "groupSpace", 300)

    // 修复位置
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

    // 还原符号名称
    if (canRestoreSymbol) {
        page.children().forEach(layer => {
            if (layer.className() == "MSSymbolInstance" && layer.name().indexOf("@ ") != 0) {
                layer.name = layer.symbolMaster().name()
            }
        })
    }

    // 图层列表排序
    page.layers().sort((b, a) => {
        // 普通图层在上边
        if (!IsArtboard(a) && IsArtboard(b)) {
            return -1
        } else if (IsArtboard(a) && !IsArtboard(b)) {
            return 1
        } else if (IsArtboard(a) && IsArtboard(b)) {
            // 普通画板在上边
            if (a.name().indexOf("/") == -1 && b.name().indexOf("/") > -1) {
                return -1
            } else if (a.name().indexOf("/") > -1 && b.name().indexOf("/") == -1) {
                return 1
            }
            // 名字一样大的在前边
            if (String(a.name()) == String(b.name())) {
                return a.frame().width() * a.frame().height() <= b.frame().width() * b.frame().height()
            }
            // 普通画板排序
            return a.name().localeCompare(b.name())
        }
        return 0
    })
    if (MSApplicationMetadata.metadata().appVersion < 48) {
        document.refreshAfterArtboardDeletion()
    }

    // 画板排序
    var group = ""
    var startTop = 0
    var top = 0
    var left = 0
    var height = 0
    var column = 0

    // 获取开始位置
    for (var i = page.layers().count() - 1; i >= 0; i--) {
        var layer = page.layers()[i]
        if (!IsArtboard(layer)) {
            var th = layer.absoluteRect().rulerY() + layer.frame().height()
            if (th > startTop) {
                startTop = th
            }
        } else {
            break
        }
    }
    if (startTop > 0) {
        startTop += groupSpace
    }

    // 开始排序
    for (var i = page.layers().count() - 1; i >= 0; i--) {
        var layer = page.layers()[i]
        var layerName = String(layer.name())
        if (IsArtboard(layer)) {
            // 换组
            var layerGroup = layerName.split("/").slice(0, -1).join("/")
            if (layerGroup == "") {
                layerGroup = "defaultGroup - oneo.me"
            }
            if (layerGroup != group) {
                column = 0
                top += height + groupSpace
                left = 0
                height = 0
            }
            if (group == "") {
                top = startTop
            }
            group = layerGroup

            // 设置位置
            layer.absoluteRect().setRulerX(left)
            layer.absoluteRect().setRulerY(top)
            height = layer.frame().height() > height ? layer.frame().height() : height

            // 设置下一个的参数
            if (column + 1 == maxColumn) {
                column = 0
                left = 0
                top += height + space
                height = 0
            } else {
                column++
                left += layer.frame().width() + space
            }
        }
    }
}

function Sort(context, onSaved) {
    var document = context.document || context.actionContext.document
    var currentPage = document.currentPage()

    if (Configs.Get("canSortPage", false) == true) {
        document.pages().sort((a, b) => a.name().localeCompare(b.name()))
        // 刷新页面列表显示
        document.setCurrentPage(document.pages()[document.pages().count() - 1])
        document.addBlankPage()
        document.removePage(document.pages()[document.pages().count() - 1])
        document.setCurrentPage(currentPage)
    }

    if (onSaved) {
        if (Configs.Get("canAutoImport", false) == false) {
            importPage(context, document, currentPage)
        }
        sortPage(context, document, currentPage)
    } else {
        document.pages().forEach(page => {
            importPage(context, document, page)
            sortPage(context, document, page)
        })
    }
}