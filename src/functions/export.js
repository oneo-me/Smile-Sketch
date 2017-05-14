LS.export = function () {
    // 获取导出路径
    function getPath(outPathRoot, layer) {
        var path = layer.name().replace(configs.flagE, "")
        if (path.indexOf("/") != 0) {
            path = outPathRoot + "/" + path
        }
        return path
    }
    // 导出文本
    function exportMSTextLayer(outPathRoot, layer) {
        var path = getPath(outPathRoot, layer)
        mkdirs(NSString.stringWithString(path).stringByDeletingLastPathComponent())
        layer.stringValue().writeToFile_atomically_encoding_error(path, true, NSUTF8StringEncoding, null)
    }
    // 导出画板或符号
    function exportMSArtboardGroupOfMSSymbolMaster(outPathRoot, layer) {
        var path = getPath(outPathRoot, layer)
        var slice = MSExportRequest.new()
        slice.rect = layer.absoluteRect().rect()
        slice.scale = 1
        slice.setFormat(extName(layer.name()))
        slice.saveForWeb = true
        LS.document.saveArtboardOrSlice_toFile(slice, path)
    }
    // 导出切片
    function exportMSSliceLayer(outPathRoot, layer, format) {
        var path = ""
        var currentRoot = layer.name().stringByDeletingLastPathComponent()
        var currentFilename = layer.name().replace(currentRoot, "")
        if (format.namingScheme() == 1 && format.name() != null) {
            path = currentRoot + format.name() + currentFilename + "." + format.fileFormat()
        } else if (format.namingScheme() == 0 && format.name() != null) {
            path = currentRoot + currentFilename + format.name() + "." + format.fileFormat()
        } else {
            path = layer.name() + "." + format.fileFormat()
        }
        if (path.indexOf("/") != 0) {
            path = outPathRoot + "/" + path
        }
        var slice = MSExportRequest.new()
        slice.rect = layer.absoluteRect().rect()
        slice.scale = format.scale()
        slice.setFormat(format.fileFormat())
        slice.saveForWeb = true
        // 添加背景
        if (layer.hasBackgroundColor() && layer.exportOptions().layerOptions() == 0) {
            slice.backgroundColor = layer.backgroundColorGeneric()
        }
        // 导出当前组
        if (layer.exportOptions().layerOptions() == 2) {
            slice.configureForLayer(MSImmutableLayerAncestry.ancestryWithMSLayer(layer))
        }
        // 裁切导出
        slice.shouldTrim = layer.exportOptionsGeneric().shouldTrim()
        LS.document.saveArtboardOrSlice_toFile(slice, path)
    }
    // 查找需要导出的图层
    LS.pages.forEach(page => {
        LS.document.setCurrentPage(page)

        var outPathRoot = ""

        // 获取当前页面的输出路径
        var index = page.name().indexOf(" (")
        if (index != -1) {
            var ss = page.name().slice(index + 2, page.name().indexOf(")")).split(" ")
            if (ss.length == 1 || ss.length == 3) {
                outPathRoot = ss[0]
            }
            if (outPathRoot == "") {
                outPathRoot = LS.documentRoot
            }
        }
        else if (outPathRoot == "") {
            outPathRoot = configs.out
        }
        if (outPathRoot.indexOf("/") != 0) {
            outPathRoot = LS.documentRoot + "/" + outPathRoot
        }

        // 查找要导出的图层
        page.children().forEach(layer => {
            var className = String(layer.className())
            if (layer.name().indexOf(configs.flagE) == 0) {
                switch (className) {
                    case "MSTextLayer":
                        exportMSTextLayer(outPathRoot, layer)
                        break
                    case "MSArtboardGroup":
                    case "MSSymbolMaster":
                        exportMSArtboardGroupOfMSSymbolMaster(outPathRoot, layer)
                        break
                }
            } else if (className == "MSSliceLayer") {
                layer.exportOptionsGeneric().exportFormats().forEach(format => {
                    exportMSSliceLayer(outPathRoot, layer, format)
                })
            }
        })
        LS.document.setCurrentPage(LS.page)
    })
}