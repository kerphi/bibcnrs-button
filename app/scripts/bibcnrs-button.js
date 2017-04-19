import $       from './bibcnrs-jquery.js';
import queue   from 'async/queue';
import lscache from 'lscache';
import util    from 'util';

function debug(obj) { return JSON.stringify(obj); };

var EventEmitter = require('events').EventEmitter;
function BibCNRSButton(options) {
  var self  = this;

  options          = options || {};
  
  // 1 mounth by default for the cache
  self.cacheTTL    = options.cacheTTL || 60*24*30; 

  self.myopt       = options.myopt || 'coucou';
  self.doiPatternInURL  = /\/\/(doi\.org|dx\.doi\.org|doi\.acm\.org|dx\.crossref\.org).*\/(10\..*(\/|%2(F|f)).*)/;
  self.doiPatternInText = new RegExp('(10\\.\\d{4,5}\\/[\\S]+[^;,.\\s])', 'gi');

  // handle found DOI in the DOM asynchrononsly
  // to be gentle with the web browser
  self.queueConcurrency = 1;
  self.queue = queue(
    (btnData, cb) => {
      self.checkIfDoiIsAvailable(btnData, function (found, btnData2) {
        console.log('MMMMM', found, debug(btnData2));
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

  // check if this AJAX response is stored in the cache or not
  let cachedData = lscache.get(btnData.foundDoi)
  if (cachedData) {
    if (cachedData.found) {
      console.log('DOI IS AVAILABLE (cached)', btnData.foundDoi);
    } else {
      console.log('DOI IS NOT AVAILABLE (cached)', btnData.foundDoi);
    }
    return cb(cachedData.found, Object.assign({}, btnData, cachedData));
  }

  // ok matching url example:
  // http://search.ebscohost.com/login.aspx?authtype=guest&custid=ns257146&groupid=main&profile=ftf&id=DOI:10.1007/s00701-016-2835-z&direct=true&site=ftf-live

  // not in the cache so ask EBSCO !
  $.ajax({
    url: 'http://search.ebscohost.com/login.aspx?authtype=guest&custid=ns257146&groupid=main&profile=ftf&id=DOI:' + btnData.foundDoi + '&direct=true&site=ftf-live',
    success : function(data) {
      var proxyUrl = $(data).find('a[data-auto=guest-login-link]').attr('href');
      proxyUrl = proxyUrl.split('?url=')[0] + '?url=';
      var linkoutUrl = $(data).find('div.ftf-results a[data-auto=menu-link]').attr('href');
      if (linkoutUrl) {
        console.log('DOI IS AVAILABLE', btnData.foundDoi);
        lscache.set(btnData.foundDoi, { found: 1, btnUrl: proxyUrl + this.url }, self.cacheTTL);
        return cb(1, Object.assign({}, btnData, { btnUrl: proxyUrl + this.url }));
      } else {
        console.log('DOI IS NOT AVAILABLE', btnData.foundDoi);
        lscache.set(btnData.foundDoi, { found: 0 }, self.cacheTTL);
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
  var domBtnBox  = $('<span class="bibcnrs-button-box"></span').text('BibCNRS INEE');
  var domBtnIcon = $('<span class="bibcnrs-button-icon"></span>');

  domBtnLink.append(domBtnBox);
  domBtnLink.append(domBtnIcon);
  domBtnLink.insertAfter(btnData.domElt);
  return cb();
};


BibCNRSButton.prototype.hrefWalker = function (rootElt) {
  var self = this;
  rootElt = rootElt || document.documentElement;

  $(rootElt).find('a').each((idX, elt) => {

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

BibCNRSButton.prototype.textWalker = function (rootElt) {
  var self = this;
  rootElt = rootElt || document.documentElement;

  // just select elements in the DOM containing
  // text with likely contained DOI
  $(rootElt).find(":contains(10.)").filter(function () {

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
        '<a href="" class="bibcnrs-button-link-visited">$1</a>'
      );
      $(elt).html(htmlWithDoiLink);

      // send the DOI links to the button hooking queue
      $(elt).find('a.bibcnrs-button-link-visited').each(function (idX, doiLinkElt) {
        setTimeout(() => {
          $(doiLinkElt).attr('href', 'http://dx.doi.org/' + $(doiLinkElt).text());
          self.queue.push({ foundDoi: $(doiLinkElt).text(), domElt: doiLinkElt });
        }, 10);
      });
    }, 10);

  });

};

/**
 * Listen for DOM dynamic modifications
 * and walk into it to try to detect DOI inside.
 */
BibCNRSButton.prototype.watchDomModifications = function () {
  var self = this;
  $(document).bind("DOMSubtreeModified", function (event) {
    if ($(event.target).hasClass('bibcnrs-button-link-visited')) return;
    // self.hrefWalker(event.target);
    // self.textWalker(event.target);
  });
};


module.exports = BibCNRSButton;

