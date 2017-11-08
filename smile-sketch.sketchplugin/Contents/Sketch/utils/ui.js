var ui = {
    Label: (text, alpha, x, y, w, h) => {
        var label = NSTextField.alloc().initWithFrame(NSMakeRect(x || 0, y || 0, w || 300, h || 16))
        label.setStringValue(text || "")
        label.setTextColor(NSColor.colorWithCalibratedRed_green_blue_alpha(0, 0, 0, alpha || 1))
        label.setBezeled(false)
        label.setDrawsBackground(false)
        label.setEditable(false)
        label.setSelectable(false)
        return label
    },
    TextField: (text, x, y, w, h) => {
        var field = NSTextField.alloc().initWithFrame(NSMakeRect(x || 0, y || 0, w || 300, h || 24))
        field.setStringValue(text || "")
        return field
    },
    Checkbox: (title, state, action, x, y, w, h) => {
        var checkbox = NSButton.alloc().initWithFrame(NSMakeRect(x || 0, y || 0, w || 300, h || 16))
        checkbox.setButtonType(NSSwitchButton)
        checkbox.setTitle(title || "")
        checkbox.setState(state ? NSOnState : NSOffState)
        if (action != null) {
            checkbox.setCOSJSTargetFunction(action)
        }
        return checkbox
    },
    ComboBox: (items, index, action, x, y, w, h) => {
        var comboBox = NSPopUpButton.alloc().initWithFrame(NSMakeRect(x || 0, y || 0, w || 300, h || 24))
        comboBox.addItemsWithTitles(items || [])
        comboBox.selectItemAtIndex(index || 0)
        if (action != null) {
            comboBox.setCOSJSTargetFunction(action)
        }
        return comboBox
    }
}

function Group(action, x, y, w, h) {
    var group = NSView.alloc().initWithFrame(NSMakeRect(x || 0, y || 0, w || 300, h || 0))

    this.View = () => {
        return group
    }

    this.Add = (view) => {
        group.addSubview(view)
    }
    this.AddGroup = (x, y, w, action) => {
        this.Add(new Group(action, x, y, w, 600).View())
    }
    this.AddLabel = (x, y, w, text, alpha) => {
        this.Add(ui.Label(text, alpha, x, y, w))
    }
    this.AddTextField = (x, y, w, line, text) => {
        var f = ui.TextField(text, x, y, w, 7 + 16 * (line || 1))
        this.Add(f)
        return f
    }
    this.AddCheckbox = (x, y, w, title, state, action) => {
        var f = ui.Checkbox(title, state, action, x, y, w)
        this.Add(f)
        return f
    }
    this.AddComboBox = (x, y, w, items, index, action) => {
        var f = ui.ComboBox(items, index, action, x, y, w)
        this.Add(f)
        return f
    }

    if (action != null) {
        action(this)
    }
}

function Window(title, info, buttons, action) {
    var window = COSAlertWindow.new()
    window.setMessageText(title)
    window.setInformativeText(info)


    // 窗口按钮
    var button = 1000
    var buttonids = []

    for (b in buttons) {
        buttonids[button++] = buttons[b]
        window.addButtonWithTitle(buttons[b])
    }

    // 显示窗口
    this.Show = () => {
        return buttonids[window.runModal()]
    }

    // 添加内容
    this.Add = (view) => {
        window.addAccessoryView(view)
    }
    this.AddGroup = (h, action) => {
        this.Add(new Group(action, null, null, null, h).View())
    }
    this.AddLabel = (text, alpha) => {
        this.Add(ui.Label(text, alpha))
    }
    this.AddTextField = (text, line) => {
        var f = ui.TextField(text, null, null, null, 7 + 16 * (line || 1))
        this.Add(f)
        return f
    }
    this.AddCheckbox = (title, state, action) => {
        var f = ui.Checkbox(title, state, action)
        this.Add(f)
        return f
    }
    this.AddComboBox = (items, index, action) => {
        var f = ui.ComboBox(items, index, action)
        this.Add(f)
        return f
    }

    if (action != null) {
        action(this)
        this.AddLabel()
    }
}