SS.Import = function () {

    var configs = SS.Configs()

    SS.Pages.forEach(page => {
        page.children().forEach(layer => {
            if (layer.name().indexOf(configs.ImportFlag) == 0) {
                switch (String(layer.className())) {
                    case "MSTextLayer":
                        importText(layer)
                        break
                    case "MSShapeGroup":
                        importImageToShape(layer)
                        break
                    case "MSBitmapLayer":
                        importImageToBitmap(layer)
                        break
                }
            }
        })
    })

    function getPath(layer) {
        return Path.Join(SS.DocRoot, layer.name().replace(configs.ImportFlag, ""))
    }

    function importText(layer) {
        var file = getPath(layer)
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

    function importImageToShape(layer) {
        var file = getPath(layer)

        // 设置 Fill
        var fills = layer.style().fills()
        if (fills.count() <= 0) {
            layer.style().addStylePartOfType(0)
        }
        var fill = fills.firstObject()
        fill.setFillType(4)
        fill.setPatternFillType(2)

        // 设置图片
        if (Path.FileExists(file)) {
            if (Path.IsImageExt(file)) {
                fill.setImage(loadImageData(file))
            }
            else {
                fill.setImage(loadImageData(Path.Join(SS.Resources, "error1.png")))
            }
        } else {
            fill.setImage(loadImageData(Path.Join(SS.Resources, "error2.png")))
        }
    }

    function importImageToBitmap(layer) {
        var file = getPath(layer)

        // 图层参数
        var constrainProportions = layer.constrainProportions()
        var size = [layer.frame().width(), layer.frame().height()]
        layer.constrainProportions = 0

        if (Path.FileExists(file)) {
            if (Path.IsImageExt(file)) {
                setImageLayerData(layer, file)
            }
            else {
                setImageLayerData(layer, Path.Join(SS.Resources, "error1.png"))
            }
        } else {
            setImageLayerData(layer, Path.Join(SS.Resources, "error2.png"))
        }

        // 还原图层参数
        layer.frame().setWidth(size[0])
        layer.frame().setHeight(size[1])
        layer.constrainProportions = constrainProportions
    }

    function loadImageData(file) {
        return MSImageData.alloc().initWithImage_convertColorSpace(NSImage.alloc().initWithContentsOfFile(file), false)
    }

    function setImageLayerData(layer, file) {
        SS.Doc.actionsController().actionForID("MSReplaceImageAction").applyImage_tolayer(NSImage.alloc().initWithContentsOfFile(file), layer)
    }
}