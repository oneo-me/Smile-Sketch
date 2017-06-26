SS.Correct = function () {

    var configs = SS.Configs()

    // 还原符号图层名称
    SS.Page.children().forEach(layer => {
        if (layer.className() == "MSSymbolInstance" && layer.name().indexOf(configs.SymbolFlag) != 0) {
            layer.name = layer.symbolMaster().name()
        }
    })

    // 修复错误的位置
    var maxOffset = [0, 0]
    SS.Page.layers().forEach(layer => {
        if (!IsArtboard(layer)) {
            if (maxOffset[0] > layer.absoluteRect().rulerX()) {
                maxOffset[0] = layer.absoluteRect().rulerX()
            }
            if (maxOffset[1] > layer.absoluteRect().rulerY()) {
                maxOffset[1] = layer.absoluteRect().rulerY()
            }
        }
    })
    SS.Page.layers().forEach(layer => {
        if (!IsArtboard(layer)) {
            layer.absoluteRect().setRulerX(layer.absoluteRect().rulerX() - maxOffset[0])
            layer.absoluteRect().setRulerY(layer.absoluteRect().rulerY() - maxOffset[1])
        }
    })
}