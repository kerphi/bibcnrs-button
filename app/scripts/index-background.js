import 'babel-polyfill';
import $ from './bibcnrs-jquery.js';
import lscache from 'lscache';

// ok matching url example:
// http://search.ebscohost.com/login.aspx?authtype=guest&custid=ns257146&groupid=main&profile=ftf&id=DOI:10.1007/s00701-016-2835-z&direct=true&site=ftf-live
console.log('BACKGROUND');    
// not in the cache so ask EBSCO !
// $.ajax({
//   url: 'http://search.ebscohost.com/login.aspx?authtype=guest&custid=ns257146&groupid=main&profile=ftf&id=DOI:10.1007/s00701-016-2835-z&direct=true&site=ftf-live',
//   success : function (data) {
//     console.log('BACKGROUND AJAX OK', data);    
//   },
//   error: function (jqXHR, textStatus, errorThrown) {
//     console.log('BACKGROUND AJAX ERROR', jqXHR, textStatus, errorThrown);
//   }
// });

chrome.runtime.onConnect.addListener(function(port) {
  if (port.name !== 'bibcnrs-button') return;
  port.onMessage.addListener(function (command) {
//    console.log('MSG RECEIVED IN THE BACK', command, port);
    checkIfDoiIsAvailable(command.doi, function (found, result) {
      port.postMessage({ commandId: command.commandId, found: found, result: result });
    })
  });
});


/**
 * Checks if the DOI is available in the subscribed 
 * BibCNRS packages thanks to EBSCO FTF
 */
// 1 mounth by default for the cache
var cacheTTL = 60*24*30
function checkIfDoiIsAvailable(doi, cb) {

  // check if this AJAX response is stored in the cache or not
  let cachedData = lscache.get(doi)
  if (cachedData) {
    // if (cachedData.found) {
    //   console.log('DOI IS AVAILABLE (cached)', doi);
    // } else {
    //   console.log('DOI IS NOT AVAILABLE (cached)', doi);
    // }
    return cb(cachedData.found, Object.assign({}, cachedData));
  }
  // ok matching url example:
  // http://search.ebscohost.com/login.aspx?authtype=guest&custid=ns257146&groupid=main&profile=ftf&id=DOI:10.1007/s00701-016-2835-z&direct=true&site=ftf-live

  // not in the cache so ask EBSCO !
  $.ajax({
    url: 'https://search.ebscohost.com/login.aspx?authtype=guest&custid=ns257146&groupid=main&profile=ftf&id=DOI:' + doi + '&direct=true&site=ftf-live',
    success : function(data) {
      var proxyUrl = $(data).find('a[data-auto=guest-login-link]').attr('href');
      proxyUrl = proxyUrl.split('?url=')[0] + '?url=';
      var linkoutUrl = $(data).find('div.ftf-results a[data-auto=menu-link]').attr('href');
      if (linkoutUrl) {
        //console.log('DOI IS AVAILABLE', doi);
        lscache.set(doi, { found: 1, btnUrl: proxyUrl + this.url }, cacheTTL);
        return cb(1, { btnUrl: proxyUrl + this.url });
      } else {
        //console.log('DOI IS NOT AVAILABLE', doi);
        lscache.set(doi, { found: 0 }, cacheTTL);
        return cb(0);
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error('bibcnrs-button AJAX ERROR', jqXHR, textStatus, errorThrown);
      return cb(0);
    }
  });

};