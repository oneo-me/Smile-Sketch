// 执行命令
function Command(file, args, wait) {
    var task = NSTask.alloc().init()
    task.launchPath = "/bin/bash"
    task.arguments = ["-l", "-c", file + " " + args.join(" ")]
    task.launch()
    if (wait == true) {
        task.waitUntilExit()
    }
}