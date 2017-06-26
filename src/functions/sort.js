SS.PageSort = function () {
    // 页面列表排序
    SS.Pages.sort((a, b) => a.name().localeCompare(b.name()))
    SS.Doc.setCurrentPage(SS.Pages[SS.Pages.count() - 1])
    SS.Doc.addBlankPage()
    SS.Doc.removePage(SS.Pages[SS.Pages.count() - 1])
    SS.Doc.setCurrentPage(SS.Page)
}

SS.Sort = function () {

    var configs = SS.Configs(SS.Page)

    if (SS.Page.layers().length <= 0) {
        return
    }
    // 图层列表排序
    SS.Page.layers().sort((b, a) => {
        if (!IsArtboard(a) && IsArtboard(b)) {
            return -1
        }
        if (IsArtboard(a) && IsArtboard(b)) {
            if (String(a.name()) == String(b.name())) {
                return a.frame().width() * a.frame().height() > b.frame().width() * b.frame().height() ? -1 : 1
            }
            else {
                return a.name().localeCompare(b.name())
            }
        }
        return 0
    })

    // 重新建立选择内容，以强制 Sketch 刷新视图
    var selects = SS.Selects()
    if (selects.length > 0) {
        selects[0].select_byExpandingSelection(false, true)
        selects[0].select_byExpandingSelection(true, true)
    }
    else {
        SS.Page.layers()[0].select_byExpandingSelection(true, true)
        SS.Page.layers()[0].select_byExpandingSelection(false, true)
    }

    // 图层排序
    var items = []
    var startTop = 0
    // 获取排序参数
    var args = {
        column: configs.SortColumn,
        space: configs.SortSpace
    }
    var index = SS.Page.name().indexOf(" (")
    if (index != -1) {
        var ss = SS.Page.name().slice(index + 2, SS.Page.name().indexOf(")")).split(" ")
        if (ss.length == 2) {
            args.column = Number(ss[0])
            args.space = Number(ss[1])
        }
        else if (ss.length == 3) {
            args.column = Number(ss[1])
            args.space = Number(ss[2])
        }
    }
    // 获取当前页面参数
    for (var m = SS.Page.layers().count(); m > 0; m--) {
        var layer = SS.Page.layers()[m - 1]
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
        }
        else {
            // 获取开始位置
            var th = layer.absoluteRect().rulerY() + layer.frame().height()
            if (th > startTop) {
                startTop = th
            }
        }
    }
    // 开始排序
    for (var i = 0; i < items.length; i++) {
        var startLeft = 0
        var maxHeight = 0
        for (var n = 0; n < items[i].items.length; n++) {
            var layer = items[i].items[n]
            // 设置当前位置
            layer.absoluteRect().setRulerX(startLeft)
            layer.absoluteRect().setRulerY(startTop + args.space)
            // 设置下一个的位置
            startLeft += layer.frame().width() + args.space
            if (maxHeight < layer.frame().height()) {
                maxHeight = layer.frame().height()
            }
            // 排序换行
            if ((n + 1) % args.column == 0) {
                startLeft = 0
                startTop += maxHeight + args.space
                maxHeight = 0
            }
            // 排序换组
            if (n == items[i].items.length - 1) {
                startLeft = 0
                startTop += maxHeight + args.space * 2
                maxHeight = 0
            }
        }
    }
}