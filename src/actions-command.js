import { RestoreSymbolName } from "./symbol-action"
import { ImportLayer } from "./import-action"

export function onDocumentSaved(context) {
    var actionContext = context.actionContext
    RestoreSymbolName(actionContext)
    ImportLayer(actionContext)
}
