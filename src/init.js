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