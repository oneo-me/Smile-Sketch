var Path = {}

Path.Join = function (path1, path2) {
    if (path2.indexOf("/") != 0) {
        if (path1.indexOf("/") == path1.length - 1) {
            return path1 + path2
        }
        if (path2 == "") {
            return path1
        }
        return path1 + "/" + path2
    }
    return path2
}

Path.FileExists = function (file) {
    if (NSFileManager.defaultManager().fileExistsAtPath(file)) {
        var isDir = MOPointer.alloc().init()
        NSFileManager.defaultManager().fileExistsAtPath_isDirectory(file, isDir)
        return isDir.value() != 1
    }
    return false
}

Path.DirExists = function (dir) {
    if (NSFileManager.defaultManager().fileExistsAtPath(dir)) {
        var isDir = MOPointer.alloc().init()
        NSFileManager.defaultManager().fileExistsAtPath_isDirectory(dir, isDir)
        return isDir.value() == 1
    }
    return false
}

Path.Ext = function (file) {
    return file.split(".").slice(-1)[0].toLowerCase()
}

Path.IsImageExt = function (file) {
    switch (Path.Ext(file)) {
        case "bmp":
        case "eps":
        case "gif":
        case "jpg":
        case "jpeg":
        case "pdf":
        case "png":
        case "psd":
        case "tiff":
        case "webp":
            return true
        default:
            return false
    }
}

Path.MkDirs = function (dir) {
    if (!Path.FileExists(dir) && !Path.DirExists(dir)) {
        NSFileManager.defaultManager().createDirectoryAtPath_withIntermediateDirectories_attributes_error(dir, true, nil, nil)
        return true
    }
    return false
}