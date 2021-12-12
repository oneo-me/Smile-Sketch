import { RestoreSymbolName } from "./symbol-action"

export function onDocumentSaved(context) {
    var actionContext = context.actionContext
    RestoreSymbolName(actionContext)
}
