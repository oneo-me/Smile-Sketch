export default function NameInfo(nameStr) {
    nameStr = nameStr || ""

    const index = nameStr.indexOf(" | ")
    const name = index == -1 ? nameStr : nameStr.substring(0, index)
    const args = index == -1 ? "" : nameStr.substring(index + 3)
    const commandIndex = args.indexOf(": ")

    const result = {
        name: name,
        args: args,
        command: "",
        commandArg: ""
    }

    if (commandIndex >= 0) {
        result.command = args.substring(0, commandIndex)
        result.commandArg = args.substring(commandIndex + 2)
    }

    return result;
}
