@import "utils/ui.js"

function openUrl(url) {
    NSWorkspace.sharedWorkspace().openURL(NSURL.URLWithString(url))
}

function About(context) {
    switch (new Window(context.plugin.name() + "  " + context.plugin.version(), context.plugin.pluginDescription(), ["确定", "官网", "反馈"], window => {
        window.AddLabel("如有建议或疑问请点击反馈，新版请前往官网下载")
    }).Show()) {
        case "官网":
            openUrl("http://github.com/1217950746/Smile-Sketch")
            break
        case "反馈":
            openUrl("https://github.com/1217950746/Smile-Sketch/issues")
            break
    }
}