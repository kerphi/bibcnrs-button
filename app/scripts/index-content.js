import 'babel-polyfill';
import $ from './bibcnrs-jquery.js';

var BibCNRSButton = require('./bibcnrs-button.js');

var bcb = new BibCNRSButton();
$(function() {
  bcb.hrefWalker(document.body);
  bcb.textWalker(document.body);
  bcb.watchDomModifications();
});
