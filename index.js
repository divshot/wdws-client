var io = require('socket.io-client');
var Promise = require('promise');

function WDWSClient(url) {
  this.io = io(url);
}

WDWSClient.prototype.run = function(cmd, params, callback) {
  var that = this;
  return new Promise(function(resolve, reject) {
    that.io.emit(cmd, params, function(err) {
      var rest = Array.prototype.slice.call(arguments, 1);
      err ? reject(err) : resolve.apply(null, rest);
    });
  }).nodeify(callback);
}

module.exports = WDWSClient;