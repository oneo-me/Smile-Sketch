/**
 * 路径解析器
 * @class
 */
class PathParser {
  /**
   * 解析路径
   * @param {string} documentPath 文档路径
   * @param {string} pagePath 页面路径
   * @param {string} layerPath 图层路径
   * @return {string} 最终路径
   */
  static getPath(documentPath, pagePath, layerPath) {
    if (layerPath === "") return "";

    if (layerPath.startsWith("~") || layerPath.startsWith("/")) {
      return layerPath;
    }

    var result = "";
    if (pagePath.startsWith("~") || pagePath.startsWith("/")) {
      result = pagePath;
    } else if (pagePath !== "") {
      result = documentPath + "/" + pagePath + "/" + layerPath;
    } else {
      result = documentPath + "/" + layerPath;
    }

    return result;
  }
}

export { PathParser };
