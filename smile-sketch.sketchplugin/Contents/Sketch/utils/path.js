var Path = {
    // 获取相对文档的路径
    // 如果path是绝对路径则直接返回
    GetPath: (document, path) => {
        var root = document.fileURL().path().stringByDeletingLastPathComponent()
        return Path.Join(root, path)
    },
    GetContent: (context, path) => {
        var root = context.plugin.url().path()
        return Path.Join(root, Path.Join("Contents", path))
    },
    // 拼接路径
    Join: (path1, path2) => {
        if (path2 == null || path2 == "") {
            return path1
        }
        if (path2.indexOf("/") == 0) {
            return path2
        }
        if (path1.indexOf("/") == path1.length - 1) {
            return path1 + path2
        }
        return path1 + "/" + path2
    },
    // 文件是否存在
    FileExists: (file) => {
        if (NSFileManager.defaultManager().fileExistsAtPath(file)) {
            var isDir = MOPointer.alloc().init()
            NSFileManager.defaultManager().fileExistsAtPath_isDirectory(file, isDir)
            return isDir.value() != 1
        }
        return false
    },
    // 目录是否存在
    DirExists: (dir) => {
        if (NSFileManager.defaultManager().fileExistsAtPath(dir)) {
            var isDir = MOPointer.alloc().init()
            NSFileManager.defaultManager().fileExistsAtPath_isDirectory(dir, isDir)
            return isDir.value() == 1
        }
        return false
    },
    // 获取扩展名
    Ext: (file) => {
        return file.split(".").slice(-1)[0].toLowerCase()
    },
    // 是否是图片格式
    IsImageExt: (file) => {
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
    },
    // 创建目录
    MkDirs: (dir) => {
        if (!Path.FileExists(dir) && !Path.DirExists(dir)) {
            NSFileManager.defaultManager().createDirectoryAtPath_withIntermediateDirectories_attributes_error(dir, true, nil, nil)
            return true
        }
        return false
    }
}