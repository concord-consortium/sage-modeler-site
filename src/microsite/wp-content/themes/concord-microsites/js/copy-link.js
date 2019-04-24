// copy link for results.js
// based on https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript/30810322#30810322

;(function($, undefined) {
    var $filterResultsModule = $('.filters-results'),
        $copyLinkButtons = $filterResultsModule.find('.js-link-copy');

    function init() {
        //script to load full-width-image slider module
        $copyLinkButtons.click(copyLinkToClipboard);
        console.log('+==copy link script loaded.');
    }

    function copyLinkToClipboard(event) {
        var $element = $(event.currentTarget),
            copyUrl = event.currentTarget.href;

        event.preventDefault();
        var msg = copyTextToClipboard( copyUrl );
        var $msg = $('<span/>').addClass('copy-msg').text(msg);
        $msg.insertAfter($element);

        setTimeout(function(){ $msg.remove(); }, 3000);
    }

    function copyTextToClipboard(text) {
        var textArea = document.createElement("textarea");
        // Extra styling for added textarea to minimize disruption of styling in IE
        textArea.style.position = 'fixed';
        textArea.style.top = 0;
        textArea.style.left = 0;
        textArea.style.width = '2em';
        textArea.style.height = '2em';
        textArea.style.padding = 0;
        textArea.style.border = 'none';
        textArea.style.outline = 'none';
        textArea.style.boxShadow = 'none';
        textArea.style.background = 'transparent';


        textArea.value = text;

        document.body.appendChild(textArea);

        textArea.select();

        try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'Link copied!' : 'Unable to auto-copy.';

            return msg;

        } catch (err) {
            return "Oops, unable to copy.";
        }

        document.body.removeChild(textArea);
    }

  
  init();
})(jQuery);