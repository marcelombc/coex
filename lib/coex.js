(function (factory) {
    if (typeof exports === 'object') {
        // Node/CommonJS
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        define(factory);
    } else {
        // Browser globals (with support for web workers)
        var glob;
        try {
            glob = window;
        } catch (e) {
            glob = self;
        }

        glob.coex = factory();
    }
}(function (undefined) {

    'use strict';

    // private variables
    var __image,
        __canvas,
        __context;

    var Coex = function () {};

    // PUBLIC METHODS

    /**
     *
     */
    Coex.prototype.destroy = function () {
        __destroyDummyCanvas();

        __image = null;
        __canvas = null;
        __context = null;
    };

    /**
     *
     */
    Coex.prototype.getColors = function (url, callback) {
        __image = new Image();

        __createDummyCanvas();
        __loadImage.call(this, url, callback);
    };

    // PRIVATE METHODS

    /**
     *
     */
    function __loadImage (url, callback) {
        var width,
            height,
            imgData,
            pix,
            i = 0,
            length,
            colors = [],
            hexColors = [],
            colorString,
            sortedColors,
            colorsValues,
            hexVal,
            usedColors = [],    // used to see if close color is already seen
            apxColor,
            rgbaValues,
            isValid,
            inc = 0;

        __image.src = url;
        __image.onload = function () {
            width = __canvas.width = __context.width = __image.width;
            height = __canvas.height = __context.height = __image.height;

            // draw image in the canvas
            __context.drawImage(__image, 0, 0);

            // load the image data into an array of pixel data (R, G, B, a)
            imgData = __context.getImageData(0, 0, width, height);
            pix = imgData.data;
            length = pix.length;

            // build an array of each color value and respective number of pixels using it
            for (; i < length; i += 4) {
                colorString = pix[i] + ',' + pix[i + 1] + ',' + pix[i + 2] + ',' + pix[i + 3];
                if (colors[colorString]) {
                    colors[colorString] += 1;
                } else {
                    colors[colorString] = 1;
                }
            }

            // sort the array with greatest count at top
            sortedColors = __sortColors(colors);
            // create a palette of the most used colors
            for (var color in sortedColors) {
                // weed out colors close to those already seen
                colorsValues = color.split(',');
                hexVal = '';

                for (i = 0; i < 3; i += 1) {
                    hexVal += __decimalToHex(colorsValues[i]);
                }

                // check similar colors
                isValid = true;
                for (var usedColor in usedColors) {
                    apxColor = 0;
                    rgbaValues = usedColors[usedColor].split(',');
                    for (i = 0; i < 4; i += 1) {
                        apxColor += Math.abs(colorsValues[i] - rgbaValues[i]);
                    }

                    if ((apxColor / 4) < 30) {
                        isValid = false;
                        break;
                    }
                }

                if (isValid) {
                    hexColors.push('#' + hexVal);
                    usedColors.push(color);
                    inc++;
                }

                if (inc > 10) {
                    break;
                }
            }

            callback(hexColors);

            this.destroy();
        }.bind(this);
    };

    /**
     *
     */
    function __createDummyCanvas () {
        __destroyDummyCanvas();

        __canvas = document.createElement('canvas');

        __context = __canvas.getContext('2d');
        __context.width = 1000;
        __context.height = 1000;
        __context.clearRect(0, 0, 1000, 1000);
    };

    /**
     *
     */
    function __destroyDummyCanvas () {
        __canvas = null;
        __context = null;
    };

    /**
     *
     */
    function __sortColors (colors) {
        var temp = [],
            key,
            sortedColors = [],
            i = 0,
            length;

        for (key in colors) {
            temp.push([key, colors[key]]);
        }

        temp.sort(function () {
            return arguments[1][1] - arguments[0][1];
        });

        length = temp.length;
        for (; i < length; i += 1) {
            sortedColors[temp[i][0]] = temp[i][1];
        }

        return sortedColors;
    };

    /**
     *
     */
    function __decimalToHex (decimal) {
        var hex = Number(decimal).toString(16);

        while (hex.length < 2) {
            hex = '0' + hex;
        }

        return hex;
    };

    return new Coex();
}));