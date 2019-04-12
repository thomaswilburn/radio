var express = require("express");
var https = require("https");
var http = require("http");

var app = express();

app.use(express.static("."));

app.get("/proxy", function(req, response) {
  var url = new URL("http://localhost" + req.url);
  var address = url.search.replace(/^\?/, "");
  var parsed = new URL(address);
  var remote = parsed.protocol == "http:" ? http : https;
  var p = remote.get(address, function(proxied) {
    response.writeHead(proxied.statusCode, proxied.headers);
    proxied.pipe(response);
  });
  p.on("error", e => console.error(e));
});

app.listen(process.env.PORT || 8000);