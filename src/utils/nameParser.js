/**
 * 名称解析器
 * @class
 */
class NameParser {
  /**
   * @param {string} sourceName 图层原始名称
   */
  constructor(sourceName) {
    /**
     * @type {string} 图层名称
     */
    this.name = "";

    /**
     * @type {string} 图层参数
     */
    this.args = "";

    /**
     * @type {string} 图层命令
     */
    this.command = "";

    /**
     * @type {string} 图层命令参数
     */
    this.commandArgs = "";

    // 解析参数
    const index = sourceName.indexOf("|");
    if (index === -1) {
      this.name = sourceName;
      return;
    }

    this.name = sourceName.substring(0, index).trim();
    this.args = sourceName.substring(index + 1).trim();

    // 解析命令
    const commandIndex = this.args.indexOf(":");
    if (commandIndex === -1) {
      return;
    }

    this.command = this.args.substring(0, commandIndex).trim();
    this.commandArgs = this.args.substring(commandIndex + 1).trim();
  }
}

export { NameParser };
