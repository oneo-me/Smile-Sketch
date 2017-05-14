LS.sorting = function () {
    // 页面列表排序
    LS.pages.sort((a, b) => a.name().localeCompare(b.name()))
    LS.document.setCurrentPage(LS.pages[LS.pages.count() - 1])
    LS.document.addBlankPage()
    LS.document.removePage(LS.pages[LS.pages.count() - 1])
    LS.document.setCurrentPage(LS.page)

    // 图层列表排序
    LS.pages.forEach(page => {
        page.layers().sort((b, a) => {
            if (!isArtboard(a) && isArtboard(b)) {
                return -1
            }
            if (isArtboard(a) && isArtboard(b)) {
                if (String(a.name()) == String(b.name())) {
                    return a.frame().width() * a.frame().height() > b.frame().width() * b.frame().height() ? -1 : 1
                }
                else {
                    return a.name().localeCompare(b.name())
                }
            }
            return 0
        })
    })
    if (LS.selects.length > 0) {
        LS.selects[0].select_byExpandingSelection(false, true)
        LS.selects[0].select_byExpandingSelection(true, true)
    }
    else {
        LS.page.layers()[0].select_byExpandingSelection(true, true)
        LS.page.layers()[0].select_byExpandingSelection(false, true)
    }

    // 图层排序
    LS.pages.forEach(page => {
        var items = []
        var startTop = 0
        // 获取排序参数
        var args = {
            number: configs.number,
            space: configs.space
        }
        var index = page.name().indexOf(" (")
        if (index != -1) {
            var ss = page.name().slice(index + 2, page.name().indexOf(")")).split(" ")
            if (ss.length == 2) {
                args.number = Number(ss[0])
                args.space = Number(ss[1])
            }
            else if (ss.length == 3) {
                args.number = Number(ss[1])
                args.space = Number(ss[2])
            }
        }
        // 获取当前页面参数
        for (var m = page.layers().count(); m > 0; m--) {
            var layer = page.layers()[m - 1]
            if (isArtboard(layer)) {
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
                if ((n + 1) % args.number == 0) {
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
    })
}