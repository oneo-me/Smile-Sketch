@import "utils/path.js"
@import "setting.js"
@import "import.js"

function ExportPage(context, document, page) {
    // 没有图层则退出
    if (page.layers().count() <= 0) {
        return
    }

    // 首先导入
    ImportPage(context, document, page)

    // 选中页面
    document.setCurrentPage(page)

    // 配置
    var configs = GetConfigs(context, page)

    // 导出文本
    function exportText(exportPath, layer) {
        var file = Path.Join(exportPath, layer.name().replace("export ", ""))
        Path.MkDirs(NSString.stringWithString(file).stringByDeletingLastPathComponent())
        layer.stringValue().writeToFile_atomically_encoding_error(file, true, NSUTF8StringEncoding, null)
    }

    // 导出切片
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
        if (layer.hasBackgroundColor != null) {
            if (layer.hasBackgroundColor() && layer.exportOptions().layerOptions() == 0) {
                // BUG：导出Svg时，无法设置背景
                // 目前未找到解决办法
                slice.backgroundColor = layer.backgroundColor()
            }
        }

        // 导出当前组
        if (layer.className() == "MSSliceLayer") {
            if (layer.exportOptions().layerOptions() == 2) {
                slice.configureForLayer(MSImmutableLayerAncestry.ancestryWithMSLayer(layer))
            }
        } else {
            slice.configureForLayer(MSImmutableLayerAncestry.ancestryWithMSLayer(layer))
        }
        // 裁切
        slice.shouldTrim = layer.exportOptions().shouldTrim()

        // 导出
        document.saveArtboardOrSlice_toFile(slice, file)
    }

    // 查找需要导出的内容
    page.children().forEach(layer => {
        var exportPath = Path.GetPath(document, configs.exportPath)

        // 检查文本是否需要导出
        if (layer.className() == "MSTextLayer" && layer.name().indexOf("export ") == 0) {
            exportText(exportPath, layer)
        }

        // 导出切片
        layer.exportOptions().exportFormats().forEach(format => {
            exportSlice(exportPath, layer, format)
        })
    })
}

function Export(context) {
    var document = context.document || context.actionContext.document
    var currentPage = document.currentPage()
    document.pages().forEach(page => {
        ExportPage(context, document, page)
    })
    document.setCurrentPage(currentPage)
}