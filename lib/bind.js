var chokidar = require("chokidar")
    , url = require("url")
    , path = require("path")
    , _triggers = {}
    , _watching = {}
    , _added = {};

module.exports = function(filename, address, content_type, fn) { 
    _triggers[filename] = _triggers[filename] || {};
    
    var pathname = url.parse(address).pathname;

    if (!_added[filename]) {
        _added[filename] = true;
        console.log("+ " + filename);
    }

    // any time filename changes, we send a command to refresh the browser
    // using the pathname provided here
    if (!_triggers[filename][pathname]) {
        // content type determines how the refresh is processed client-side
        _triggers[filename][pathname] = content_type;
    };

    // prevent duplicate requests for the same path
    var dir = path.dirname(filename);
    if (_watching[dir]) return;
    // start watching this directory
    var watcher = _watching[dir] = chokidar.watch(dir, /[\/\\]\./);
    watcher
        .on('change', function(filename) {                
            if (_triggers[filename]) {
                console.log("! " + filename);  
                fn(filename, _triggers[filename]);
            };
        })
        .on("unlink", function(filename) {
            if (_triggers[filename]) {
                console.log("- " + filename);  
                fn(filename, _triggers[filename]);
            };
        });
}
