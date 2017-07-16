function IsArtboard(layer) {
    return layer.className() == "MSSymbolMaster" || layer.className() == "MSArtboardGroup"
}