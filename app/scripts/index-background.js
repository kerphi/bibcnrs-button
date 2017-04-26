import 'babel-polyfill';

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

// chrome.runtime.onConnect.addListener(function(port) {
//   port.onMessage.addListener(function(msg) {
//     console.log('MSG RECEIVED IN THE BACK', msg, port);
//     if (msg.joke == "Knock knock")
//       port.postMessage({question: "Who's there?"});
//     else if (msg.answer == "Madame")
//       port.postMessage({question: "Madame who?"});
//     else if (msg.answer == "Madame... Bovary")
//       port.postMessage({question: "I don't get it."});
//   });
// });