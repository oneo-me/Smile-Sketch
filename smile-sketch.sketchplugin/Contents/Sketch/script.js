function toJson(obj, space) {
    return JSON.stringify(obj, null, space || 2)
}
// 文件是否存在
function fileExists(path) {
    if (NSFileManager.defaultManager().fileExistsAtPath(path)) {
        var isDir = MOPointer.alloc().init()
        NSFileManager.defaultManager().fileExistsAtPath_isDirectory(path, isDir)
        return isDir.value() != 1
    }
    return false
}
// 文件夹是否存在
function dirExists(path) {
    if (NSFileManager.defaultManager().fileExistsAtPath(path)) {
        var isDir = MOPointer.alloc().init()
        NSFileManager.defaultManager().fileExistsAtPath_isDirectory(path, isDir)
        return isDir.value() == 1
    }
    return false
}
// 获取扩展名
function extName(path) {
    return path.split(".").slice(-1)[0].toLowerCase()
}
// 是否是图片
function isImage(path) {
    switch (extName(path)) {
        case "png":
        case "bmp":
        case "gif":
        case "jpg":
        case "jpeg":
        case "tiff":
        case "eps":
        case "svg":
        case "psd":
        case "pdf":
        case "ai":
        case "eps":
            return true
        default:
            return false
    }
}
// 创建文件夹
function mkdirs(path) {
    if (!fileExists(path) && !dirExists(path)) {
        NSFileManager.defaultManager().createDirectoryAtPath_withIntermediateDirectories_attributes_error(path, true, nil, nil)
        return true
    }
    return false
}
// 是否是画板
function isArtboard(layer) {
    return layer.className() == "MSSymbolMaster" || layer.className() == "MSArtboardGroup"
}
// 配置
var configs = {
    // 保存时排序
    saveAutoSorting: false,
    // 列数
    number: 10,
    // 间距
    space: 80,
    // 默认输出目录
    out: "out",
    // 忽略标记 && 符号标记
    // 如果符号名称是这个，则不重置名称
    flag: "@",
    // 导入标记
    // 矩形：导入图片文件
    // 图片：导入图片文件
    // 文本：导入文本文件
    flagI: "@ ",
    // 导出标记
    flagE: "@E ",
    // 位置大小设置
    fixedR: "@R ",
    // 位置设置
    fixedP: "@P ",
    // 大小设置
    fixedS: "@S ",
    // 动作标记
    action: "@A "
}

// 插件
var LS = {
    init: function (context) {
        // 获取当前选择的图层
        function getSelects(document) {
            var items = []
            document.currentPage().children().forEach(layer => {
                if (layer.isSelected()) {
                    items.push(layer)
                }
            })
            return items
        }
        // 初始化环境变量
        LS.pluginRoot = context.scriptPath.stringByDeletingLastPathComponent().stringByDeletingLastPathComponent().stringByDeletingLastPathComponent()
        LS.resourcesRoot = LS.pluginRoot + "/Contents/Resources"
        LS.document = context.document || context.actionContext.document
        LS.documentRoot = LS.document.fileURL().path().stringByDeletingLastPathComponent()
        LS.pages = LS.document.pages()
        LS.page = LS.document.currentPage()
        LS.selects = getSelects(LS.document)
    }
}

LS.correct = function () {
    LS.pages.forEach(page => {
        page.children().forEach(layer => {
            // 设置位置与大小
            if (layer.name().indexOf(configs.fixedR) == 0) {
                var args = layer.name().replace(configs.fixedR, "").split(" ")
                layer.absoluteRect().setRulerX(Number(args[0]))
                layer.absoluteRect().setRulerY(Number(args[1]))
                layer.frame().setWidth(Number(args[2]))
                layer.frame().setHeight(Number(args[3]))
            }
            // 设置位置
            if (layer.name().indexOf(configs.fixedP) == 0) {
                var args = layer.name().replace(configs.fixedP, "").split(" ")
                layer.absoluteRect().setRulerX(Number(args[0]))
                layer.absoluteRect().setRulerY(Number(args[1]))
            }
            // 设置大小
            if (layer.name().indexOf(configs.fixedS) == 0) {
                var args = layer.name().replace(configs.fixedS, "").split(" ")
                layer.frame().setWidth(Number(args[0]))
                layer.frame().setHeight(Number(args[1]))
            }
            // 还原符号图层名称
            if (layer.className() == "MSSymbolInstance" && layer.name().indexOf(configs.flag) != 0) {
                layer.name = layer.symbolMaster().name()
            }
        })

        // 修复错误的位置
        var maxOffset = [0, 0]
        page.layers().forEach(layer => {
            if (!isArtboard(layer) && layer.name().indexOf(configs.flag) != 0) {
                if (maxOffset[0] > layer.absoluteRect().rulerX()) {
                    maxOffset[0] = layer.absoluteRect().rulerX()
                }
                if (maxOffset[1] > layer.absoluteRect().rulerY()) {
                    maxOffset[1] = layer.absoluteRect().rulerY()
                }
            }
        })
        page.layers().forEach(layer => {
            if (!isArtboard(layer) && layer.name().indexOf(configs.flag) != 0) {
                layer.absoluteRect().setRulerX(layer.absoluteRect().rulerX() - maxOffset[0])
                layer.absoluteRect().setRulerY(layer.absoluteRect().rulerY() - maxOffset[1])
            }
        })
    })
}
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
        slice.shouldTrim = layer.exportOptions().shouldTrim()
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
                layer.exportOptions().exportFormats().forEach(format => {
                    exportMSSliceLayer(outPathRoot, layer, format)
                })
            }
        })
        LS.document.setCurrentPage(LS.page)
    })
}
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
LS.sorting = function () {
    // 页面列表排序
    LS.pages.sort((a, b) => a.name().localeCompare(b.name()))
    LS.document.setCurrentPage(LS.pages[LS.pages.count() - 1])
    LS.document.addBlankPage()
    LS.document.removePage(LS.pages[LS.pages.count() - 1])
    LS.document.setCurrentPage(LS.page)

    // 图层列表排序
    LS.pages.forEach(page => {
        page.layers().sort((b, a) => {
            if (!isArtboard(a) && isArtboard(b)) {
                return -1
            }
            if (isArtboard(a) && isArtboard(b)) {
                if (String(a.name()) == String(b.name())) {
                    return a.frame().width() * a.frame().height() > b.frame().width() * b.frame().height() ? -1 : 1
                }
                else {
                    return a.name().localeCompare(b.name())
                }
            }
            return 0
        })
    })
    if (LS.selects.length > 0) {
        LS.selects[0].select_byExpandingSelection(false, true)
        LS.selects[0].select_byExpandingSelection(true, true)
    }
    else {
        LS.page.layers()[0].select_byExpandingSelection(true, true)
        LS.page.layers()[0].select_byExpandingSelection(false, true)
    }

    // 图层排序
    LS.pages.forEach(page => {
        var items = []
        var startTop = 0
        // 获取排序参数
        var args = {
            number: configs.number,
            space: configs.space
        }
        var index = page.name().indexOf(" (")
        if (index != -1) {
            var ss = page.name().slice(index + 2, page.name().indexOf(")")).split(" ")
            if (ss.length == 2) {
                args.number = Number(ss[0])
                args.space = Number(ss[1])
            }
            else if (ss.length == 3) {
                args.number = Number(ss[1])
                args.space = Number(ss[2])
            }
        }
        // 获取当前页面参数
        for (var m = page.layers().count(); m > 0; m--) {
            var layer = page.layers()[m - 1]
            if (isArtboard(layer)) {
                // 获取分组
                var itemTitle = layer.name().split("/").slice(0, -1).join("/")
                var isAdd = true
                for (var i = 0; i < items.length; i++) {
                    if (items[i].title == itemTitle) {
                        items[i].items.push(layer)
                        isAdd = false
                        break
                    }
                }
                if (isAdd) {
                    items.push({ title: itemTitle, items: [layer] })
                }
            }
            else {
                // 获取开始位置
                var th = layer.absoluteRect().rulerY() + layer.frame().height()
                if (th > startTop) {
                    startTop = th
                }
            }
        }
        // 开始排序
        for (var i = 0; i < items.length; i++) {
            var startLeft = 0
            var maxHeight = 0
            for (var n = 0; n < items[i].items.length; n++) {
                var layer = items[i].items[n]
                // 设置当前位置
                layer.absoluteRect().setRulerX(startLeft)
                layer.absoluteRect().setRulerY(startTop + args.space)
                // 设置下一个的位置
                startLeft += layer.frame().width() + args.space
                if (maxHeight < layer.frame().height()) {
                    maxHeight = layer.frame().height()
                }
                // 排序换行
                if ((n + 1) % args.number == 0) {
                    startLeft = 0
                    startTop += maxHeight + args.space
                    maxHeight = 0
                }
                // 排序换组
                if (n == items[i].items.length - 1) {
                    startLeft = 0
                    startTop += maxHeight + args.space * 2
                    maxHeight = 0
                }
            }
        }
    })
}
function onDocumentSaved(context) {
    if (context.actionContext.autosaved == 0 && configs.saveAutoSorting) {
        sorting(context)
    }
}
function importAll(context) {
    LS.init(context)
    LS.import()
}

function exportAll(context) {
    LS.init(context)
    LS.import()
    LS.export()
}

function sorting(context) {
    LS.init(context)
    LS.correct()
    LS.sorting()
}
function linkSite() {
    NSWorkspace.sharedWorkspace().openURL(NSURL.URLWithString("http://oneo.me"))
}
