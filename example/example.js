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
    'lib/Coex'
], function ($, Coex) {

    'use strict';

    var url,
        coex,
        contrastColor;

    $('.grid .thumb').on('click', function (e) {
        url = $(e.target).attr('data-url');
        if (url) {
            coex = new Coex(url, 8);
            coex.get(function (err, colors) {
                if (err) {
                    throw err;
                }

                $('.color-palette').find('.color').remove();
                for (var i = 0, length = colors.length; i < length; i += 1) {
                    $('.color-palette').append('<div class="color" style="background-color: rgb(' + colors[i].red + ',' + colors[i].green + ',' + colors[i].blue + ')"></div>');
                }

                $('body').css('background', 'rgb(' + colors[0].red + ',' + colors[0].green + ',' + colors[0].blue + ')');

                contrastColor = coex.getContrastColor(colors);

                $('.color-palette').css('background', 'rgb(' + contrastColor.red + ',' + contrastColor.green + ',' + contrastColor.blue + ')');

                coex.destroy();
            });
        }
    });
});