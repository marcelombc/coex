(function (factory) {

    'use strict';

    if (typeof define === 'function' && define.amd) {
        // AMD.
        define(['./VBox'], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS.
        module.exports = factory(require('./VBox'));
    } else {
        // Browser globals (with support for web workers).
        var glob;
        try {
            glob = window;
        } catch (e) {
            glob = self;
        }

        glob.coex = glob.coex || {};
        glob.coex.Coex = factory(glob.coex.VBox);
    }
}(function (VBox) {

    'use strict';

    /**
     *
     */
    function Coex(url, callback, maxPaletteColors) {
        this._image = null;
        this._canvas = null;
        this._context = null;
        this._vBoxes = [];

        this._createDummyCanvas();

        if (url && callback) {
            this.getColors(url, callback, maxPaletteColors);
        }
    }

    // PUBLIC METHODS

    /**
     * TODO: complete method
     */
    Coex.prototype.destroy = function () {
        var i = 0,
            length = this._vBoxes.length;

        for (; i < length; i += 1) {
            this._vBoxes[i].destroy();
        }
        this._vBoxes = null;

        this._destroyDummyCanvas();

        this._image = null;
    };

    /**
     *
     */
    Coex.prototype.getColors = function (url, callback, maxPaletteColors) {
        this._image = new Image();

        this._loadImage(url, callback, maxPaletteColors);
    };

    /**
     *
     */
    Coex.prototype.getContrastColor = function (colors, mainColor) {
        var length = colors.length,
            i = mainColor ? 0 : 1,
            contrast,
            color,
            bright = 0,
            diff = 0;

        mainColor = mainColor || colors[0];

        for (; i < length; i += 1) {
            contrast = this._getContrast(mainColor, colors[i]);

            if (contrast[0] > bright && contrast[1] > diff) {
                color = colors[i];
                bright = contrast[0];
                diff = contrast[1];
            }
        }

        return color;
    };

    // PRIVATE METHODS

    /**
     *
     */
    Coex.prototype._loadImage = function (url, callback, maxPaletteColors) {
        var width,
            height,
            imageData,
            rgbData,
            vBox;

        this._image.crossOrigin = 'Anonymous';
        this._image.onload = function () {
            width = this._canvas.width = this._context.width = this._image.width;
            height = this._canvas.height = this._context.height = this._image.height;

            // Draw image in the canvas.
            this._context.drawImage(this._image, 0, 0);

            // Load the image data into an array of pixel data (R, G, B, a).
            imageData = this._context.getImageData(0, 0, width, height).data;
            rgbData = this._imageDataToRgbData(imageData);

            vBox = new VBox(rgbData);
            this._vBoxes.push(vBox);

            this._palette = this._getPalette(maxPaletteColors ? maxPaletteColors : 10);

            callback(this._palette);
        }.bind(this);
        this._image.src = url;
    };

    /**
     *
     */
    Coex.prototype._getPalette = function (maxPaletteColors) {
        var values = [],
            colors = [],
            i,
            longestBoxIndex,
            largestBox,
            splitedData,
            j,
            splitedDataLength;

        for (i = 0; i < maxPaletteColors; i += 1) {
            longestBoxIndex = this._getLargestBoxIndex();

            // Get the largest vbox and split it.
            largestBox = this._vBoxes.splice(longestBoxIndex, 1)[0];

            // Split the vbox data and create new vbox.
            splitedData = largestBox.split();
            for (j = 0, splitedDataLength = splitedData.length; j < splitedDataLength; j += 1) {
                this._vBoxes.push(new VBox(splitedData[j]));
            }

            // We do not need the splited vbox anymore so we destroy it.
            largestBox.destroy();
        }

        // Create a palette with the average colors from each box.
        for (i = 0; i < maxPaletteColors; i += 1) {
            values.push(this._vBoxes[i].average());
        }

        // Sort values from most dominant color to least dominant color.
        values.sort(function (a, b) {
            return b[1] - a[1];
        });

        // Strip data length to return only rgb colors.
        for (i = 0; i < maxPaletteColors; i += 1) {
            colors.push({
                red: values[i][0][0],
                green: values[i][0][1],
                blue: values[i][0][2]
            });
        }

        return colors;
    };

    /**
     * Get the index of the vbox with the largest axis of them all.
     */
    Coex.prototype._getLargestBoxIndex = function () {
        var largestBoxIndex = 0,
            largestBoxSize = 0,
            i,
            length;

        for (i = 0, length = this._vBoxes.length; i < 0; i += 1) {
            if (this._vBoxes[i].size() > largestBoxSize) {
                largestBoxIndex = i;
            }
            largestBoxSize = this._vBoxes[i].size();
        }

        return largestBoxIndex;
    };

    /**
     * Convert an image data array into an rgb array.
     */
    Coex.prototype._imageDataToRgbData = function (imageData) {
        var rgbColors = [],
            rgbColor,
            i,
            length;

        for (i = 0, length = imageData.length; i < length; i += 4) {
            rgbColor = [
                imageData[i],
                imageData[i + 1],
                imageData[i + 2]
            ];

            rgbColors.push(rgbColor);
        }

        return rgbColors;
    };

    /**
     *
     */
    Coex.prototype._getContrast = function (color1, color2) {
        var color1Cal = ((color1.red * 299) + (color1.green * 587) + (color1.blue * 114)) / 1000,
            color2Cal = ((color2.red * 299) + (color2.green * 587) + (color2.blue * 114)) / 1000,
            bright = Math.round(Math.abs(color2Cal - color1Cal)),
            diff = Math.abs(color2.red - color1.red) + Math.abs(color2.green - color1.green) + Math.abs(color2.blue - color1.blue);

        return [bright, diff];
    };

    /**
     *
     */
    Coex.prototype._createDummyCanvas = function () {
        this._destroyDummyCanvas();

        this._canvas = document.createElement('canvas');

        this._context = this._canvas.getContext('2d');
        this._context.width = 1000;
        this._context.height = 1000;
        this._context.clearRect(0, 0, 1000, 1000);
    };

    /**
     *
     */
    Coex.prototype._destroyDummyCanvas = function () {
        if (this._context) {
            this._context.clearRect(0, 0, 1000, 1000);
        }

        this._canvas = null;
        this._context = null;
    };

    return Coex;
}));