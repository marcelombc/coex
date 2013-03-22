define(function () {
    'use strict';

    var coex = function () {
        this._image = null;
        this._canvas = null;
        this._context = null;
    };

    /**
     *
     */
    coex.prototype.destroy = function () {
        this._destroyDummyCanvas();

        this._image = null;
        this._canvas = null;
        this._context = null;
    };

    /**
     *
     */
    coex.prototype.getColors = function (url, callback) {
        this._image = new Image();

        this._createDummyCanvas();
        this._loadImage(url, callback);
    };

    /**
     *
     */
    coex.prototype._loadImage = function (url, callback) {
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

        this._image.src = url;
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
            for (; i < length; i += 4) {
                colorString = pix[i] + ',' + pix[i + 1] + ',' + pix[i + 2] + ',' + pix[i + 3];
                if (colors[colorString]) {
                    colors[colorString] += 1;
                } else {
                    colors[colorString] = 1;
                }
            }

            // sort the array with greatest count at top
            sortedColors = this._sortColors(colors);
            // create a palette of the most used colors
            for (var color in sortedColors) {
                // weed out colors close to those already seen
                colorsValues = color.split(',');
                hexVal = '';

                for (i = 0; i < 3; i += 1) {
                    hexVal += this._decimalToHex(colorsValues[i]);
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
    coex.prototype._createDummyCanvas = function () {
        this._destroyDummyCanvas();

        this._canvas = document.createElement('canvas');
        document.body.appendChild(this._canvas);
        this._canvas.style.display = 'none';

        this._context = this._canvas.getContext('2d');
        this._context.width = 1000;
        this._context.height = 1000;
        this._context.clearRect(0, 0, 1000, 1000);
    };

    /**
     *
     */
    coex.prototype._destroyDummyCanvas = function () {
        if (this._canvas) {
            document.body.removeChild(this._canvas);
            this._canvas = null;
            this._context = null;
        }
    };

    /**
     *
     */
    coex.prototype._sortColors = function (colors) {
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
    coex.prototype._decimalToHex = function (decimal) {
        var hex = Number(decimal).toString(16);

        while (hex.length < 2) {
            hex = '0' + hex;
        }

        return hex;
    };

    var Coex = coex;
    return new Coex();
});

