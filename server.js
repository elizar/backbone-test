'use strict'; // Global leaking prevention hahaha
/**
* Module Dependencies
**/
var http = require('http'),
  fs = require('fs'),
  path = require('path'),
  url = require('url'),
  route = require('./routes'),
  mime = {
    ".js": "text/javascript",
    ".css": "text/css",
    ".html": "text/html",
    ".json": "application/json"
  };

  /**
   * Mongoose Stuff
   **/
  var mongoose = require('mongoose');
  mongoose.connect('mongodb://localhost/test');
  var ContactSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    number: {
      type: Number,
      required: true
    },
    username: {
      type: String,
      required: true,
      unique: true
    }
  }, {
    strict: true
  });

  mongoose.model('Contact', ContactSchema);

var routes = {
  "/": function(req, res) {
    res.end(fs.readFileSync('index.html', 'utf-8'));
  },
  "/contacts": function(req, res) {
    switch (req.method.toLowerCase()) {
      case 'get':
        route.get(req, res);
        break;
      case 'post':
        route.post(req, res);
        break;
      case 'put':
        route.put(req, res);
        break;
      case 'delete':
        route.del(req, res);
        break;
    }
  }
},
  server = http.createServer(function(req, res) {

    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    var _path = path.join(__dirname, req.url);
    if (path.extname(_path) !== "") {
      fs.exists(_path, function(exists) {
        if (exists) {
          fs.readFile(_path, function(err, data) {
            if (!err) {
              res.writeHead(200, {
                "Content-Type": mime[path.extname(_path)]
              });
              res.end(data);
            }
          });
        } else {
          // Render 404.html
          res.statusCode = 404;
          res.end("<h1>Error 404: Not Found!</h1>");
        }
      });

      return;

    }
    try {
      return routes[req.url](req, res);
    } catch (e) {
      var m = req.url.match(/contacts.+/);
      if (m) {
        return routes['/contacts'](req, res);
      }
    }
    // Render 404 page
    res.statusCode = 404;
    res.end("<h1>Error 404: Not Found!</h1>");

  });

server.listen(3000);

console.log("Server listening to port 3000");
