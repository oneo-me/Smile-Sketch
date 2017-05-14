function onDocumentSaved(context) {
    if (context.actionContext.autosaved == 0 && configs.saveAutoSorting) {
        sorting(context)
    }
}