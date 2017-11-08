@import "utils/path.js"

function importText(layer, file) {
    if (Path.FileExists(file)) {
        try {
            layer.stringValue = NSString.stringWithContentsOfFile_encoding_error(file, NSUTF8StringEncoding, null)
        }
        catch (error) {
            layer.stringValue = "文件错误"
        }
    } else {
        layer.stringValue = "文件不存在"
    }
}

// 加载图片
function loadImageData(file) {
    var image = NSImage.alloc().initWithContentsOfFile(file)
    if (MSApplicationMetadata.metadata().appVersion < 47) {
        return MSImageData.alloc().initWithImage_convertColorSpace(image, false)
    } else {
        return MSImageData.alloc().initWithImage(image)
    }
}

// 设置图片
function setImageLayerData(layer, file) {
    document.actionsController().actionForID("MSReplaceImageAction").applyImage_tolayer(NSImage.alloc().initWithContentsOfFile(file), layer)
}

function importImageToShape(context, layer, file) {
    // 设置 Fill
    var fills = layer.style().fills()
    if (fills.count() <= 0) {
        layer.style().addStylePartOfType(0)
    }
    var fill = fills.firstObject()
    fill.setFillType(4)

    // 设置图片
    if (Path.FileExists(file)) {
        if (Path.IsImageExt(file)) {
            fill.setImage(loadImageData(file))
        }
        else {
            fill.setImage(loadImageData(Path.GetContent(context, "Resources/error.png")))
        }
    } else {
        fill.setImage(loadImageData(Path.GetContent(context, "Resources/error.png")))
    }
}

function importImageToBitmap(context, layer, file) {
    // 图层参数
    var constrainProportions = layer.constrainProportions()
    var size = [layer.frame().width(), layer.frame().height()]
    layer.constrainProportions = 0

    if (Path.FileExists(file)) {
        if (Path.IsImageExt(file)) {
            setImageLayerData(layer, file)
        }
        else {
            setImageLayerData(layer, Path.GetContent(context, "Resources/error.png"))
        }
    } else {
        setImageLayerData(layer, Path.GetContent(context, "Resources/error.png"))
    }

    // 还原图层参数
    layer.frame().setWidth(size[0])
    layer.frame().setHeight(size[1])
    layer.constrainProportions = constrainProportions
}

function importLayers(context, document, layers) {
    layers.forEach(layer => {
        if (layer.name().indexOf("import ") == 0) {
            var file = Path.GetPath(document, layer.name().replace("import ", ""))
            switch (String(layer.className())) {
                case "MSTextLayer":
                    importText(layer, file)
                    break
                case "MSShapeGroup":
                    importImageToShape(context, layer, file)
                    break
                case "MSBitmapLayer":
                    importImageToBitmap(context, layer, file)
                    break
            }
        }
    })
}

function importPage(context, document, page) {
    if (page.children().count() > 0) {
        importLayers(context, document, page.children())
    }
}

function Import(context) {
    var document = context.document || context.actionContext.document
    var currentPage = document.currentPage()
    importPage(context, document, currentPage)
}