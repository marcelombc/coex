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

    var Coex = function (url, callback) {
        this._image = null;
        this._canvas = null;
        this._context = null;

        createDummyCanvas.call(this);

        if (url && callback) {
            this.getColors(url, callback);
        }
    };

    // PUBLIC METHODS

    /**
     *
     */
    Coex.prototype.destroy = function () {
        destroyDummyCanvas.call(this);

        this._image = null;
        this._canvas = null;
        this._context = null;
    };

    /**
     *
     */
    Coex.prototype.getColors = function (url, callback) {
        this._image = new Image();

        loadImage.call(this, url, callback);
    };

    /**
     *
     */
    Coex.prototype.rgbToHex = function (rgb) {
        var rgbValues = rgb.split(','),
            i = 0,
            hexVal = '';

        for (; i < 3; i += 1) {
            hexVal += decimalToHex.call(this, rgbValues[i]);
        }

        return '#' + hexVal;
    };

    Coex.prototype.getContrastColor = function (colors, mainColor) {
        mainColor = mainColor || colors[0];

        var mainColorValues = mainColor.split(','),
            length = colors.length,
            i = mainColor === colors[0] ? 1 : 0,
            j,
            rgbaValues,
            apxColor,
            ratios = [],
            ratiosObj = {},
            maxValue,
            contrastColor;

        for (; i < length; i += 1) {
            apxColor = 0;
            rgbaValues = colors[i].split(',');
            for (j = 0; j < 4; j += 1) {
                apxColor += Math.abs(mainColorValues[j] - rgbaValues[j]);
            }

            ratios.push(apxColor / 4);
            ratiosObj[apxColor / 4] = colors[i];
        }

        console.warn(ratios);
        maxValue = Math.max.apply(Math, ratios);
        console.warn(maxValue);
        console.warn(ratiosObj[maxValue]);

        return ratiosObj[maxValue];
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
            i,
            j,
            length,
            rgbaColors = {},
            hslColors = [],
            rgbaColorString,
            sortedHslColors = [],
            sortedRgbColors = [],

            colorsValues,
            usedColors = [],    // used to see if close color is already seen
            apxColor,
            rgbaValues,
            isValid,
            inc = 0;

        this._image.src = url;
        this._image.crossOrigin = 'Anonymous';
        this._image.onload = function () {
            width = this._canvas.width = this._context.width = this._image.width;
            height = this._canvas.height = this._context.height = this._image.height;

            // draw image in the canvas
            this._context.drawImage(this._image, 0, 0);

            // load the image data into an array of pixel data (R, G, B, a)
            imgData = this._context.getImageData(0, 0, width, height);
            pix = imgData.data;
            length = pix.length;

            // build an array of each color value and respective number of pixels using it
            for (i = 0; i < length; i += 4) {
                rgbaColorString = pix[i] + ',' + pix[i + 1] + ',' + pix[i + 2] + ',' + pix[i + 3];
                if (rgbaColors[rgbaColorString]) {
                    rgbaColors[rgbaColorString] += 1;
                } else {
                    rgbaColors[rgbaColorString] = 1;
                    hslColors.push([rgbToHsl.call(this, rgbaColorString), rgbaColorString]);
                }
            }

            sortedHslColors = hslColors.sort();

            //Retrieving rgb colors
            for (i = 0, length = sortedHslColors.length; i < length; i += 1) {
                sortedRgbColors[i] = [sortedHslColors[i][1], rgbaColors[sortedHslColors[i][1]]];
            }

            //console.warn(sortedRgbColors);

            callback(sortedRgbColors);

            /*// sort the array with greatest count at top
            sortedColors = sortColors.call(this, colors);
            // create a palette of the most used colors
            for (var color in sortedColors) {
                // weed out colors close to those already seen
                colorsValues = color.split(',');

                // check similar colors
                isValid = true;
                for (var usedColor in usedColors) {
                    apxColor = 0;
                    rgbaValues = usedColors[usedColor].split(',');
                    for (i = 0; i < 4; i += 1) {
                        apxColor += Math.abs(colorsValues[i] - rgbaValues[i]);
                    }

                    // aproximate color ratio
                    if ((apxColor / 4) < 30) {
                        isValid = false;
                        break;
                    }
                }

                if (isValid) {
                    usedColors.push(color);
                    inc += 1;
                }

                if (inc > 10) {
                    break;
                }
            }

            callback(usedColors);*/
        }.bind(this);
    }

    /**
     *
     */
    function createDummyCanvas() {
        destroyDummyCanvas.call(this);

        this._canvas = document.createElement('canvas');

        this._context = this._canvas.getContext('2d');
        this._context.width = 1000;
        this._context.height = 1000;
        this._context.clearRect(0, 0, 1000, 1000);
    };

    /**
     *
     */
    function destroyDummyCanvas() {
        this._canvas = null;
        this._context = null;
    }

    function rgbToHsl(color) {
        var colorArr = color.split(','),
            red = colorArr[0] / 255,
            green = colorArr[1] / 255,
            blue = colorArr[2] / 255,
            max = Math.max(red, green, blue),
            min = Math.min(red, green, blue),
            hue,
            saturation,
            lightness = (max + min) / 2,
            delta;

        if (max === min) {
            hue = saturation = 0; // achromatic
        } else {
            delta = max - min;
            saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);

            switch (max) {
            case red:
                hue = (green - blue) / delta + (green < blue ? 6 : 0);
                break;
            case green:
                hue = (blue - red) / delta + 2;
                break;
            case blue:
                hue = (red - green) / delta + 4;
                break;
            }

            hue /= 6;
        }

        return Math.round(hue * 360) + ',' + Math.round(saturation * 100) + ',' + Math.round(lightness * 100);
    }

    /**
     *
     */
    function sortColors(colors) {
        var temp = [],
            key,
            sortedColors = {},
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

    return Coex;
}));
