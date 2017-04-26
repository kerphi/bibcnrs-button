module.exports.debug = function (obj) { return JSON.stringify(obj); };

module.exports.getFullPath = function (el) {
  var path = [];
  do {
    path.unshift(el.nodeName + (el.className ? ' class="' + el.className + '"' : ''));
  } while ((el.nodeName.toLowerCase() != 'html') && (el = el.parentNode));
  return path.join(" > ");
}