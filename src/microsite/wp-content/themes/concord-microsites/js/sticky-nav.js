;(function($, undefined){
  $(window).scroll(function() {
    if ($(window).width() >= 951 && $(window).scrollTop() > 0) {
      $('.concord-header-contain').addClass('fixed');
    } else {
      $('.concord-header-contain').removeClass('fixed');
    }
  });
})(jQuery);