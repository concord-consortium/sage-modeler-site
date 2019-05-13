;(function($, undefined){
  $(document).ready(function() {
    $('.toc a').click(function(e) {
      e.preventDefault();
      var targetOffset = 220;
      if ($('.concord-header-contain').hasClass('fixed')) {
        targetOffset = 100;
      }
      var targetID = jQuery(this).attr('href');
      var targetLoc = $(targetID).offset().top - targetOffset;
      $('html, body').animate({scrollTop: targetLoc}, 500);
    });
    $('a[href="#top"]').click(function(e) {
      e.preventDefault();
      $('html, body').animate({scrollTop: $('#page').offset().top}, 500);
    });

    $(document).ready(function() {
      $('section.category dt').click(function(e){
        e.preventDefault();
        $(this).next('dd').toggle();
      });
    });
  });
})(jQuery);
