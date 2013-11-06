// Loader configuration
requirejs.config({
    baseUrl: '../',
    paths: {
        'jquery': '../bower_components/jquery/jquery'
    },
    urlArgs: (new Date()).getTime()    // Fix cache issues
});

require([
    'jquery',
    'lib/coex'
], function ($, Coex) {
    'use strict';

    var url,
        coex;

    $('.grid .thumb').on('click', function (e) {
        url = $(e.target).attr('data-thumb-url');
        if (url) {
            coex = new Coex(url, function (colors) {
                /*console.warn(coex.rgbToHex(colors[0]));
                console.warn(colors);
                var contrastColor = coex.getContrastColor(colors);
                console.warn(coex.rgbToHex(contrastColor));
                $('body').css('background', 'rgba(' + colors[0] + ')');*/

                for (var i = 0; i < colors.length; i++) {
                    console.warn(colors[i][1]);
                    $('.visible-spectrum').append('<div class="rgb-color" style="background-color: rgba(' + colors[i][0] + ')"></div>');
                }
            });
        }
    });

    /*coex = new Coex('images/thumbs/1.jpg', function (colors) {
        console.warn(colors);
    });

    coex = new Coex();
    coex.getColors('images/thumbs/2.jpg', function (colors) {
        console.warn(coex.rgbToHex(colors[0]));
        console.warn(colors);
        var contrastColor = coex.getContrastColor(colors);
        console.warn(coex.rgbToHex(contrastColor));
    });*/
});