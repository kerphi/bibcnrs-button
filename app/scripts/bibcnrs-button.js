var util       = require('util');

var EventEmitter = require('events').EventEmitter;
function BibCNRSButton(options) {
  var self  = this;

  options          = options || {};
  self.myopt       = options.myopt || 'coucou';
}
util.inherits(BibCNRSButton, EventEmitter);
module.exports = BibCNRSButton;

BibCNRSButton.prototype.myAction = function (data) {
  var self = this;
  console.log('MY ACTION', data);
};

module.exports = BibCNRSButton;