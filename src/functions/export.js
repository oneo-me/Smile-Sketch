SS.Export = function () {

    var configs = SS.Configs()

    SS.Pages.forEach(page => {
        // 设置为当前页面
        SS.Doc.setCurrentPage(page)

        var exportPath = SS.Configs(page).ExportPath

        // 遍历页面中的图层
        page.children().forEach(layer => {
            var className = String(layer.className())
            if (className == "MSTextLayer" && layer.name().indexOf(configs.ExportFlag) == 0) {
                // 导出文本
                exportText(exportPath, layer)
            } else {
                // 导出切片
                layer.exportOptions().exportFormats().forEach(format => {
                    exportSlice(exportPath, layer, format)
                })
            }
        })

        // 还原当前页面
        SS.Doc.setCurrentPage(SS.Page)
    })

    function exportText(exportPath, layer) {
        var file = Path.Join(exportPath, layer.name().replace(configs.ExportFlag, ""))
        Path.MkDirs(NSString.stringWithString(file).stringByDeletingLastPathComponent())
        layer.stringValue().writeToFile_atomically_encoding_error(file, true, NSUTF8StringEncoding, null)
    }

    function exportSlice(exportPath, layer, format) {
        // 获取导出路径
        var file = exportPath
        var path = layer.name().stringByDeletingLastPathComponent()
        var name = layer.name().replace(path + "/", "")
        file = Path.Join(file, path)
        if (format.name() != null) {
            if (format.namingScheme()) {
                name = format.name() + name
            } else {
                name = name + format.name()
            }
        }
        file = Path.Join(file, name + "." + format.fileFormat())

        // 导出
        var slice = MSExportRequest.new()
        slice.rect = layer.absoluteRect().rect()
        slice.scale = format.scale()
        slice.setFormat(format.fileFormat())
        slice.saveForWeb = true
        // 添加背景
        if (layer.hasBackgroundColor() && layer.exportOptions().layerOptions() == 0) {
            slice.backgroundColor = layer.backgroundColor()
        }
        // 导出当前组
        if (layer.exportOptions().layerOptions() == 2) {
            slice.configureForLayer(MSImmutableLayerAncestry.ancestryWithMSLayer(layer))
        }
        // 裁切
        slice.shouldTrim = layer.exportOptions().shouldTrim()

        // 导出
        SS.Doc.saveArtboardOrSlice_toFile(slice, file)

        // 压缩
        Command.Run(Path.Join(SS.MacOS, "optimize"), [file])
    }
}