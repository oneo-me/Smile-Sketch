function DocumentSaved(context) {
    if (context.actionContext.autosaved == 0) {
        SS.Init(context)
        if (SS.Configs().AutoSort) {
            SS.Correct()
            SS.Sort()
        }
    }
}