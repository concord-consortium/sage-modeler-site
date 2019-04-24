(function($, undefined) {
  var $videoModules = $('.video-container');

  function init() {
    $videoModules.on('click', '.preview-image', clickedOverlay);
  }

  function clickedOverlay(e) {
    // pause slider if video is contained within one
    if ($(this, '.lead-slide').length == 1) {
      console.log('slider');
      jQuery('.js-lead-slider').slick('slickPause');
    }
    // Animation for the overlay to fade out.
    $(this).fadeTo(400, 0, playVideo);
  }

  function playVideo(e) {
    // Set height of section to match video when playing.
    // Allows section to resize responsively before playing.

    var _this = this,
        sectionHeight;

    // Setting overlay to be invisible but underneath.
    // Keeping the overlay image because it is setting the space for the embedded video responsively
    $(this).css('z-index', '-1');
    $(this).css('visibility', 'hidden');

    var $iframe = $(_this).next('.embed').find('iframe'),
        src = $iframe.attr('src');

    if (~ src.indexOf('?')) {
      $iframe.get(0).src += '&autoplay=1';
    }
    else {
      $iframe.get(0).src += '?autoplay=1';
    }
  }

  $(init);

})(jQuery);
