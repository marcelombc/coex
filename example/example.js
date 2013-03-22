// Loader configuration
requirejs.config({
    baseUrl: '../',
    urlArgs: (new Date()).getTime()    // Fix cache issues
});

require([
    'lib/coex'
], function (coex) {
    'use strict';

    $('.grid .thumb').on('click', function (e) {
        var url = $(e.target).attr('data-thumb-url');
        if (url) {
            coex.getColors(url, function (colors) {
                $('body').css('background', colors[0]);
            });
        }
    });
});