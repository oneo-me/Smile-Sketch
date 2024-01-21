import { NameParser } from "./utils/nameParser";
import { PathParser } from "./utils/pathParser";

export default function (context) {
  const document = context.document;
  const root = document.fileURL().path().stringByDeletingLastPathComponent();

  document.pages().forEach((page) => {
    const pageName = new NameParser(page.name());

    console.log("进入页面：" + pageName.name + "，参数：" + pageName.args);

    page.children().forEach((layer) => {
      const layerType = layer.className() + "";
      const layerName = new NameParser(layer.name());

      // 还原符号名称
      if (layerType === "MSSymbolInstance") {
        console.log("    处理图层：" + layerName.name + "，还原符号名称");
        layer.name = layer.symbolMaster().name();
        return;
      }

      // 检测是否为 import 命令（目前仅支持此命令）
      if (layerName.command !== "import") {
        return;
      }

      // 解析路径
      const file = PathParser.getPath(root, pageName.args, layerName.commandArgs);
      if (file === "") return;

      // 检测是否为文本图层
      if (layerType === "MSTextLayer") {
        console.log("    处理图层：" + layerName.name + "，导入文本：" + layerName.commandArgs);
        layer.stringValue = NSString.stringWithContentsOfFile_encoding_error(file, NSUTF8StringEncoding, null);
        return;
      }

      // 检测是否为图片图层
      if (layerType === "MSBitmapLayer") {
        console.log("    处理图层：" + layerName.name + "，导入图片：" + layerName.commandArgs);
        document.actionsController().actionForID("MSReplaceImageAction").applyImage_tolayer(NSImage.alloc().initWithContentsOfFile(file), layer);
        return;
      }
    });
  });
}
