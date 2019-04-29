// used to autoredirect old root links to sagemodeler.concord.org to the app folder

var hasHash = window.location.hash.length > 0;
var hasQuery = window.location.search.length > 0;
var inIFrame = false;
try {
  inIFrame = window.self !== window.top;
} catch (e) {
  inIFrame = true;
}

if (hasHash || hasQuery || inIFrame) {
  var newLocation = "app/" + window.location.search + window.location.hash;
  window.location = newLocation;
}