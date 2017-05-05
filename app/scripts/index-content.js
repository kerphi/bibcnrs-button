import 'babel-polyfill';
import uuidV4 from 'uuid/v4';


var BibCNRSButton = require('./bibcnrs-button.js');

var bcb = new BibCNRSButton({ checkIfDoiIsAvailableFromTheBack });
bcb.hrefWalker(document.body);
bcb.textWalker2(document.body);
bcb.watchDomModifications();



function checkIfDoiIsAvailableFromTheBack(doi, cb) {
  let uuid = uuidV4();
  port.postMessage({commandId: uuid, doi: doi});
  commands[uuid] = cb;
}


var commands = {};
var port = chrome.runtime.connect({name: "bibcnrs-button"});


// checkIfDoiIsAvailableFromTheBack('10.1007/s00701-016-2835-z', function (found, res) {
//   console.log('MSG OK ?');
//   console.log('MSG TADA', found, res);
// })

port.onMessage.addListener(function (msg) {
//  console.log('MSG RECEIVED IN THE CONTENT', msg, commands);
  commands[msg.commandId](msg.found, msg.result);
  delete commands[msg.commandId];
});