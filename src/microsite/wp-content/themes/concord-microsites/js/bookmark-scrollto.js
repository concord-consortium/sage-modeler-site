;(function($, undefined){
  $(document).ready(function() {
    $('.toc a').click(function(e) {
      e.preventDefault();
      var targetID = jQuery(this).attr('href');
      var targetLoc = $(targetID).offset().top - 100;
      $('html, body').animate({scrollTop: targetLoc}, 500);
    });
    $('a[href="#top"]').click(function(e) {
      e.preventDefault();
      $('html, body').animate({scrollTop: $('#page').offset().top}, 500);
    });
  });
})(jQuery);
