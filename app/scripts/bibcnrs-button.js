var $ = require('jquery');

function d(obj) { return JSON.stringify(obj); };

var util = require('util');

var EventEmitter = require('events').EventEmitter;
function BibCNRSButton(options) {
  var self  = this;

  options          = options || {};
  self.myopt       = options.myopt || 'coucou';
  self.doiPattern = /\/\/(dx\.doi\.org|doi\.acm\.org|dx\.crossref\.org).*\/(10\..*(\/|%2(F|f)).*)/;
}
util.inherits(BibCNRSButton, EventEmitter);
module.exports = BibCNRSButton;

BibCNRSButton.prototype.myAction = function (data) {
  var self = this;
  console.log('MY ACTION', data);
  $('body').attr('data-ok', 'test');
  $('p').css('color', 'red');
};

BibCNRSButton.prototype.hrefWalker = function () {
  var self = this;

  $('a').each((idX, elt) => {
    setTimeout(() => {
      elt.href = decodeURIComponent(elt.href);
      let matches = elt.href.match(self.doiPattern);
      if (matches && matches[2]) {
        let doi = matches[2];
        console.log('DOI FOUND', doi);
      }
    }, 10);
  });
};


module.exports = BibCNRSButton;