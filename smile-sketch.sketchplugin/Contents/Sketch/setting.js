@import "utils/ui.js"
@import "utils/configs.js"

function GetConfigs(context, page) {
    var canAutoSort = Configs.Get("canAutoSort", true) == true
    var canAutoImport = Configs.Get("canAutoImport", false) == true
    var canRestoreSymbol = Configs.Get("canRestoreSymbol", true) == true

    if (page == null) {
        return {
            canAutoSort: canAutoSort,
            canAutoImport: canAutoImport,
            canRestoreSymbol: canRestoreSymbol,
        }
    }

    var exportPath = PageConfigs.Get(context, page, "exportPath", "")
    var column = PageConfigs.Get(context, page, "column", 10)
    var space = PageConfigs.Get(context, page, "space", 50)

    return {
        exportPath: exportPath,
        column: column,
        space: space,

        canAutoSort: canAutoSort,
        canAutoImport: canAutoImport,
        canRestoreSymbol: canRestoreSymbol,
    }
}

function Setting(context) {

    var pageIndex = 0
    var page = context.document.currentPage()
    var pages = context.document.pages()
    var pageItems = []
    for (var i = 0; i < pages.count(); i++) {
        var name = String(pages[i].name())

        // 获取正确名称
        var leftNameIndex = name.indexOf(" | ")
        name = name.substring(0, leftNameIndex == -1 ? name.length : leftNameIndex)

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

    var canAutoSortUI
    var canAutoImportUI
    var canRestoreSymbolUI

    function Save(global) {

        // 修正值
        var columnNum = Number(columnUI.stringValue().replace(",", ""))
        var spaceNum = Number(spaceUI.stringValue().replace(",", ""))

        // 页面名称增加导出路径显示
        var exportPath = exportPathUI.stringValue()
        var pageName = String(pages[pageIndex].name())
        var leftNameIndex = pageName.indexOf(" | ")
        pageName = pageName.substring(0, leftNameIndex == -1 ? pageName.length : leftNameIndex)
        pages[pageIndex].name = pageName + (exportPath == "" ? "" : " | " + exportPath)

        PageConfigs.Set(context, pages[pageIndex], "exportPath", exportPathUI.stringValue())

        // 限制最大值为999
        PageConfigs.Set(context, pages[pageIndex], "column", columnNum > 999 ? 999 : columnNum)
        PageConfigs.Set(context, pages[pageIndex], "space", spaceNum > 999 ? 999 : spaceNum)

        if (global == true) {
            Configs.Set("canAutoSort", canAutoSortUI.state() == true)
            Configs.Set("canAutoImport", canAutoImportUI.state() == true)
            Configs.Set("canRestoreSymbol", canRestoreSymbolUI.state() == true)
        }
    }

    function Load(global) {
        var configs = GetConfigs(context, pages[pageIndex])

        exportPathUI.setStringValue(configs.exportPath)
        columnUI.setStringValue(configs.column)
        spaceUI.setStringValue(configs.space)

        if (global == true) {
            canAutoSortUI.setState(configs.canAutoSort)
            canAutoImportUI.setState(configs.canAutoImport)
            canRestoreSymbolUI.setState(configs.canRestoreSymbol)
        }

        stateChanged()
    }

    function stateChanged() {
        if (canAutoSortUI.state() == true) {
            canAutoImportUI.setEnabled(false)
            canAutoImportUI.setState(NSOffState)
        } else {
            canAutoImportUI.setEnabled(true)
            canAutoImportUI.setState(canAutoImportUI.state())
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
            group.AddLabel(0, 4, 60, "整理设置")
            group.AddLabel(60, 4, 30, "列数")
            columnUI = group.AddTextField(94, 0, 40)
            group.AddLabel(141, 4, 30, "间距")
            spaceUI = group.AddTextField(175, 0, 40)
        })
        window.AddLabel()
        window.AddLabel("程序设置")
        window.AddLabel("所有文档通用的设置", 0.6)
        window.AddGroup((16 + 8) * 2 - 8, group => {
            group.AddGroup(0, 0, 150, subGroup => {
                canAutoImportUI = subGroup.AddCheckbox(0, (16 + 8) * 0, 150, "保存时刷新当前页面", false)
                canAutoSortUI = subGroup.AddCheckbox(0, (16 + 8) * 1, 150, "保存时整理当前页面", false, () => {
                    stateChanged()
                })
            })
            group.AddGroup(150, 0, 150, subGroup => {
                canRestoreSymbolUI = subGroup.AddCheckbox(0, (16 + 8) * 1, 150, "整理时还原符号名称", false)
            })
        })

        Load(true)
    }).Show() == "确定") {
        Save(true)
    }
}