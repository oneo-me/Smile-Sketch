@import "utils/path.js"

function ImportPage(context, document, page) {
    // 没有图层则退出
    if (page.layers().count() <= 0) {
        return
    }

    // 导入文本
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

    // 导入图片
    function importImageToShape(layer, file) {
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
                fill.setPatternFillType(2)
                fill.setImage(loadImageData(file))
            }
            else {
                fill.setPatternFillType(1)
                fill.setImage(loadImageData(Path.GetContent(context, "Resources/error.png")))
            }
        } else {
            fill.setPatternFillType(1)
            fill.setImage(loadImageData(Path.GetContent(context, "Resources/error.png")))
        }
    }

    // 导入图片
    function importImageToBitmap(layer, file) {
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

    // 加载图片
    function loadImageData(file) {
        return MSImageData.alloc().initWithImage_convertColorSpace(NSImage.alloc().initWithContentsOfFile(file), false)
    }

    // 设置图片
    function setImageLayerData(layer, file) {
        document.actionsController().actionForID("MSReplaceImageAction").applyImage_tolayer(NSImage.alloc().initWithContentsOfFile(file), layer)
    }

    // 查找需要导入的内容
    page.children().forEach(layer => {
        if (layer.name().indexOf("import ") == 0) {
            var file = Path.GetPath(document, layer.name().replace("import ", ""))
            switch (String(layer.className())) {
                case "MSTextLayer":
                    importText(layer, file)
                    break
                case "MSShapeGroup":
                    importImageToShape(layer, file)
                    break
                case "MSBitmapLayer":
                    importImageToBitmap(layer, file)
                    break
            }
        }
    })
}

function Import(context) {
    var document = context.document || context.actionContext.document
    document.pages().forEach(page => {
        ImportPage(context, document, page)
    })
}