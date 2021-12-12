export function RestoreSymbolName(actionContext) {
    var document = actionContext.document
    document.pages().forEach(page => {
        page.children().forEach(layer => {
            if (layer.className() == "MSSymbolInstance") {
                layer.name = layer.symbolMaster().name()
            }
        })
    })
}
