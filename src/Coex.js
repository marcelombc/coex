import VBox from './VBox';
import CoexWorker from './worker';

class Coex {
    constructor(url, maxPaletteColors) {
        // If this counter reach the Number.MAX_VALUE there is a memory leak.
        // Computer will reach an out of memory. Use destroy().
        Coex._count += 1;

        // TODO: Maybe use a Math.random() instead. Will decrease performance.
        Coex._nextIdCount += 1;
        if (Coex._nextIdCount === Infinity) {
            Coex._nextIdCount = 0;
        }

        // Bind functions
        this._handleImageLoad = this._handleImageLoad.bind(this);
        this._handleImageAbort = this._handleImageAbort.bind(this);
        this._handleImageError = this._handleImageError.bind(this);
        this._handleWorkerMessage = this._handleWorkerMessage.bind(this);
        this._handleWorkerError = this._handleWorkerError.bind(this);

        // Set variables
        this._url = url;
        this._maxPaletteColors = maxPaletteColors ? maxPaletteColors : 8;
        this._vBoxes = [];
        this._instanceId = `coex_instance_${Coex._nextIdCount}`;

        this._createDummyCanvas();
    }

    // PUBLIC METHODS

    destroy() {
        const length = this._vBoxes.length;
        let i = 0;

        for (; i < length; i += 1) {
            this._vBoxes[i].destroy();
        }
        this._vBoxes = null;

        if (Coex._worker) {
            Coex._worker.removeEventListener('message', this._handleWorkerMessage);
            Coex._worker.removeEventListener('error', this._handleWorkerError);
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
    }

    get(callback) {
        this._callback = callback;
        this._image = new Image();

        this._loadImage();
    }

    getContrastColor(colors, mainColor) {
        const length = colors.length;
        let i = mainColor ? 0 : 1;
        let bright = 0;
        let diff = 0;
        let contrast;
        let color;

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
    }

    getImageBase64() {
        return this._canvas.toDataURL();
    }

    // PROTECTED METHODS

    _loadImage() {
        this._image.crossOrigin = 'Anonymous';
        this._image.addEventListener('load', this._handleImageLoad);
        this._image.addEventListener('abort', this._handleImageAbort);
        this._image.addEventListener('error', this._handleImageError);
        this._image.src = this._url;
    }

    _removeImageListeners() {
        this._image.removeEventListener('load', this._handleImageLoad);
        this._image.removeEventListener('abort', this._handleImageAbort);
        this._image.removeEventListener('error', this._handleImageError);
    }

    _workerFallback() {
        const rgbData = this._imageDataToRgbData(this._imageData);

        this._vBoxes.push(new VBox(rgbData));
        const palette = this._getPalette(this._maxPaletteColors);

        this._callback(null, palette);
    }

    _getPalette(maxPaletteColors) {
        const values = [];
        const colors = [];
        let i;
        let length;
        let vbox;
        let splitedData;
        let j;
        let splitedDataLength;

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
        this._vBoxes.sort((vbox1, vbox2) => {
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
                blue: values[i][2],
            });
        }

        return colors;
    }

    /**
     * Convert an image data array into an rgb array.
     *
     * @param {String} imageData The image data.
     *
     * @return {Array} The rgb array.
     */
    _imageDataToRgbData(imageData) {
        const rgbColors = [];
        let rgbColor;
        let i;
        let length;

        for (i = 0, length = imageData.length; i < length; i += 4) {
            rgbColor = [
                imageData[i],
                imageData[i + 1],
                imageData[i + 2],
            ];

            rgbColors.push(rgbColor);
        }

        return rgbColors;
    }

    _getContrast(color1, color2) {
        const color1Cal = ((color1.red * 299) + (color1.green * 587) + (color1.blue * 114)) / 1000;
        const color2Cal = ((color2.red * 299) + (color2.green * 587) + (color2.blue * 114)) / 1000;
        const bright = Math.round(Math.abs(color2Cal - color1Cal));
        const diff = Math.abs(color2.red - color1.red) + Math.abs(color2.green - color1.green) + Math.abs(color2.blue - color1.blue);

        return [bright, diff];
    }

    _createDummyCanvas() {
        this._destroyDummyCanvas();

        this._canvas = document.createElement('canvas');

        this._context = this._canvas.getContext('2d');
        this._context.width = 1000;
        this._context.height = 1000;
        this._context.clearRect(0, 0, 1000, 1000);
    }

    /**
     *
     */
    _destroyDummyCanvas() {
        if (this._context) {
            this._context.clearRect(0, 0, 1000, 1000);
        }

        this._canvas = null;
        this._context = null;
    }

    // HANDLERS

    _handleImageLoad() {
        const width = this._canvas.width = this._context.width = this._image.width;
        const height = this._canvas.height = this._context.height = this._image.height;

        this._removeImageListeners();

        // Draw image in the canvas.
        this._context.drawImage(this._image, 0, 0);

        // Load the image data into an array of pixel data (R, G, B, a).
        this._imageData = this._context.getImageData(0, 0, width, height).data;

        // Check if browser support web workers and worker url is defined.
        if (typeof Worker !== 'undefined') {
            if (!Coex._worker) {
                Coex._worker = new CoexWorker();
            }
            Coex._worker.addEventListener('message', this._handleWorkerMessage);
            Coex._worker.addEventListener('error', this._handleWorkerError);
            Coex._worker.postMessage({
                instanceId: this._instanceId,
                imageData: this._imageData,
                maxPaletteColors: this._maxPaletteColors,
            });
        } else {
            this._workerFallback();
        }
    }

    _handleImageAbort() {
        this._removeImageListeners();
        this._callback(new Error('Image loading was aborted.'));
    }

    _handleImageError() {
        this._removeImageListeners();
        this._callback(new Error('An error occurs when loading image.'));
    }

    _handleWorkerMessage(e) {
        if (this._instanceId === e.data.instanceId) {
            e.stopImmediatePropagation();
            Coex._worker.removeEventListener('message', this._handleWorkerMessage);
            Coex._worker.removeEventListener('error', this._handleWorkerError);
            this._callback(null, e.data.palette);
        }
    }

    _handleWorkerError() {
        Coex._worker.removeEventListener('message', this._handleWorkerMessage);
        Coex._worker.removeEventListener('error', this._handleWorkerError);
        this._workerFallback();
    }
}

// STATIC PROTECTED VARIABLES

Coex._worker = null;
Coex._count = 0;
Coex._nextIdCount = 0;

export default Coex;
