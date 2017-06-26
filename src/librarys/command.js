var Command = {}

Command.Run = function (file, args) {
    var task = NSTask.alloc().init()

    // 不太懂，发现只有这样才能有正确的执行环境
    task.launchPath = "/bin/bash"
    task.arguments = ["-l", "-c", file + " " + args.join(" ")]

    // 启动
    task.launch()

    // 不等待退出...全部进程同时运行，很快...
    // task.waitUntilExit()
}