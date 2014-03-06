var request = require('request'),
    http = require('http'),
    connect = require('connect'),
    middleware = require("../index")

var server = null;

function Helpers() {};

Helpers.prototype.startServer = function(done) {
    if (server) return done();
    var app = connect();
    app.use(middleware(__dirname + "/public", {
        onChange: function(filename, targets) {
            console.log("Change: ", filename, targets);
        }
    }));
    app.use(connect.static(__dirname + "/public"));
    app.use(function(err, req, res, next) { 
        res.writeHead(500, {"Content-Type":"application/json"});
        res.end(String(err));
    });
    server = http.createServer(app).listen(4567, done);
};

Helpers.prototype.get = function(url, done) {
    request("http://localhost:4567/" + url, function (err,resp,body) {
        if (done && typeof(done) == "function") {
            done(err,resp,body);
        }
    });
};

exports = module.exports = new Helpers();
