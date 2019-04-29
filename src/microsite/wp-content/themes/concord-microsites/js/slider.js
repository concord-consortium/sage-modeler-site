;(function($, undefined) {



  function init() {
    //script to load lead-image slider module
    $('.js-lead-slider').slick({
        autoplay: true,
        autoplaySpeed: 5000,
        dots: false,
        draggable: false,
        nextArrow: '<a class="slick-next"><i class="icon-arrow-circle-right"></i></a>',
        prevArrow: '<a class="slick-prev"><i class="icon-arrow-circle-left"></i></a>',
        slidesToShow: 1,
        slidesToScroll: 1,
    });
    console.log('+==full width image sliders loaded.');


    //script to load full-width-image slider module
    $('.js-slick-slider').slick({
        autoplay: true,
        autoplaySpeed: 5000,
        draggable: false,
        slidesToShow: 1,
        slidesToScroll: 1,
        dots: false,
        prevArrow: '<a class="slick-prev"><i class="icon-arrow-circle-left"></i></a>',
        nextArrow: '<a class="slick-next"><i class="icon-arrow-circle-right"></i></a>',
    });
    console.log('+==full width image sliders loaded.');


    //script to load body slidshow module
    $('.js-slideshow').slick({
        adaptiveHeight: true,
        arrows: false,
        autoplay: false,
        draggable: true,
        fade: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        dots: true,
    });
    console.log('+==body slideshow loaded.');


  //script to load body carousel module
  $('.js-carousel').slick({
        adaptiveHeight: true,
        autoplay: false,
        draggable: true,
        infinite: false,
        slidesToShow: 4,
        slidesToScroll: 1,
        dots: false,
        prevArrow: '<a class="slick-prev"><i class="icon-arrow-circle-left"></i></a>',
        nextArrow: '<a class="slick-next"><i class="icon-arrow-circle-right"></i></a>',
        responsive: [
            {
              breakpoint: 1350,
              settings: {
                slidesToShow: 4,
                slidesToScroll: 1,
              }
            },
            {
              breakpoint: 1225,
              settings: {
                slidesToShow: 3,
                slidesToScroll: 1,
              }
            },
            {
              breakpoint: 1018,
              settings: {
                slidesToShow: 2,
                slidesToScroll: 1,
              }
            },
            {
              breakpoint: 750,
              settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
              }
            },
        ]
    });
    console.log('+==body carousel loaded.');
  }


  init();
})(jQuery);
