// 环境
// -------------------------
var path = require("path")
var fse = require("fs-extra")
var child_process = require("child_process")

var log = (msg) => console.log(msg || " ")
var package = fse.readJsonSync(path.join(__dirname, "package.json"))

// 变量
// -------------------------
var srcPath = path.join(__dirname, "src")
var outPath = path.join(__dirname, package.name + ".sketchplugin/Contents")
var outScriptPath = path.join(outPath, "Sketch/script.js")
var outResourcesPath = path.join(outPath, "Resources")
var outManifestPath = path.join(outPath, "Sketch/manifest.json")

// 清理缓存
// -------------------------
fse.removeSync(outPath)

// 生成 manifest.json
// -------------------------
var manifest = {}
// 获取信息
manifest.name = package.displayName
manifest.version = package.version
manifest.description = package.description
manifest.homepage = package.homepage
manifest.author = package.author
manifest.authorEmail = package.authorEmail
manifest.identifier = (manifest.author + "." + package.name).toLowerCase()
manifest.commands = []
manifest.menu = {
    title: package.displayName,
    items: [

    ]
}
// 获取事件
var actions = {
    script: "script.js",
    handlers: {
        actions: {

        }
    }
}
for (var key in package.actions) {
    actions.handlers.actions[key] = package.actions[key].toString()
}
manifest.commands.push(actions)
// 获取菜单
package.menus.forEach(menu => {
    if (menu.name == "-") {
        manifest.menu.items.push("-")
    }
    else {
        var command = {
            name: menu.name,
            shortcut: menu.shortcut,
            identifier: menu.handler,
            handler: menu.handler,
            script: "script.js"
        }
        manifest.commands.push(command)
        manifest.menu.items.push(menu.handler)
    }
})
// 生成文件
fse.outputJsonSync(outManifestPath, manifest, { spaces: 4 })

// 拷贝 resources
// -------------------------
child_process.execFileSync("svgo", ["--enable=removeDimensions", "-f", path.join(srcPath, "resources")])
fse.copySync(path.join(srcPath, "resources"), outResourcesPath)

// 生成 script.js
// -------------------------
String.prototype.onFile = function (callback) {
    var p = this.toString()
    if (fse.existsSync(p)) {
        if (fse.statSync(p).isDirectory()) {
            fse.readdirSync(p).forEach(filename => {
                callback(path.join(p, filename), filename)
            })
        } else if (fse.statSync(p).isFile()) {
            callback(p, path.basename(p))
        }
    }
}
var scriptCode = ""
function addFile(file, filename) {
    log("编译：" + filename)
    if (path.extname(file) == ".js") {
        scriptCode += fse.readFileSync(file, "utf8") + "\n"
    }
}
function saveScript() {
    fse.outputFileSync(outScriptPath, scriptCode, { encoding: "utf8" })
}
// 库
path.join(srcPath, "librarys").onFile(addFile)
// 初始化
log()
path.join(srcPath, "init.js").onFile(addFile)
// 功能
log()
path.join(srcPath, "functions").onFile(addFile)
// 事件
log()
path.join(srcPath, "commands").onFile(addFile)
// 保存
saveScript()
// 退出
log()
log("完成：" + new Date())
process.exit()