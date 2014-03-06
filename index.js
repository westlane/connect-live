/*! * 
 * Live - Connect Middleware
 * Copyright(c) 2014 Paper & Equator, LLC
 * Copyright(c) 2014 West Lane
 * MIT Licensed
 */


 var send = require("send")
    , path = require("path")
    , socket = require("socket.io")
    , bind = require("./lib/bind");

exports = module.exports =  function(root, options) {

    // root required
    if (!root) throw new Error('live() root path required');

    // allow custom-defined search phrase
    options = options || {};
    options.search = options.search || /<\/body>/;

    // setup socket.io instance
    var io = null;
    function onChange(filename, targets) {
        io.sockets.emit("refresh", {
            filename: filename,
            targets: targets
        });
        // allow custom onChange event
        if (options.onChange && typeof(options.onChange) == "function") {
            options.onChange.apply(this, arguments);
        }
    }
    
    return function Watch(req, res, next) {

        // create socket.io link for browser
        if (!io) {
            io = socket.listen(res.connection.server);
            io.set("log level", 1);            
        }
    
        var writeHead = res.writeHead
            , write = res.write
            , end = res.end
            , content_type = null
            , content_length = null
            html_inject = '    <script src="/__refresh__.js"></script>\n';


        // serve watcher client-side script
        if (req.url == "/__refresh__.js") {
            return send(req,  "/refresh.js")
                .root(__dirname + '/public')
                .pipe(res);
        }

        //overload writeHead() to knock out any pre-defined content length
        res.writeHead = function(statusCode, reasonPhrase, headers) {
            if (content_type == "text/html") res.removeHeader("content-length");
            writeHead.apply(res, arguments);
        }

        //overload write() to inject script in HTML
        res.write = function(chunk, encoding){
            if (content_type === null) {
                content_type = res.getHeader("content-type")
                    .match(/[a-z]*\/[a-z]*/)[0];
            }
            if (content_type == "text/html") {      
                content_length += getSize(chunk);
                var content = String(chunk);
                if (content.match(options.search)) {
                    var new_content = content.replace(options.search, html_inject + '$&');
                    // transform chunk with script insert
                    chunk = Buffer(new_content, "utf8");
                } 
            }
            write.apply(res, arguments);
        }
    
        //overload end() to keep track of files to watch
        res.end = function(chunk, encoding){
            // pass through contents first
            if (chunk) {
                this.write(chunk, encoding);
            }

            end.call(res);

            // now watch any requested URL or includes
            // assume we're serving static files based on root
            // also support connect-compile middleware
            var files = req.files || [];
            var main_file = path.resolve(root + req.url);
            files.push(main_file)
            for (var idx in files) {
                bind(files[idx], req.url, content_type, onChange);
            }
        };
        next();
    }
}

function getSize(chunk) {
  return Buffer.isBuffer(chunk)
    ? chunk.length
    : Buffer.byteLength(chunk);
}
