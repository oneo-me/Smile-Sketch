function Import(context) {
    SS.Init(context)
    SS.Import()
}

function Export(context) {
    SS.Init(context)
    SS.Import()
    SS.Export()
}

function Sort(context) {
    SS.Init(context)
    SS.Correct()
    SS.Sort()
}

function PageSort(context) {
    SS.Init(context)
    SS.PageSort()
}