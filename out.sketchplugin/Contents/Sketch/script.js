var Command = {}

Command.Run = function (file, args) {
    var task = NSTask.alloc().init()

    // 不太懂，发现只有这样才能有正确的执行环境
    task.launchPath = "/bin/bash"
    task.arguments = ["-l", "-c", file + " " + args.join(" ")]

    // 启动
    task.launch()

    // 不等待退出...全部进程同时运行，很快...
    // task.waitUntilExit()
}
var Path = {}

Path.Join = function (path1, path2) {
    if (path2.indexOf("/") != 0) {
        if (path1.indexOf("/") == path1.length - 1) {
            return path1 + path2
        }
        if (path2 == "") {
            return path1
        }
        return path1 + "/" + path2
    }
    return path2
}

Path.FileExists = function (file) {
    if (NSFileManager.defaultManager().fileExistsAtPath(file)) {
        var isDir = MOPointer.alloc().init()
        NSFileManager.defaultManager().fileExistsAtPath_isDirectory(file, isDir)
        return isDir.value() != 1
    }
    return false
}

Path.DirExists = function (dir) {
    if (NSFileManager.defaultManager().fileExistsAtPath(dir)) {
        var isDir = MOPointer.alloc().init()
        NSFileManager.defaultManager().fileExistsAtPath_isDirectory(dir, isDir)
        return isDir.value() == 1
    }
    return false
}

Path.Ext = function (file) {
    return file.split(".").slice(-1)[0].toLowerCase()
}

Path.IsImageExt = function (file) {
    switch (Path.Ext(file)) {
        case "bmp":
        case "eps":
        case "gif":
        case "jpg":
        case "jpeg":
        case "pdf":
        case "png":
        case "psd":
        case "tiff":
        case "webp":
            return true
        default:
            return false
    }
}

Path.MkDirs = function (dir) {
    if (!Path.FileExists(dir) && !Path.DirExists(dir)) {
        NSFileManager.defaultManager().createDirectoryAtPath_withIntermediateDirectories_attributes_error(dir, true, nil, nil)
        return true
    }
    return false
}
function IsArtboard(layer) {
    return layer.className() == "MSSymbolMaster" || layer.className() == "MSArtboardGroup"
}
var SS = {}

SS.Init = function (context) {
    SS.Root = context.scriptPath.stringByDeletingLastPathComponent().stringByDeletingLastPathComponent().stringByDeletingLastPathComponent()
    SS.Doc = context.document || context.actionContext.document
    SS.DocRoot = SS.Doc.fileURL().path().stringByDeletingLastPathComponent()
    SS.Pages = SS.Doc.pages()
    SS.Page = SS.Doc.currentPage()
    SS.Selects = function () {
        var items = []
        SS.Doc.currentPage().children().forEach(layer => {
            if (layer.isSelected()) {
                items.push(layer)
            }
        })
        return items
    }

    SS.Resources = Path.Join(SS.Root, "Contents/Resources")
    SS.MacOS = Path.Join(SS.Root, "Contents/MacOS")
}

SS.Configs = function (page) {
    var configs = {
        SymbolFlag: "&",
        ImportFlag: "import ",
        ExportFlag: "export ",
        ExportPath: "",
        AutoSort: true,
        SortColumn: 5,
        SortSpace: 30,
    }
    if (page != null) {
        // 从页面名称中获取参数
        var name = String(page.name())
        var args = []
        var start = name.indexOf(" | ")
        if (start != -1 && name.length > start + 3) {
            args = name.slice(start + 3, name.length).split(", ")
        }
        // 设置参数
        configs.ExportPath = args[0] || configs.ExportPath
        configs.SortColumn = Number(args[1]) || configs.SortColumn
        configs.SortSpace = Number(args[2]) || configs.SortSpace
        configs.AutoSort = Boolean(args[3]) || configs.AutoSort
    }
    // 修改导出路径为绝对路径
    if (configs.ExportPath.indexOf("/") != 0) {
        configs.ExportPath = SS.DocRoot + (configs.ExportPath == "" ? "" : "/" + configs.ExportPath)
    }
    return configs
}
SS.Correct = function () {

    var configs = SS.Configs()

    // 还原符号图层名称
    SS.Page.children().forEach(layer => {
        if (layer.className() == "MSSymbolInstance" && layer.name().indexOf(configs.SymbolFlag) != 0) {
            layer.name = layer.symbolMaster().name()
        }
    })

    // 修复错误的位置
    var maxOffset = [0, 0]
    SS.Page.layers().forEach(layer => {
        if (!IsArtboard(layer)) {
            if (maxOffset[0] > layer.absoluteRect().rulerX()) {
                maxOffset[0] = layer.absoluteRect().rulerX()
            }
            if (maxOffset[1] > layer.absoluteRect().rulerY()) {
                maxOffset[1] = layer.absoluteRect().rulerY()
            }
        }
    })
    SS.Page.layers().forEach(layer => {
        if (!IsArtboard(layer)) {
            layer.absoluteRect().setRulerX(layer.absoluteRect().rulerX() - maxOffset[0])
            layer.absoluteRect().setRulerY(layer.absoluteRect().rulerY() - maxOffset[1])
        }
    })
}
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
SS.PageSort = function () {
    // 页面列表排序
    SS.Pages.sort((a, b) => a.name().localeCompare(b.name()))
    SS.Doc.setCurrentPage(SS.Pages[SS.Pages.count() - 1])
    SS.Doc.addBlankPage()
    SS.Doc.removePage(SS.Pages[SS.Pages.count() - 1])
    SS.Doc.setCurrentPage(SS.Page)
}

SS.Sort = function () {

    var configs = SS.Configs(SS.Page)

    if (SS.Page.layers().length <= 0) {
        return
    }
    // 图层列表排序
    SS.Page.layers().sort((b, a) => {
        if (!IsArtboard(a) && IsArtboard(b)) {
            return -1
        }
        if (IsArtboard(a) && IsArtboard(b)) {
            if (String(a.name()) == String(b.name())) {
                return a.frame().width() * a.frame().height() > b.frame().width() * b.frame().height() ? -1 : 1
            }
            else {
                return a.name().localeCompare(b.name())
            }
        }
        return 0
    })

    // 重新建立选择内容，以强制 Sketch 刷新视图
    var selects = SS.Selects()
    if (selects.length > 0) {
        selects[0].select_byExpandingSelection(false, true)
        selects[0].select_byExpandingSelection(true, true)
    }
    else {
        SS.Page.layers()[0].select_byExpandingSelection(true, true)
        SS.Page.layers()[0].select_byExpandingSelection(false, true)
    }

    // 图层排序
    var items = []
    var startTop = 0
    // 获取排序参数
    var args = {
        column: configs.SortColumn,
        space: configs.SortSpace
    }
    var index = SS.Page.name().indexOf(" (")
    if (index != -1) {
        var ss = SS.Page.name().slice(index + 2, SS.Page.name().indexOf(")")).split(" ")
        if (ss.length == 2) {
            args.column = Number(ss[0])
            args.space = Number(ss[1])
        }
        else if (ss.length == 3) {
            args.column = Number(ss[1])
            args.space = Number(ss[2])
        }
    }
    // 获取当前页面参数
    for (var m = SS.Page.layers().count(); m > 0; m--) {
        var layer = SS.Page.layers()[m - 1]
        if (IsArtboard(layer)) {
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
            if ((n + 1) % args.column == 0) {
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
}
function DocumentSaved(context) {
    if (context.actionContext.autosaved == 0) {
        SS.Init(context)
        if (SS.Configs().AutoSort) {
            SS.Correct()
            SS.Sort()
        }
    }
}
function Import(context) {
    SS.Init(context)
    SS.Import()
}

function Export(context) {
    SS.Init(context)
    SS.Import()
    SS.Export()
}

function Sort(context) {
    SS.Init(context)
    SS.Correct()
    SS.Sort()
}

function PageSort(context) {
    SS.Init(context)
    SS.PageSort()
}
function Link(url) {
    NSWorkspace.sharedWorkspace().openURL(NSURL.URLWithString(url))
}
function LinkGithub() {
    Link("https://github.com/1217950746/Smile-Sketch")
}
function LinkFeedback() {
    Link("https://github.com/1217950746/Smile-Sketch/issues")
}
