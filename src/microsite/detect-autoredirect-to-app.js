// used to autoredirect old root links to sagemodeler.concord.org to the app folder
(function () {
  var hasHash = window.location.hash.length > 0;
  var hasQuery = window.location.search.length > 0;
  var hasGAQuery = window.location.search.indexOf("utm_") !== -1;
  var inIFrame = false;
  try {
    inIFrame = window.self !== window.top;
  } catch (e) {
    inIFrame = true;
  }

  // do not redirect if there are Google Analytic params
  if (!hasGAQuery && (hasHash || hasQuery || inIFrame)) {
    var newLocation = "app/" + window.location.search + window.location.hash;
    window.location = newLocation;
  }
})();