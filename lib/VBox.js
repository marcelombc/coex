(function (factory) {

    'use strict';

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

        glob.coex = glob.coex || {};
        glob.coex.VBox = factory();
    }
}(function () {

    'use strict';

    /**
     *
     */
    function VBox(data) {
        this._data = data;
        this._axisMinMax = this._getAxisMinMax();
    }

    // PUBLIC METHODS

    /**
     * TODO: complete method.
     */
    VBox.prototype.destroy = function () {
        this._data = null;
        this._axisMinMax = null;
    };

    /**
     *
     */
    VBox.prototype.split = function () {
        var axis = this._getLargestAxis(),
            medianPoint,
            data1,
            data2;

        // Sort all vbox data based on the largest axis.
        this._data.sort(function (a, b) {
            return a[axis] - b[axis];
        });

        medianPoint = this._medianPoint();
        data1 = this._data.slice(0, medianPoint); // Data from 0 index to median point index.
        data2 = this._data.slice(medianPoint);    // Data from median point index to final index.

        return [data1, data2];
    };

    /**
     * Get data average value.
     */
    VBox.prototype.average = function () {
        var averageRed = 0,
            averageGreen = 0,
            averageBlue = 0,
            i,
            length;

        for (i = 0, length = this._data.length; i < length; i += 1) {
            averageRed += this._data[i][0];
            averageGreen += this._data[i][1];
            averageBlue += this._data[i][2];
        }

        averageRed /= length;
        averageGreen /= length;
        averageBlue /= length;

        return [[parseInt(averageRed, 10),
                parseInt(averageGreen, 10),
                parseInt(averageBlue, 10)],
                length];
    };

    /**
     * Get size.
     */
    VBox.prototype.size = function () {
        return this._data.length;
    };

    // PROTECTED METHODS

    /**
     * Get min/max values for each data RGB axis.
     */
    VBox.prototype._getAxisMinMax = function () {
        var i,
            length,
            reds = [],
            greens = [],
            blues = [];

        for (i = 0, length = this._data.length; i < length; i += 1) {
            reds.push(this._data[i][0]);
            greens.push(this._data[i][1]);
            blues.push(this._data[i][2]);
        }

        return [
            { min: Math.min.apply(Math, reds), max: Math.max.apply(Math, reds) },       // Reds min and max.
            { min: Math.min.apply(Math, greens), max: Math.max.apply(Math, greens) },   // Greens min and max.
            { min: Math.min.apply(Math, blues), max: Math.max.apply(Math, blues) }      // Blues min and max.
        ];
    };

    /**
     * Get data median point index.
     */
    VBox.prototype._medianPoint = function () {
        var medianPoint = 0,
            median = 0,
            axis = this._getLargestAxis(),
            diff,
            previousDiff = 0,
            i,
            length = this._data.length;

        for (i = 0; i < length; i += 1) {
            median += this._data[i][axis];
        }

        median /= length;

        for (i = 0; i < length; i += 1) {
            diff = Math.abs(this._data[i][axis] - median);
            if (diff < previousDiff) {
                medianPoint = i;
            }
            previousDiff = diff;
        }

        return medianPoint;
    };

    /**
     * Get data largest RGB axis.
     */
    VBox.prototype._getLargestAxis = function () {
        var largestAxis = 0,
            largestAxisSize = 0,
            i,
            length,
            axisSize;

        for (i = 0, length = this._axisMinMax.length; i < length; i += 1) {
            axisSize = this._axisMinMax[i].max - this._axisMinMax[i].min;
            if (axisSize >= largestAxisSize) {
                largestAxis = i;
            }
            largestAxisSize = axisSize;
        }

        return largestAxis;
    };

    return VBox;
}));