@import "utils/ui.js"
@import "utils/configs.js"
@import "sort.js"

function GetConfigs(context, page) {
    var canAutoSort = Configs.Get("canAutoSort", true) == true
    var canSortPage = Configs.Get("canSortPage", false) == true
    var canRefreshImport = Configs.Get("canRefreshImport", true) == true
    var canRestoreSymbol = Configs.Get("canRestoreSymbol", true) == true
    var canOptimize = Configs.Get("canOptimize", true) == true

    if (page == null) {
        return {
            canAutoSort: canAutoSort,
            canSortPage: canSortPage,
            canRefreshImport: canRefreshImport,
            canRestoreSymbol: canRestoreSymbol,
            canOptimize: canOptimize
        }
    }

    var exportPath = PageConfigs.Get(context, page, "exportPath", "")
    var column = PageConfigs.Get(context, page, "column", 10)
    var space = PageConfigs.Get(context, page, "space", 50)
    var groupSpace = PageConfigs.Get(context, page, "groupSpace", 300)

    return {
        exportPath: exportPath,
        column: column,
        space: space,
        groupSpace: groupSpace,

        canAutoSort: canAutoSort,
        canSortPage: canSortPage,
        canRefreshImport: canRefreshImport,
        canRestoreSymbol: canRestoreSymbol,
        canOptimize: canOptimize
    }
}

function Setting(context) {

    var pageIndex = 0
    var page = context.document.currentPage()
    var pages = context.document.pages()
    var pageItems = []
    for (var i = 0; i < pages.count(); i++) {
        var name = String(pages[i].name())
        while (pageItems.indexOf(name) == true) {
            name += " "
        }
        pageItems.push(name)
        if (pages[i] == page) {
            pageIndex = i
        }
    }

    var pageUI

    var exportPathUI
    var columnUI
    var spaceUI
    var groupSpaceUI

    var canAutoSortUI
    var canSortPageUI
    var canRefreshImportUI
    var canRestoreSymbolUI

    function Save(global) {

        // 修正值
        var columnNum = Number(columnUI.stringValue().replace(",", ""))
        var spaceNum = Number(spaceUI.stringValue().replace(",", ""))
        var groupSpaceNum = Number(groupSpaceUI.stringValue().replace(",", ""))

        PageConfigs.Set(context, pages[pageIndex], "exportPath", exportPathUI.stringValue())

        // 限制最大值为999
        PageConfigs.Set(context, pages[pageIndex], "column", columnNum > 999 ? 999 : columnNum)
        PageConfigs.Set(context, pages[pageIndex], "space", spaceNum > 999 ? 999 : spaceNum)
        PageConfigs.Set(context, pages[pageIndex], "groupSpace", groupSpaceNum > 999 ? 999 : groupSpaceNum)

        if (global == true) {
            Configs.Set("canAutoSort", canAutoSortUI.state() == true)
            Configs.Set("canSortPage", canSortPageUI.state() == true)
            Configs.Set("canRefreshImport", canRefreshImportUI.state() == true)
            Configs.Set("canRestoreSymbol", canRestoreSymbolUI.state() == true)
        }
    }
    function Load(global) {
        var configs = GetConfigs(context, pages[pageIndex])

        exportPathUI.setStringValue(configs.exportPath)
        columnUI.setStringValue(configs.column)
        spaceUI.setStringValue(configs.space)
        groupSpaceUI.setStringValue(configs.groupSpace)

        if (global == true) {
            canAutoSortUI.setState(configs.canAutoSort)
            canSortPageUI.setState(configs.canSortPage)
            canRefreshImportUI.setState(configs.canRefreshImport)
            canRestoreSymbolUI.setState(configs.canRestoreSymbol)
        }
    }

    if (new Window("设置", "页面设置与全局设置", ["确定", "取消"], window => {
        window.AddLabel("页面设置")
        window.AddLabel("更换页面会直接保存当前页面的设置", 0.6)
        window.AddGroup(24, group => {
            group.AddLabel(0, 4, 60, "选择页面")
            pageUI = group.AddComboBox(60, 0, 240, pageItems, pageIndex, () => {
                Save()
                pageIndex = pageUI.indexOfSelectedItem()
                Load()
            })
        })
        window.AddGroup(55, group => {
            group.AddLabel(0, 35, 60, "导出路径")
            exportPathUI = group.AddTextField(63, 0, 234, 3)
        })
        window.AddGroup(24, group => {
            group.AddLabel(0, 4, 60, "排序设置")
            group.AddLabel(60, 4, 30, "列数")
            columnUI = group.AddTextField(94, 0, 40)
            group.AddLabel(141, 4, 30, "间距")
            spaceUI = group.AddTextField(175, 0, 40)
            group.AddLabel(223, 4, 30, "组距")
            groupSpaceUI = group.AddTextField(257, 0, 40)
        })
        window.AddLabel()
        window.AddLabel("全局设置")
        window.AddLabel("与其他文件通用的设置", 0.6)
        window.AddGroup((16 + 8) * 2 - 8, group => {
            group.AddGroup(0, 0, 150, subGroup => {
                canSortPageUI = subGroup.AddCheckbox(0, (16 + 8) * 0, 150, "排序页面列表", false)
                canAutoSortUI = subGroup.AddCheckbox(0, (16 + 8) * 1, 150, "保存时排序当前页面", false)
            })
            group.AddGroup(150, 0, 150, subGroup => {
                canRefreshImportUI = subGroup.AddCheckbox(0, (16 + 8) * 0, 150, "排序时刷新导入的内容", false)
                canRestoreSymbolUI = subGroup.AddCheckbox(0, (16 + 8) * 1, 150, "排序时还原符号名称", false)
            })
        })

        Load(true)
    }).Show() == "确定") {
        Save(true)
        Sort(context, true)
    }
}