var express = require("express");
var https = require("https");
var http = require("http");
var stream = require("stream");

var app = express();

app.use(express.static("."));

var tap = new stream.Transform();
tap._transform = function(chunk, encoding, callback) {
  console.log(chunk.toString());
  callback(null, chunk);
};

var fetch = function(address, output) {
  var parsed = new URL(address);
  var remote = parsed.protocol == "http:" ? http : https;
  var { host, pathname, search } = parsed;
  var p = remote.get({
    host,
    path: pathname + search,
    headers: {
      "User-Agent": "Radio"
    }
  }, function(proxied) {
    if (proxied.statusCode > 300 && proxied.headers.location) {
      return fetch(proxied.headers.location, output);
    }
    output.writeHead(proxied.statusCode, proxied.headers);
    proxied.pipe(output);
  });
  p.on("error", err => console.error(err));
}

app.get("/proxy", function(req, response) {
  var url = new URL("http://localhost" + req.url);
  var address = url.search.replace(/^\?/, "");
  fetch(address, response);
});

app.listen(process.env.PORT || 8000);