LS.correct = function () {
    LS.pages.forEach(page => {
        page.children().forEach(layer => {
            // 设置位置与大小
            if (layer.name().indexOf(configs.fixedR) == 0) {
                var args = layer.name().replace(configs.fixedR, "").split(" ")
                layer.absoluteRect().setRulerX(Number(args[0]))
                layer.absoluteRect().setRulerY(Number(args[1]))
                layer.frame().setWidth(Number(args[2]))
                layer.frame().setHeight(Number(args[3]))
            }
            // 设置位置
            if (layer.name().indexOf(configs.fixedP) == 0) {
                var args = layer.name().replace(configs.fixedP, "").split(" ")
                layer.absoluteRect().setRulerX(Number(args[0]))
                layer.absoluteRect().setRulerY(Number(args[1]))
            }
            // 设置大小
            if (layer.name().indexOf(configs.fixedS) == 0) {
                var args = layer.name().replace(configs.fixedS, "").split(" ")
                layer.frame().setWidth(Number(args[0]))
                layer.frame().setHeight(Number(args[1]))
            }
            // 还原符号图层名称
            if (layer.className() == "MSSymbolInstance" && layer.name().indexOf(configs.flag) != 0) {
                layer.name = layer.symbolMaster().name()
            }
        })

        // 修复错误的位置
        var maxOffset = [0, 0]
        page.layers().forEach(layer => {
            if (!isArtboard(layer) && layer.name().indexOf(configs.flag) != 0) {
                if (maxOffset[0] > layer.absoluteRect().rulerX()) {
                    maxOffset[0] = layer.absoluteRect().rulerX()
                }
                if (maxOffset[1] > layer.absoluteRect().rulerY()) {
                    maxOffset[1] = layer.absoluteRect().rulerY()
                }
            }
        })
        page.layers().forEach(layer => {
            if (!isArtboard(layer) && layer.name().indexOf(configs.flag) != 0) {
                layer.absoluteRect().setRulerX(layer.absoluteRect().rulerX() - maxOffset[0])
                layer.absoluteRect().setRulerY(layer.absoluteRect().rulerY() - maxOffset[1])
            }
        })
    })
}