export default function (context) {
  var window = COSAlertWindow.new();
  window.setIcon(NSImage.alloc().initByReferencingFile(context.plugin.urlForResourceNamed("windowIcon.png").path()));
  window.setMessageText(context.plugin.name());
  window.setInformativeText(context.plugin.version() + "\n\n" + context.plugin.pluginDescription());
  window.addButtonWithTitle("确定");
  window.addButtonWithTitle("Github");
  var result = window.runModal();
  if (result == 1001) {
    NSWorkspace.sharedWorkspace().openURL(NSURL.URLWithString("https://github.com/oneo-me/Smile-Sketch"));
  }
}
