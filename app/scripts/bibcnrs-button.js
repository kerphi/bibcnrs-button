
// todo move in a dedicated module
var $ = require('jquery');
$.fn.justtext = function() {
  
  return $(this)  .clone()
      .children()
      .remove()
      .end()
      .text();

};

import queue from 'async/queue';


function debug(obj) { return JSON.stringify(obj); };

var util = require('util');

var EventEmitter = require('events').EventEmitter;
function BibCNRSButton(options) {
  var self  = this;

  options          = options || {};
  self.myopt       = options.myopt || 'coucou';
  self.doiPatternInURL  = /\/\/(doi\.org|dx\.doi\.org|doi\.acm\.org|dx\.crossref\.org).*\/(10\..*(\/|%2(F|f)).*)/;
  self.doiPatternInText = new RegExp('(10\\.\\d{4,5}\\/[\\S]+[^;,.\\s])', 'gi');

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

  // if (btnData.foundDoi !== '10.1103/PhysRevLett.98.175302') {
  //   return cb(0);
  // }

  // btnData.foundDoi = '10.1007/s00701-016-2835-z';

  // matching url:
  // http://search.ebscohost.com/login.aspx?authtype=guest&custid=ns257146&groupid=main&profile=ftf&id=DOI:10.1007/s00701-016-2835-z&direct=true&site=ftf-live
  $.ajax({
    url: 'http://search.ebscohost.com/login.aspx?authtype=guest&custid=ns257146&groupid=main&profile=ftf&id=DOI:' + btnData.foundDoi + '&direct=true&site=ftf-live',
    success : function(data) {
      var proxyUrl = $(data).find('a[data-auto=guest-login-link]').attr('href');
      proxyUrl = proxyUrl.split('?url=')[0] + '?url=';

      var linkoutUrl = $(data).find('div.ftf-results a[data-auto=menu-link]').attr('href');
//      linkoutUrl = 'http://resolver.ebscohost.com' + linkoutUrl;
      
      if (linkoutUrl) {
        console.log('DOI IS AVAILABLE', linkoutUrl, proxyUrl + this.url);
        return cb(1, Object.assign({}, btnData, { btnUrl: proxyUrl + this.url }));
        return 
      } else {
        console.log('DOI IS NOT AVAILABLE', linkoutUrl, this.url);
        return cb(0);
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log('AJAX ERROR', jqXHR, textStatus, errorThrown);
      return cb(0);
    }
  });

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
  domBtnLink.insertAfter(btnData.domElt);
  return cb();
};


BibCNRSButton.prototype.hrefWalker = function () {
  var self = this;

  $('a').each((idX, elt) => {

    // skip already visited links
    if ($(elt).hasClass('bibcnrs-button-link-visited')) return;
    $(elt).addClass('bibcnrs-button-link-visited');

    setTimeout(() => {
      elt.href = decodeURIComponent(elt.href);
      let matches = elt.href.match(self.doiPatternInURL);
      if (matches && matches[2]) {
        let doi = matches[2];
        console.log('DOI FOUND', doi);
        self.queue.push({ foundDoi: doi, domElt: elt });
      }
    }, 10);
  });
};

BibCNRSButton.prototype.textWalker = function () {
  var self = this;

  // just select elements in the DOM containing
  // text with likely contained DOI
  $(":contains(10.)").filter(function () {

    // filter top level DOM element, just keep the leafs
    let isALeaf = ($(this).children().length === 0);
    // or keep floating text matching the simple DOI pattern
    let hasFistLevelTextMatching = ($(this).justtext().indexOf('10.') !== -1);
    // skip already handled links
    let isAVisitedLink = $(this).hasClass('bibcnrs-button-link-visited');

    return !isAVisitedLink && (isALeaf || hasFistLevelTextMatching);
  }).each(function (idX, elt) {

    setTimeout(() => {
      // insert HTML link around the DOI
      var htmlWithDoiLink = $(elt).html().replace(
        self.doiPatternInText,
        '<a href="http://dx.doi.org/$1" class="bibcnrs-button-link-visited">$1</a>'
      );
      $(elt).html(htmlWithDoiLink);

      // send the DOI links to the button hooking queue
      $(elt).find('a.bibcnrs-button-link-visited').each(function (idX, doiLinkElt) {
        setTimeout(() => {
          self.queue.push({ foundDoi: $(doiLinkElt).text(), domElt: doiLinkElt });
        }, 10);
      });
    }, 10);

  });

};


module.exports = BibCNRSButton;

