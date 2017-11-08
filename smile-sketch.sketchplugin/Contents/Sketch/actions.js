@import "utils/configs.js"
@import "sort.js"
@import "import.js"

function DocumentSaved(context) {
    if (context.actionContext.autosaved == 0) {
        if (Configs.Get("canAutoSort", true) == true) {
            Sort(context, true)
        } else if (Configs.Get("canAutoImport", true) == true) {
            Import(context)
        }
    }
}