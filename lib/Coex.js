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
        var glob = typeof window !== 'undefined' ? window : self;

        glob.coex = glob.coex || {};
        glob.coex.Coex = factory(glob.coex.VBox);
    }
}(function (VBox) {

    'use strict';

    /**
     *
     */
    function Coex(url, maxPaletteColors) {
        // If this counter reach the Number.MAX_VALUE there is a memory leak.
        // Computer will reach an out of memory. Use destroy().
        Coex._count += 1;

        // TODO: Maybe use a Math.random() instead. Will decrease performance.
        Coex._nextIdCount += 1;
        if (Coex._nextIdCount === Infinity) {
            Coex._nextIdCount = 0;
        }

        this._url = url;
        this._maxPaletteColors = maxPaletteColors ? maxPaletteColors : 8;
        this._image = null;
        this._canvas = null;
        this._context = null;
        this._vBoxes = [];
        this._instanceId = 'coex_instance_' + Coex._nextIdCount;

        this._createDummyCanvas();
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

        Coex._count -= 1;
        if (Coex._count === 0) {
            Coex._worker.terminate();
            Coex._worker = null;
        }

        this._destroyDummyCanvas();

        this._image = null;
    };

    /**
     *
     */
    Coex.prototype.get = function (callback) {
        this._image = new Image();

        this._loadImage(callback);
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
    Coex.prototype._loadImage = function (callback) {
        var that = this,
            width,
            height,
            imageData,
            rgbData,
            workerFallback = function () {
                rgbData = that._imageDataToRgbData(imageData);
                that._vBoxes.push(new VBox(rgbData));
                that._palette = that._getPalette(that._maxPaletteColors);

                callback(null, that._palette);
            },
            messageHandler = function (e) {
                if (that._instanceId === e.data.instanceId) {
                    e.stopImmediatePropagation();
                    Coex._worker.removeEventListener('message', messageHandler);
                    Coex._worker.removeEventListener('error', errorHandler);
                    callback(null, e.data.palette);
                }
            },
            errorHandler = function (err) {
                Coex._worker.removeEventListener('message', messageHandler);
                Coex._worker.removeEventListener('error', errorHandler);
                workerFallback();
            };

        this._image.crossOrigin = 'Anonymous';
        this._image.onload = function () {
            width = that._canvas.width = that._context.width = that._image.width;
            height = that._canvas.height = that._context.height = that._image.height;

            // Draw image in the canvas.
            that._context.drawImage(that._image, 0, 0);

            // Load the image data into an array of pixel data (R, G, B, a).
            imageData = that._context.getImageData(0, 0, width, height).data;

            // Check if browser support web workers and worker url is defined.
            if (Coex.workerUrl && typeof(Worker) !== 'undefined') {
                if (!Coex._worker) {
                    Coex._worker = new Worker(Coex.workerUrl);
                }
                Coex._worker.addEventListener('message', messageHandler);
                Coex._worker.addEventListener('error', errorHandler);
                Coex._worker.postMessage({
                    instanceId: that._instanceId,
                    imageData: imageData,
                    maxPaletteColors: that._maxPaletteColors
                });
            } else {
                workerFallback();
            }
        };
        this._image.onabort = function () {
            callback(new Error('Image loading was aborted.'));
        };
        this._image.onerror = function () {
            callback(new Error('An error occurs when loading image.'));
        };
        this._image.src = this._url;
    };

    /**
     *
     */
    Coex.prototype._getPalette = function (maxPaletteColors) {
        var values = [],
            colors = [],
            i,
            length,
            vbox,
            splitedData,
            j,
            splitedDataLength;

        for (i = 0; i < maxPaletteColors; i += 1) {
            // Get the first vbox.
            vbox = this._vBoxes.shift();

            // Split the vbox data and create new one.
            splitedData = vbox.split();
            for (j = 0, splitedDataLength = splitedData.length; j < splitedDataLength; j += 1) {
                this._vBoxes.push(new VBox(splitedData[j]));
            }

            // We do not need the first vbox anymore so we destroy it.
            vbox.destroy();
        }

        // Sort values from most dominant color to least dominant color.
        this._vBoxes.sort(function (vbox1, vbox2) {
            return vbox2.size() - vbox1.size();
        });

        // Create a palette with the average colors from each vbox.
        for (i = 0, length = this._vBoxes.length; i < length; i += 1) {
            values.push(this._vBoxes[i].average());
        }

        // Strip data length to return only rgb colors.
        for (i = 0; i < maxPaletteColors; i += 1) {
            colors.push({
                red: values[i][0],
                green: values[i][1],
                blue: values[i][2]
            });
        }

        return colors;
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

    // STATIC PUBLIC VARIABLES

    Coex.workerUrl = null;

    // STATIC PROTECTED VARIABLES

    Coex._worker = null;
    Coex._count = 0;
    Coex._nextIdCount = 0;

    return Coex;
}));