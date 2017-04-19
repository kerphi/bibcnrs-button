import $ from 'jquery';

$.fn.justtext = function() {
  return $(this)
    .clone()
    .children()
    .remove()
    .end()
    .text();
};

module.exports = $;