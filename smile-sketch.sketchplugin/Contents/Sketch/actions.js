@import "utils/configs.js"
@import "sort.js"

function DocumentSaved(context) {
    if (context.actionContext.autosaved == 0 && Configs.Get("canAutoSort", true) == true) {
        Sort(context, true)
    }
}