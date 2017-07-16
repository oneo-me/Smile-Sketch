// 插件配置
var Configs = {
    Get: (key, defValue) => {
        return NSUserDefaults.standardUserDefaults().objectForKey(key) || defValue
    },
    Set: (key, value) => {
        NSUserDefaults.standardUserDefaults().setObject_forKey(value, key)
    },
    GetItems: (items) => {
        for (var item in items) {
            items[item] = Configs.Get(item, items[item])
        }
    },
    SetItems: (items) => {
        for (var item in items) {
            Configs.Set(item, items[item])
        }
    }
}

// 页面配置
var PageConfigs = {
    Get: (context, page, key, defValue) => {
        return context.command.valueForKey_onLayer(key, page) || defValue
    },
    Set: (context, page, key, value) => {
        context.command.setValue_forKey_onLayer(value, key, page)
    },
    GetItems: (context, page, items) => {
        for (var item in items) {
            items[item] = PageConfigs.Get(context, page, item, items[item])
        }
    },
    SetItems: (context, page, items) => {
        for (var item in items) {
            PageConfigs.Set(context, page, item, items[item])
        }
    }
}
