import NameInfo from "./utils/name-info"

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
    var { name, args } = NameInfo(page.name())
    var path = args[0] == "~" ? args : root + (args == "" ? "" : "/" + args)


    console.log("导出: " + name + " (" + path + ")")

    page.children().forEach(layer => {
        if (layer == page)
            return

        exportCommandLayer(layer, path)

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

            console.log(" - 图片：" + name)

            // 导出
            exportFormat(document, layer, options, format, `${path}/${name}`)
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

function exportCommandLayer(layer, path) {
    var { name, command, commandArg } = NameInfo(layer.name())

    if (layer.className() == "MSTextLayer") {
        if (command == "export") {
            console.log(" - 文本: " + name)

            var file = `${path}/${commandArg}`
            var folder = NSString.stringWithString(file).stringByDeletingLastPathComponent()
            NSFileManager.defaultManager().createDirectoryAtPath_withIntermediateDirectories_attributes_error(folder, true, nil, nil)
            layer.stringValue().writeToFile_atomically_encoding_error(file, true, NSUTF8StringEncoding, null)
        }
    }
}
