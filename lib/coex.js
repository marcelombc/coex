(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS
        module.exports = factory();
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
    var image,
        canvas,
        context;

    var Coex = function () {};

    // PUBLIC METHODS

    /**
     *
     */
    Coex.prototype.destroy = function () {
        destroyDummyCanvas();

        image = null;
        canvas = null;
        context = null;
    };

    /**
     *
     */
    Coex.prototype.getColors = function (url, callback) {
        image = new Image();

        createDummyCanvas();
        loadImage.call(this, url, callback);
    };

    // PRIVATE METHODS

    /**
     *
     */
    function loadImage(url, callback) {
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

        image.src = url;
        image.onload = function () {
            width = canvas.width = context.width = image.width;
            height = canvas.height = context.height = image.height;

            // draw image in the canvas
            context.drawImage(image, 0, 0);

            // load the image data into an array of pixel data (R, G, B, a)
            imgData = context.getImageData(0, 0, width, height);
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
            sortedColors = sortColors(colors);
            // create a palette of the most used colors
            for (var color in sortedColors) {
                // weed out colors close to those already seen
                colorsValues = color.split(',');
                hexVal = '';

                for (i = 0; i < 3; i += 1) {
                    hexVal += decimalToHex(colorsValues[i]);
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
    }

    /**
     *
     */
    function createDummyCanvas() {
        destroyDummyCanvas();

        canvas = document.createElement('canvas');

        context = canvas.getContext('2d');
        context.width = 1000;
        context.height = 1000;
        context.clearRect(0, 0, 1000, 1000);
    };

    /**
     *
     */
    function destroyDummyCanvas() {
        canvas = null;
        context = null;
    }

    /**
     *
     */
    function sortColors(colors) {
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
    }

    /**
     *
     */
    function decimalToHex(decimal) {
        var hex = Number(decimal).toString(16);

        while (hex.length < 2) {
            hex = '0' + hex;
        }

        return hex;
    }

    return new Coex();
}));
