var APP = (function($, undefined) {

  var app = {};

  function init() {
    $('.mobile-nav-btn').mobileNav({ target: 'body' });
  }

  $(init);

  return app;

} (jQuery));
