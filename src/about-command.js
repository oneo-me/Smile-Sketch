import { log } from "./utils/log"

export default function (context) {
    var window = COSAlertWindow.new()
    window.setMessageText(context.plugin.name())
    window.setInformativeText(context.plugin.version() + "\n\n" + context.plugin.pluginDescription())
    window.addButtonWithTitle("确定")
    window.addButtonWithTitle("Github")
    var result = window.runModal()
    if (result == 1001) {
        var url = "https://github.com/1217950746/Smile-Sketch"
        log.ui("打开 " + url)
        NSWorkspace.sharedWorkspace().openURL(NSURL.URLWithString(url))
    }
}
