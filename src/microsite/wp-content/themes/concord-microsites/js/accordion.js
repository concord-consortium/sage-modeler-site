// accordion.js

;(function($, undefined) {

    function init() {
        //script to load full-width-image slider module
        $('.js-accordion').click(toggleAccordion);
        console.log('+==accordion loaded.');
    }

    function toggleAccordion(event) {
        var $element = $(event.currentTarget),
            $content = $element.next('.accordion-item-content');

        if( $element.hasClass('accordion-item-title-block') ){
            toggleAccordion($(event.currentTarget));
            $element.toggleClass('accordion-collapsed');
            $element.toggleClass('accordion-expanded');

            $content.toggleClass('accordion-item--collapsed');
            $content.toggleClass('accordion-item--expanded');
        }
    }

  
  init();
})(jQuery);