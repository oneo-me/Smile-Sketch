@import "utils/path.js"
@import "utils/configs.js"
@import "utils/sketch.js"
@import "import.js"

function exportText(document, exportPath, layer) {
    var file = Path.Join(exportPath, layer.name().replace("export ", ""))
    Path.MkDirs(NSString.stringWithString(file).stringByDeletingLastPathComponent())
    layer.stringValue().writeToFile_atomically_encoding_error(file, true, NSUTF8StringEncoding, null)
}

function exportSlice(document, exportPath, layer, format) {
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
    
    // 设置导出选项
    var slice = MSExportRequest.new()
    slice.rect = layer.absoluteRect().rect()
    slice.scale = format.scale()
    slice.format = format.fileFormat()
    slice.saveForWeb = true
    if (layer.className() == "MSSliceLayer") {
        if (layer.exportOptions().shouldTrim() == 1) {
            slice.shouldTrim = true
        }
        if (layer.exportOptions().layerOptions() == 2) {
            slice.configureForLayer(MSImmutableLayerAncestry.ancestryWithMSLayer(layer))
        }
        else {
            if (layer.hasBackgroundColor() == 1) {
                slice.backgroundColor = layer.backgroundColor()
            }
            var parentArtboard = layer.parentArtboard()
            if (parentArtboard != null) {
                if (parentArtboard.hasBackgroundColor() == 1 && parentArtboard.includeBackgroundColorInExport() == 1) {
                    slice.backgroundColor = parentArtboard.backgroundColor()
                }
            }
        }
    }
    else if (IsArtboard(layer)) {
        if (layer.hasBackgroundColor() == 1 && layer.includeBackgroundColorInExport() == 1) {
            slice.backgroundColor = layer.backgroundColor()
        }
    } else {
        slice.shouldTrim = true
        slice.configureForLayer(MSImmutableLayerAncestry.ancestryWithMSLayer(layer))
    }

    // 导出
    document.saveArtboardOrSlice_toFile(slice, file)
}

function exportLayers(document, exportPath, layers) {
    layers.forEach(layer => {
        if (layer.className() == "MSTextLayer" && layer.name().indexOf("export ") == 0) {
            exportText(document, exportPath, layer)
        }
        layer.exportOptions().exportFormats().forEach(format => {
            exportSlice(document, exportPath, layer, format)
        })
    })
}

function Export(context) {
    var document = context.document
    var currentPage = document.currentPage()
    var selection = context.selection

    document.pages().forEach(page => {
        document.setCurrentPage(page)
        if (page.children().count() > 0) {
            var exportPath = Path.GetPath(document, PageConfigs.Get(context, page, "exportPath", ""))
            importLayers(context, document, page.children())
            exportLayers(document, exportPath, page.children())
        }
    })
    document.setCurrentPage(currentPage)
}

function ExportSelection(context) {
    var document = context.document
    var currentPage = document.currentPage()
    var selection = context.selection

    if (selection.count() > 0) {
        var exportPath = Path.GetPath(document, PageConfigs.Get(context, currentPage, "exportPath", ""))
        importLayers(context, document, selection)
        exportLayers(document, exportPath, selection)
    }
}