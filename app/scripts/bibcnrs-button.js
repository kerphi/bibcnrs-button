import queue from 'async/queue';

var $ = require('jquery');

function debug(obj) { return JSON.stringify(obj); };

var util = require('util');

var EventEmitter = require('events').EventEmitter;
function BibCNRSButton(options) {
  var self  = this;

  options          = options || {};
  self.myopt       = options.myopt || 'coucou';
  self.doiPattern = /\/\/(dx\.doi\.org|doi\.acm\.org|dx\.crossref\.org).*\/(10\..*(\/|%2(F|f)).*)/;
  
  // handle found DOI in the DOM asynchrononsly
  // to be gentle with the web browser
  self.queueConcurrency = 1;
  self.queue = queue(
    (btnData, cb) => {
      self.checkIfDoiIsAvailable(btnData, function (found, btnData2) {
        if (found) {
          self.tryToHookAButton(btnData2, cb);
        } else {
          return cb();
        }
      });
    },
    self.queueConcurrency
  );
}
util.inherits(BibCNRSButton, EventEmitter);
module.exports = BibCNRSButton;

/**
 * Checks if the DOI is available in the subscribed 
 * BibCNRS packages thanks to EBSCO FTF
 */
BibCNRSButton.prototype.checkIfDoiIsAvailable = function (btnData, cb) {
  var self = this;
  //console.log('CHECKING DOI AVAILABILITY', btnData.foundDoi);
  if (btnData.foundDoi == '10.1103/PhysRevLett.98.175302') {


    // TODO check if the DOI is in the bibcnrs package

    return cb(1, Object.assign({}, btnData, {btnUrl: 'http://www.google.fr'}));
  } else {
    return cb(0);
  }
};

/**
 * Hook a HTML button in the web page where 
 * the DOI has been found .
 */
BibCNRSButton.prototype.tryToHookAButton = function (btnData, cb) {
  var self = this;
  console.log('HOOK A BUTTON ON THIS DOI', btnData.foundDoi, btnData.btnUrl);

  var domBtnLink = $('<a target="_blank" href="" class="bibcnrs-button-link"></a>').attr('href', btnData.btnUrl);
  var domBtnBox  = $('<span class="bibcnrs-button-box"></span').text('INEE');
  var domBtnIcon = $('<span class="bibcnrs-button-icon"></span>');

  domBtnLink.append(domBtnBox);
  domBtnLink.append(domBtnIcon);
  domBtnLink.appendTo(btnData.domElt.parentNode);
  return cb();
};

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
        //console.log('DOI FOUND', doi);
        self.queue.push({ foundDoi: doi, domElt: elt });
      }
    }, 10);
  });
};


module.exports = BibCNRSButton;