import 'babel-polyfill';

var BibCNRSButton = require('./bibcnrs-button.js');

var bcb = new BibCNRSButton();
bcb.hrefWalker(document.body);
bcb.textWalker(document.body);
bcb.watchDomModifications();