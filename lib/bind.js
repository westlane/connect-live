var chokidar = require("chokidar")
    , url = require("url")
    , path = require("path")
    , _triggers = {}
    , _watching = {}
    , _added = {};

module.exports = function(root,filename, address, content_type, fn) { 
    _triggers[filename] = _triggers[filename] || {};
    
    var short_filename = filename.replace(root, "");
    var pathname = url.parse(address).pathname;

    // add this to our list of tracked files
    if (!_added[filename]) {
        _added[filename] = true;
        console.log(short_filename + ": watching");
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
            for (var idx in _triggers) {
                if (filename.match(idx)) { 
                    console.log(short_filename+": refreshed");
                    fn(filename, _triggers[idx]);
                }
            }      
        })
        .on("unlink", function(filename) {
            for (var idx in _triggers) {
                if (filename.match(idx)) { 
                    console.log(short_filename + ": removed");  
                    fn(filename, _triggers[idx]);
                };
            }
        });
}
