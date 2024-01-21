import { NameParser } from "./utils/nameParser";
import { PathParser } from "./utils/pathParser";

export default function (context) {
  const document = context.document;
  const root = document.fileURL().path().stringByDeletingLastPathComponent();
  const currentPage = document.currentPage();
  document.pages().forEach((page) => {
    document.setCurrentPage(page);

    const pageName = new NameParser(page.name());
    console.log("进入页面：" + pageName.name + "，参数：" + pageName.args);

    page.children().forEach((layer) => {
      const layerType = layer.className() + "";
      const layerName = new NameParser(layer.name());

      // 导出命令
      if (layerName.command === "export") {
        // 目前仅支持文本图层导出
        if (layerType === "MSTextLayer") {
          const file = PathParser.getPath(root, pageName.args, layerName.commandArgs);
          console.log("    处理图层：" + layerName.name + "，导出文本：" + file);

          var folder = NSString.stringWithString(file).stringByDeletingLastPathComponent();
          NSFileManager.defaultManager().createDirectoryAtPath_withIntermediateDirectories_attributes_error(folder, true, nil, nil);
          layer.stringValue().writeToFile_atomically_encoding_error(file, true, NSUTF8StringEncoding, null);
        }
      }

      // 检查导出选项
      var options = layer.exportOptions();
      options.exportFormats().forEach((format) => {
        const formatName = "." + format.fileFormat();
        let fileName = layerName.name;
        if (format.name() != null) {
          if (format.namingScheme()) {
            fileName = format.name() + fileName;
          } else {
            fileName = fileName + format.name();
          }
        }
        const file = PathParser.getPath(root, pageName.args, fileName + formatName);
        console.log("    处理图层：" + layerName.name + "，导出图片：" + file);

        var slice = MSExportRequest.new();
        slice.rect = layer.rect();
        slice.scale = format.scale();
        slice.format = format.fileFormat();
        slice.saveForWeb = true;

        // 处理切片
        if (layer.className() == "MSSliceLayer") {
          // 修剪透明像素
          slice.shouldTrim = !layer.hasBackgroundColor() && options.shouldTrim();
          // 背景色
          if (layer.hasBackgroundColor()) {
            var hexColor = layer.backgroundColor().NSColorWithColorSpace(nil).hexValue();
            slice.setBackgroundColor(MSImmutableColor.colorWithSVGString("#" + hexColor));
          }
        }

        document.saveArtboardOrSlice_toFile(slice, file);
      });
    });
  });
  document.setCurrentPage(currentPage);
}
