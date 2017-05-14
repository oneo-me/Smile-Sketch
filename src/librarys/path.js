// 文件是否存在
function fileExists(path) {
    if (NSFileManager.defaultManager().fileExistsAtPath(path)) {
        var isDir = MOPointer.alloc().init()
        NSFileManager.defaultManager().fileExistsAtPath_isDirectory(path, isDir)
        return isDir.value() != 1
    }
    return false
}
// 文件夹是否存在
function dirExists(path) {
    if (NSFileManager.defaultManager().fileExistsAtPath(path)) {
        var isDir = MOPointer.alloc().init()
        NSFileManager.defaultManager().fileExistsAtPath_isDirectory(path, isDir)
        return isDir.value() == 1
    }
    return false
}
// 获取扩展名
function extName(path) {
    return path.split(".").slice(-1)[0].toLowerCase()
}
// 是否是图片
function isImage(path) {
    switch (extName(path)) {
        case "png":
        case "bmp":
        case "gif":
        case "jpg":
        case "jpeg":
        case "tiff":
        case "eps":
        case "svg":
        case "psd":
        case "pdf":
        case "ai":
        case "eps":
            return true
        default:
            return false
    }
}
// 创建文件夹
function mkdirs(path) {
    if (!fileExists(path) && !dirExists(path)) {
        NSFileManager.defaultManager().createDirectoryAtPath_withIntermediateDirectories_attributes_error(path, true, nil, nil)
        return true
    }
    return false
}