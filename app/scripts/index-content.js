import 'babel-polyfill';

var BibCNRSButton = require('./bibcnrs-button.js');

var bcb = new BibCNRSButton();
bcb.hrefWalker(document.body);
bcb.textWalker2(document.body);
bcb.watchDomModifications();



// var port = chrome.runtime.connect({name: "knockknock"});
// port.postMessage({joke: "Knock knock"});
// port.onMessage.addListener(function(msg) {
//   console.log('MSG RECEIVED IN THE CONTENT', msg);  
//   if (msg.question == "Who's there?")
//     port.postMessage({answer: "Madame"});
//   else if (msg.question == "Madame who?")
//     port.postMessage({answer: "Madame... Bovary"});
// });