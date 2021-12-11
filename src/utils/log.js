import sketch from 'sketch'

export let log = {
    info: (message) => {
        console.log(message)
    },
    error: (message) => {
        console.error(message)
    },
    ui: (message) => {
        console.log(message)
        sketch.UI.message(message)
    }
}
