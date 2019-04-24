;(function($, undefined){
  $.mobileNav = function(el, $el, options){
    var _this = this,
        target,
        $target,
        dataAttr,
        openerVal,
        closerVal,
        $subnavOpener = $('.main-nav .mobile-expand');

    // Access to jQuery and DOM versions of element
    _this.$el = $el;
    _this.el = el;

    function init(){
      _this.options = $.extend({},$.mobileNav.defaults, options);
      _this.$target = $(_this.options.target);
      _this.$el.click(_this.toggleNav);
      getScreenSize();
      $(window).resize(getScreenSize);

    }

    function getScreenSize() {
      if (window.innerWidth < 950) {
        setListeners();
      } else {
        removeListeners();
        // handle the menu in nav_delay.js for >= 950px
      }
    }

    function setListeners() {
      $subnavOpener.unbind('click').click(_this.toggleSubnav);
    }

    function removeListeners() {
      $subnavOpener.unbind('click');
    }

    _this.toggleNav = function(e) {
      e.preventDefault();

      if (_this.$target.attr(_this.options.dataAttr) === 'open') {
        // if it's open, close it
        _this.$target.attr(_this.options.dataAttr, 'closed');
        $("body, html").removeClass('noscroll');
      } else {
        // if it's closed... open it
        _this.$target.attr(_this.options.dataAttr, 'open');
        $("body, html").addClass('noscroll');
      }

    };

    _this.toggleSubnav = function(e) {
      var $parent = $(this).parent();
      var $menu = $parent.find('ul');

      if ( $parent.hasClass('active') ) {
        $menu.animate({
          opacity: 0,
        }, 100, function() {
          $parent.removeClass('active');
        });
      } else {
        $parent.siblings().removeClass('active');
        $menu.animate({
          opacity: 1,
        }, 100, function() {
          $parent.addClass('active');
        });
      }
    };

    // Run initializer
    init();
  };

  // default settings
  $.mobileNav.defaults = {
    dataAttr: 'data-mobile-nav',
    openerVal: 'opener',
    closerVal: 'closer',
  };

  // our jQuery plugin magic.
  $.fn.mobileNav = function(options){

    return this.each(function(idx, el) {
      var $el = $(el),
          key = 'mobileNav';

      // Only create the plugin instance if it doesn't exist
      if (!$el.data(key)) {
        // Store plugin object in this element's data
        $el.data(key, new $.mobileNav(el, $el, options));
      }

    });

  };

  // Set Body to Fixed to Avoid Scroll

})(jQuery);
