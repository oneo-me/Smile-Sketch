LS.import = function () {
    // 获取绝对路径
    function getPath(layer) {
        var path = layer.name().replace(configs.flagI, "")
        if (path.indexOf("/") != 0) {
            path = LS.documentRoot + "/" + path
        }
        return path
    }
    // 导入文本
    function importMSTextLayer(layer) {
        var path = getPath(layer)
        if (fileExists(path)) {
            try {
                layer.stringValue = NSString.stringWithContentsOfFile_encoding_error(path, NSUTF8StringEncoding, null)
            }
            catch (error) {
                layer.stringValue = "文件错误"
            }
        }
        else {
            layer.stringValue = "文件不存在"
        }
    }
    // 加载图片数据
    function loadImageData(path) {
        return MSImageData.alloc().initWithImage_convertColorSpace(NSImage.alloc().initWithContentsOfFile(path), false)
    }
    // 设置图片数据
    function setImageLayerData(layer, path) {
        LS.document.actionsController().actionForID("MSReplaceImageAction").applyImage_tolayer(NSImage.alloc().initWithContentsOfFile(path), layer)
    }
    // 导入图形
    function importMSShapeGroup(layer) {
        var path = getPath(layer)
        var fills = layer.style().fills()
        if (fills.count() <= 0) {
            layer.style().addStylePartOfType(0)
        }
        var fill = fills.firstObject()
        fill.setFillType(4)
        fill.setPatternFillType(2)
        if (fileExists(path)) {
            if (isImage(path)) {
                fill.setImage(loadImageData(path))
            }
            else {
                fill.setImage(loadImageData(LS.resourcesRoot + "/error1.png"))
            }
        }
        else {
            fill.setImage(loadImageData(LS.resourcesRoot + "/error2.png"))
        }
    }
    // 导入图片
    function importMSBitmapLayer(layer) {
        var path = getPath(layer)
        var constrainProportions = layer.constrainProportions()
        var size = [layer.frame().width(), layer.frame().height()]
        layer.constrainProportions = 0
        if (fileExists(path)) {
            if (isImage(path)) {
                setImageLayerData(layer, path)
            }
            else {
                setImageLayerData(layer, LS.resourcesRoot + "/error1.png")
            }
        }
        else {
            setImageLayerData(layer, LS.resourcesRoot + "/error2.png")
        }
        layer.frame().setWidth(size[0])
        layer.frame().setHeight(size[1])
        layer.constrainProportions = constrainProportions
    }
    // 查找需要导入的图层
    LS.pages.forEach(page => {
        page.children().forEach(layer => {
            if (layer.name().indexOf(configs.flagI) == 0) {
                switch (String(layer.className())) {
                    case "MSTextLayer":
                        importMSTextLayer(layer)
                        break
                    case "MSShapeGroup":
                        importMSShapeGroup(layer)
                        break
                    case "MSBitmapLayer":
                        importMSBitmapLayer(layer)
                        break
                }
            }
        })
    })
}