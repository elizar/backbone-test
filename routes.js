'use strict'; // prevent global leakage
var mongoose = require('mongoose'),
  models = mongoose.models;

exports.get = function(req, res) {
  models.Contact.find({}, function(err, results) {
    res.end(JSON.stringify(results));
  });
};

exports.post = function(req, res) {
  var _body = '';
  req.setEncoding('utf8');
  req.on('data', function(chunk) {
    _body += chunk;
  });
  req.on('end', function() {
    models.Contact.create(JSON.parse(_body), function(err, result) {
      if (err) {
        var _response = {};
        _response.status = 'error';
        _response.code = 200;
        _response.message = 'An error occured';
        _response.error = err;
        return res.end(JSON.stringify(_response));
      }
      return res.end(JSON.stringify(result));
    });
  });
};

exports.put = function(req, res) {
  var _body = '';
  req.setEncoding('utf8');
  req.on('data', function(chunk) {
    _body += chunk;
  });
  req.on('end', function() {
    var _person = JSON.parse(_body);
    var _id = _person._id;
    delete _person._id;
    models.Contact.findOneAndUpdate({_id: _id}, _person, function (docs) {
      return res.end(JSON.stringify(docs));
    });

  });
};

exports.del = function(req, res) {
  models.Contact.remove({_id: req.url.split('/')[2]}, function (err, person) {
    if (err) {
      return res.end(JSON.stringify(err));
    }
    return res.end(JSON.stringify(person));
  });
};
