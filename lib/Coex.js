(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("coex", [], factory);
	else if(typeof exports === 'object')
		exports["coex"] = factory();
	else
		root["coex"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _VBox = __webpack_require__(1);

	var _VBox2 = _interopRequireDefault(_VBox);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Coex = function () {
	    function Coex(url, maxPaletteColors) {
	        _classCallCheck(this, Coex);

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
	        this._workerMessageHandler = this._workerMessageHandler.bind(this);
	        this._workerErrorHandler = this._workerErrorHandler.bind(this);

	        // Set variables
	        this._url = url;
	        this._maxPaletteColors = maxPaletteColors ? maxPaletteColors : 8;
	        this._vBoxes = [];
	        this._instanceId = 'coex_instance_' + Coex._nextIdCount;

	        this._createDummyCanvas();
	    }

	    // PUBLIC METHODS

	    _createClass(Coex, [{
	        key: 'destroy',
	        value: function destroy() {
	            var length = this._vBoxes.length;
	            var i = 0;

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
	        }
	    }, {
	        key: 'get',
	        value: function get(callback) {
	            this._callback = callback;
	            this._image = new Image();

	            this._loadImage();
	        }
	    }, {
	        key: 'getContrastColor',
	        value: function getContrastColor(colors, mainColor) {
	            var length = colors.length;
	            var i = mainColor ? 0 : 1;
	            var bright = 0;
	            var diff = 0;
	            var contrast = void 0;
	            var color = void 0;

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
	    }, {
	        key: 'getImageBase64',
	        value: function getImageBase64() {
	            return this._canvas.toDataURL();
	        }

	        // PROTECTED METHODS

	    }, {
	        key: '_loadImage',
	        value: function _loadImage() {
	            this._image.crossOrigin = 'Anonymous';
	            this._image.addEventListener('load', this._handleImageLoad);
	            this._image.addEventListener('abort', this._handleImageAbort);
	            this._image.addEventListener('error', this._handleImageError);
	            this._image.src = this._url;
	        }
	    }, {
	        key: '_removeImageListeners',
	        value: function _removeImageListeners() {
	            this._image.removeEventListener('load', this._handleImageLoad);
	            this._image.removeEventListener('abort', this._handleImageAbort);
	            this._image.removeEventListener('error', this._handleImageError);
	        }
	    }, {
	        key: '_workerFallback',
	        value: function _workerFallback() {
	            var rgbData = this._imageDataToRgbData(this._imageData);

	            this._vBoxes.push(new _VBox2.default(rgbData));
	            var palette = this._getPalette(this._maxPaletteColors);

	            this._callback(null, palette);
	        }
	    }, {
	        key: '_getPalette',
	        value: function _getPalette(maxPaletteColors) {
	            var values = [];
	            var colors = [];
	            var i = void 0;
	            var length = void 0;
	            var vbox = void 0;
	            var splitedData = void 0;
	            var j = void 0;
	            var splitedDataLength = void 0;

	            for (i = 0; i < maxPaletteColors; i += 1) {
	                // Get the first vbox.
	                vbox = this._vBoxes.shift();

	                // Split the vbox data and create new one.
	                splitedData = vbox.split();
	                for (j = 0, splitedDataLength = splitedData.length; j < splitedDataLength; j += 1) {
	                    this._vBoxes.push(new _VBox2.default(splitedData[j]));
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
	        }

	        /**
	         * Convert an image data array into an rgb array.
	         *
	         * @param {String} imageData The image data.
	         *
	         * @return {Array} The rgb array.
	         */

	    }, {
	        key: '_imageDataToRgbData',
	        value: function _imageDataToRgbData(imageData) {
	            var rgbColors = [];
	            var rgbColor = void 0;
	            var i = void 0;
	            var length = void 0;

	            for (i = 0, length = imageData.length; i < length; i += 4) {
	                rgbColor = [imageData[i], imageData[i + 1], imageData[i + 2]];

	                rgbColors.push(rgbColor);
	            }

	            return rgbColors;
	        }
	    }, {
	        key: '_getContrast',
	        value: function _getContrast(color1, color2) {
	            var color1Cal = (color1.red * 299 + color1.green * 587 + color1.blue * 114) / 1000;
	            var color2Cal = (color2.red * 299 + color2.green * 587 + color2.blue * 114) / 1000;
	            var bright = Math.round(Math.abs(color2Cal - color1Cal));
	            var diff = Math.abs(color2.red - color1.red) + Math.abs(color2.green - color1.green) + Math.abs(color2.blue - color1.blue);

	            return [bright, diff];
	        }
	    }, {
	        key: '_createDummyCanvas',
	        value: function _createDummyCanvas() {
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

	    }, {
	        key: '_destroyDummyCanvas',
	        value: function _destroyDummyCanvas() {
	            if (this._context) {
	                this._context.clearRect(0, 0, 1000, 1000);
	            }

	            this._canvas = null;
	            this._context = null;
	        }

	        // HANDLERS

	    }, {
	        key: '_handleImageLoad',
	        value: function _handleImageLoad() {
	            var width = this._canvas.width = this._context.width = this._image.width;
	            var height = this._canvas.height = this._context.height = this._image.height;

	            this._removeImageListeners();

	            // Draw image in the canvas.
	            this._context.drawImage(this._image, 0, 0);

	            // Load the image data into an array of pixel data (R, G, B, a).
	            this._imageData = this._context.getImageData(0, 0, width, height).data;

	            // Check if browser support web workers and worker url is defined.
	            if (Coex.workerUrl && typeof Worker !== 'undefined') {
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
	        }
	    }, {
	        key: '_handleImageAbort',
	        value: function _handleImageAbort() {
	            this._removeImageListeners();
	            this._callback(new Error('Image loading was aborted.'));
	        }
	    }, {
	        key: '_handleImageError',
	        value: function _handleImageError() {
	            this._removeImageListeners();
	            this._callback(new Error('An error occurs when loading image.'));
	        }
	    }, {
	        key: '_workerMessageHandler',
	        value: function _workerMessageHandler(e) {
	            if (this._instanceId === e.data.instanceId) {
	                e.stopImmediatePropagation();
	                Coex._worker.removeEventListener('message', this._workerMessageHandler);
	                Coex._worker.removeEventListener('error', this._workerErrorHandler);
	                this._callback(null, e.data.palette);
	            }
	        }
	    }, {
	        key: '_workerErrorHandler',
	        value: function _workerErrorHandler() {
	            Coex._worker.removeEventListener('message', this._workerMessageHandler);
	            Coex._worker.removeEventListener('error', this._workerErrorHandler);
	            this._workerFallback();
	        }
	    }]);

	    return Coex;
	}();

	// STATIC PUBLIC VARIABLES

	Coex.workerUrl = null;

	// STATIC PROTECTED VARIABLES

	Coex._worker = null;
	Coex._count = 0;
	Coex._nextIdCount = 0;

	exports.default = Coex;
	module.exports = exports['default'];

/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Vbox = function () {
	    function Vbox(data) {
	        _classCallCheck(this, Vbox);

	        this._data = data;
	        this._dataLength = data.length;
	        this._calculateMinMaxAxis();
	    }

	    // PUBLIC METHODS

	    _createClass(Vbox, [{
	        key: "destroy",
	        value: function destroy() {
	            this._data = null;
	            this._dataLength = null;
	            this._axisMinMax = null;
	        }
	    }, {
	        key: "split",
	        value: function split() {
	            var axis = this._getLargestAxis();

	            // Sort all vbox data based on the largest axis.
	            this._data.sort(function (a, b) {
	                return a[axis] - b[axis];
	            });

	            var medianPoint = this._medianPoint();
	            var data1 = this._data.slice(0, medianPoint); // Data from 0 index to median point index.
	            var data2 = this._data.slice(medianPoint); // Data from median point index to final index.

	            return [data1, data2];
	        }

	        /**
	         * Get data average value.
	         *
	         * @return {Array} The data.
	         */

	    }, {
	        key: "average",
	        value: function average() {
	            var averageRed = 0;
	            var averageGreen = 0;
	            var averageBlue = 0;
	            var i = void 0;

	            for (i = 0; i < this._dataLength; i += 1) {
	                averageRed += this._data[i][0];
	                averageGreen += this._data[i][1];
	                averageBlue += this._data[i][2];
	            }

	            averageRed /= this._dataLength;
	            averageGreen /= this._dataLength;
	            averageBlue /= this._dataLength;

	            return [parseInt(averageRed, 10), parseInt(averageGreen, 10), parseInt(averageBlue, 10)];
	        }

	        /**
	         * Get size.
	         *
	         * @return {Number} The size.
	         */

	    }, {
	        key: "size",
	        value: function size() {
	            return this._dataLength;
	        }

	        // PROTECTED METHODS

	        /**
	         * Calculate the min/max values for each data RGB axis.
	         */

	    }, {
	        key: "_calculateMinMaxAxis",
	        value: function _calculateMinMaxAxis() {
	            var i = 1;

	            this._axisMinMax = [{ min: this._data[0][0], max: this._data[0][0] }, { min: this._data[0][1], max: this._data[0][1] }, { min: this._data[0][2], max: this._data[0][2] }];

	            for (; i < this._dataLength; i += 1) {
	                this._axisMinMax[0].min = this._data[i][0] < this._axisMinMax[0].min ? this._data[i][0] : this._axisMinMax[0].min; // Reds min.
	                this._axisMinMax[1].min = this._data[i][1] < this._axisMinMax[1].min ? this._data[i][1] : this._axisMinMax[1].min; // Greens min.
	                this._axisMinMax[2].min = this._data[i][2] < this._axisMinMax[2].min ? this._data[i][2] : this._axisMinMax[2].min; // Blues min.

	                this._axisMinMax[0].max = this._data[i][0] > this._axisMinMax[0].max ? this._data[i][0] : this._axisMinMax[0].max; // Reds max.
	                this._axisMinMax[1].max = this._data[i][1] > this._axisMinMax[1].max ? this._data[i][1] : this._axisMinMax[1].max; // Greens max.
	                this._axisMinMax[2].max = this._data[i][2] > this._axisMinMax[2].max ? this._data[i][2] : this._axisMinMax[2].max; // Blues max.
	            }
	        }

	        /**
	         * Get data median point index.
	         *
	         * @return {Number} The median point.
	         */

	    }, {
	        key: "_medianPoint",
	        value: function _medianPoint() {
	            var axis = this._getLargestAxis();
	            var medianPoint = 0;
	            var median = 0;
	            var diff = void 0;
	            var minDiff = Number.MAX_VALUE;
	            var i = void 0;

	            for (i = 0; i < this._dataLength; i += 1) {
	                median += this._data[i][axis];
	            }

	            median /= this._dataLength;

	            for (i = 0; i < this._dataLength; i += 1) {
	                diff = Math.abs(this._data[i][axis] - median);
	                if (diff <= minDiff) {
	                    medianPoint = i;
	                    minDiff = diff;
	                }
	            }

	            return medianPoint;
	        }

	        /**
	         * Get data largest RGB axis.
	         *
	         * @return {Number} The largest axis.
	         */

	    }, {
	        key: "_getLargestAxis",
	        value: function _getLargestAxis() {
	            var largestAxis = 0;
	            var largestAxisSize = 0;
	            var axisSize = void 0;

	            for (var i = 0, length = this._axisMinMax.length; i < length; i += 1) {
	                axisSize = this._axisMinMax[i].max - this._axisMinMax[i].min;
	                if (axisSize >= largestAxisSize) {
	                    largestAxis = i;
	                    largestAxisSize = axisSize;
	                }
	            }

	            return largestAxis;
	        }
	    }]);

	    return Vbox;
	}();

	exports.default = Vbox;
	module.exports = exports["default"];

/***/ }
/******/ ])
});
;