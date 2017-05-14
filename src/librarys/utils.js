// 是否是画板
function isArtboard(layer) {
    return layer.className() == "MSSymbolMaster" || layer.className() == "MSArtboardGroup"
}