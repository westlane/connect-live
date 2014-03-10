var should = require("should"),
    helpers = require("./helpers");

describe("inject", function() {
    before(function(done) {
        return helpers.startServer(done);
    });

    it("should inject in HTML", function(done) {
        helpers.get("index.html", function(err, resp, body) {            
            console.log("----"+ body + "-----");
            should.not.exist(err);
            should.exist(body.match("__refresh__.js"));
            return done();
        });
    });

    it("should inject in HTML for default index file", function(done) {
        helpers.get("", function(err, resp, body) {            
            should.not.exist(err);
            should.exist(body.match("__refresh__.js"));
            return done();
        });
    });

    it("should not inject in CSS", function(done) {
        helpers.get("main.css", function(err, resp, body) {
            should.not.exist(err);
            return done();
        });
    });
    
    it("should inject in lots of HTML", function(done) {
        helpers.get("long.html", function(err, resp, body) {            
            should.not.exist(err);
            should.exist(body.match("__refresh__.js"));
            return done();
        });
    });

});
