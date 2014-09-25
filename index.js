var io = require('socket.io-client');
var Promise = require('promise');

function WDWSClient(url, options) {
  this.url = url;
  this.options = options || {};
}

WDWSClient.prototype.connect = function(callback) {
  this.socket = io(this.url, this.options.socket || {});
  if (callback) { this.socket.on('connect', callback); };
}

WDWSClient.prototype.run = function(cmd, params, callback) {
  if (!this.socket) { throw "ERROR: Must run connect() before executing commands." };
  var that = this;
  return new Promise(function(resolve, reject) {
    that.socket.emit(cmd, params, function(err) {
      var rest = Array.prototype.slice.call(arguments, 1);
      err ? reject(err) : resolve.apply(null, rest);
    });
  }).nodeify(callback);
}

module.exports = WDWSClient;