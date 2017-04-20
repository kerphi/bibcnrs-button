import 'babel-polyfill';

var BibCNRSButton = require('./bibcnrs-button.js');

var bcb = new BibCNRSButton();
bcb.hrefWalker(document.body);
bcb.textWalker2(document.body);
bcb.watchDomModifications();