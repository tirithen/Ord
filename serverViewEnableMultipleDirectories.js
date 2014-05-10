function serverViewEnableMultipleDirectories(app) {
    // Monkey-patch express to accept multiple paths for looking up views.
    // this path may change depending on your setup.
    var lookupProxy = app.get('view').prototype.lookup;

    app.get('view').prototype.lookup = function(viewName) {
        var context, match, index;
        if (this.root instanceof Array) {
            for (index = 0; index < this.root.length; index += 1) {
                context = {root: this.root[index]};
                match = lookupProxy.call(context, viewName);
                if (match) {
                    return match;
                }
            }
            return null;
        }
        return lookupProxy.call(this, viewName);
    };
}

module.exports = serverViewEnableMultipleDirectories;
