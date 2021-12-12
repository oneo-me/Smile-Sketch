export default function (context) {
    var document = context.document
    var root = document.fileURL().path().stringByDeletingLastPathComponent()
    var currentPage = document.currentPage()
    document.pages().forEach(page => {
        document.setCurrentPage(page)
        exportPage(document, root, page)
    })
    document.setCurrentPage(currentPage)
}

function exportPage(document, root, page) {
    var pageName = page.name()
    var index = pageName.indexOf(" | ")
    var name = index == -1 ? pageName : pageName.substring(0, index)
    var pagePath = index == -1 ? "" : pageName.substring(index + 3)
    var path = pagePath[0] == "~" ? pagePath : root + "/" + pagePath

    console.log("导出: " + name + "(" + path + ")")

    page.children().forEach(layer => {
        if (layer == page)
            return

        var options = layer.exportOptions()
        var formats = options.exportFormats()
        if (formats.count() <= 0)
            return

        formats.forEach(format => {
            var name = layer.name()
            if (format.name() != null) {
                if (format.namingScheme()) {
                    name = format.name() + name
                } else {
                    name = name + format.name()
                }
            }
            name = name + "." + format.fileFormat()

            console.log(" - " + name)

            // 导出
            exportFormat(document, layer, options, format, path + "/" + name)
        })
    })
}

function exportFormat(document, layer, options, format, file) {
    var slice = MSExportRequest.new()
    slice.rect = layer.absoluteRect().rect()
    slice.scale = format.scale()
    slice.format = format.fileFormat()
    slice.saveForWeb = true

    // 切片
    if (layer.className() == "MSSliceLayer") {
        // 修剪透明像素
        slice.shouldTrim = !layer.hasBackgroundColor() && options.shouldTrim()
        // 背景色
        if (layer.hasBackgroundColor()) {
            var hexColor = layer.backgroundColor().NSColorWithColorSpace(nil).hexValue()
            slice.setBackgroundColor(MSImmutableColor.colorWithSVGString("#" + hexColor))
        }
    }

    document.saveArtboardOrSlice_toFile(slice, file)
}
