export function ImportLayer(actionContext) {
    var document = actionContext.document
    var root = document.fileURL().path().stringByDeletingLastPathComponent()
    document.pages().forEach(page => {

        var pageName = page.name()
        var index = pageName.indexOf(" | ")
        var name = index == -1 ? pageName : pageName.substring(0, index)
        var pagePath = index == -1 ? "" : pageName.substring(index + 3)
        var path = pagePath[0] == "~" ? pagePath : root + (pagePath == "" ? "" : "/" + pagePath)

        page.children().forEach(layer => {
            var layerName = layer.name()
            var index = layerName.indexOf(" | ")
            var name = index == -1 ? layerName : layerName.substring(0, index)
            var args = index == -1 ? "" : layerName.substring(index + 3)
            var commandIndex = args.indexOf(": ")
            if (commandIndex == -1)
                return

            var command = args.substring(0, commandIndex)
            var commandArg = args.substring(commandIndex + 2)

            var file = path + "/" + commandArg

            if (command == "import") {
                if (layer.className() == "MSTextLayer") {
                    ImportText(layer, path, file)
                }
            }
        })
    })
}

function ImportText(layer, name, file) {
    console.log(" - 文本: " + name)
    layer.stringValue = NSString.stringWithContentsOfFile_encoding_error(file, NSUTF8StringEncoding, null)
}

function ImportImage(layer, name, file) {
}
