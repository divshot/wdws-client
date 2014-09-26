var io = require('socket.io-client');
var Promise = require('promise');
var EventEmitter = require('events').EventEmitter;

function WDWSClient(url, options) {
  this.url = url;
  this.options = options || {};
  this.pid = 10000;
  this.emitters = [];
}

WDWSClient.prototype.connect = function() {
  if (this.socket) {
    this.socket.connect();
  } else {
    this.initializeSocket();
  }  
}

WDWSClient.prototype.initializeSocket = function() {
  this.socket = io(this.url, this.options.socket || {});
  this.socket.on('pm', this.dispatchProcessMessage.bind(this));
}

WDWSClient.prototype.dispatchProcessMessage = function(pid, event) {
  var args = Array.prototype.slice.call(arguments, 1);
  var emitter = this.emitters[pid];
  emitter && emitter.emit(args);
}

WDWSClient.prototype.on = function(event, callback) {
  if (!this.socket) { throw "ERROR: Can't listen for socket events until after you call connect()"; };
  this.socket.on(event, callback);
}

WDWSClient.prototype.disconnect = function(callback) {
  this.socket.disconnect();
}

WDWSClient.prototype.nextPid = function() {
  return ++this.pid;
}

WDWSClient.prototype.run = function(cmd, params, callback) {
  var newPid = this.nextPid();
  params.pid = newPid;
  
  if (!this.socket) { throw "ERROR: Must run connect() before executing commands." };
  
  var that = this;
  var promise = new Promise(function(resolve, reject) {
    that.socket.emit(cmd, params, function(err) {
      var rest = Array.prototype.slice.call(arguments, 1);
      err ? reject(err) : resolve.apply(null, rest);
    });
  }).nodeify(callback);
  
  if (params.subscribe) {
    var emitter = new EventEmitter();
    this.emitters[newPid] = emitter;
    promise.on = function() {
      emitter.on.apply(emitter, arguments);
      return promise;
    }
  }
  
  return promise;
}

module.exports = WDWSClient;