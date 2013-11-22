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

        // Bind functions
        this._imageLoadHandler = this._imageLoadHandler.bind(this);
        this._imageAbortHandler = this._imageAbortHandler.bind(this);
        this._imageErrorHandler = this._imageErrorHandler.bind(this);
        this._workerMessageHandler = this._workerMessageHandler.bind(this);
        this._workerErrorHandler = this._workerErrorHandler.bind(this);

        this._url = url;
        this._maxPaletteColors = maxPaletteColors ? maxPaletteColors : 8;
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

        if (Coex._worker) {
            Coex._worker.removeEventListener('message', this._workerMessageHandler);
            Coex._worker.removeEventListener('error', this._workerErrorHandler);
            Coex._count -= 1;
            if (Coex._count === 0) {
                Coex._worker.terminate();
                Coex._worker = null;
            }
        }

        this._destroyDummyCanvas();

        this._removeImageListeners();
        this._image = null;

        this._url = null;
        this._maxPaletteColors = null;
        this._callback = null;
        this._imageData = null;
    };

    /**
     *
     */
    Coex.prototype.get = function (callback) {
        this._callback = callback;
        this._image = new Image();

        this._loadImage();
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

    /**
     *
     */
    Coex.prototype.getImageBase64 = function () {
        return this._canvas.toDataURL();
    };

    // PRIVATE METHODS

    /**
     *
     */
    Coex.prototype._loadImage = function () {
        this._image.crossOrigin = 'Anonymous';
        this._image.addEventListener('load', this._imageLoadHandler);
        this._image.addEventListener('abort', this._imageAbortHandler);
        this._image.addEventListener('error', this._imageErrorHandler);
        this._image.src = this._url;
    };

    /**
     *
     */
    Coex.prototype._removeImageListeners = function () {
        this._image.removeEventListener('load', this._imageLoadHandler);
        this._image.removeEventListener('abort', this._imageAbortHandler);
        this._image.removeEventListener('error', this._imageErrorHandler);
    };

    /**
     *
     */
    Coex.prototype._imageLoadHandler = function () {
        var width = this._canvas.width = this._context.width = this._image.width,
            height = this._canvas.height = this._context.height = this._image.height;

        this._removeImageListeners();

        // Draw image in the canvas.
        this._context.drawImage(this._image, 0, 0);

        // Load the image data into an array of pixel data (R, G, B, a).
        this._imageData = this._context.getImageData(0, 0, width, height).data;

        // Check if browser support web workers and worker url is defined.
        if (Coex.workerUrl && typeof(Worker) !== 'undefined') {
            if (!Coex._worker) {
                Coex._worker = new Worker(Coex.workerUrl);
            }
            Coex._worker.addEventListener('message', this._workerMessageHandler);
            Coex._worker.addEventListener('error', this._workerErrorHandler);
            Coex._worker.postMessage({
                instanceId: this._instanceId,
                imageData: this._imageData,
                maxPaletteColors: this._maxPaletteColors
            });
        } else {
            this._workerFallback();
        }
    };

    /**
     *
     */
    Coex.prototype._imageAbortHandler = function () {
        this._removeImageListeners();
        this._callback(new Error('Image loading was aborted.'));
    };

    /**
     *
     */
    Coex.prototype._imageErrorHandler = function () {
        this._removeImageListeners();
        this._callback(new Error('An error occurs when loading image.'));
    };

    /**
     *
     */
    Coex.prototype._workerMessageHandler = function (e) {
        if (this._instanceId === e.data.instanceId) {
            e.stopImmediatePropagation();
            Coex._worker.removeEventListener('message', this._workerMessageHandler);
            Coex._worker.removeEventListener('error', this._workerErrorHandler);
            this._callback(null, e.data.palette);
        }
    };

    /**
     *
     */
    Coex.prototype._workerErrorHandler = function () {
        Coex._worker.removeEventListener('message', this._workerMessageHandler);
        Coex._worker.removeEventListener('error', this._workerErrorHandler);
        this._workerFallback();
    };

    /**
     *
     */
    Coex.prototype._workerFallback = function () {
        var rgbData = this._imageDataToRgbData(this._imageData),
            palette;

        this._vBoxes.push(new VBox(rgbData));
        palette = this._getPalette(this._maxPaletteColors);

        this._callback(null, palette);
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