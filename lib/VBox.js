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
        var glob = typeof window !== 'undefined' ? window : self;

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
        this._dataLength = data.length;
        this._calculateMinMaxAxis();
    }

    // PUBLIC METHODS

    /**
     *
     */
    VBox.prototype.destroy = function () {
        this._data = null;
        this._dataLength = null;
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
            i;

        for (i = 0; i < this._dataLength; i += 1) {
            averageRed += this._data[i][0];
            averageGreen += this._data[i][1];
            averageBlue += this._data[i][2];
        }

        averageRed /= this._dataLength;
        averageGreen /= this._dataLength;
        averageBlue /= this._dataLength;

        return [parseInt(averageRed, 10),
                parseInt(averageGreen, 10),
                parseInt(averageBlue, 10)];
    };

    /**
     * Get size.
     */
    VBox.prototype.size = function () {
        return this._dataLength;
    };

    // PROTECTED METHODS

    /**
     * Calculate the min/max values for each data RGB axis.
     */
    VBox.prototype._calculateMinMaxAxis = function () {
        var i = 1;

        this._axisMinMax = [
            { min: this._data[0][0], max: this._data[0][0] },
            { min: this._data[0][1], max: this._data[0][1] },
            { min: this._data[0][2], max: this._data[0][2] }
        ];

        for (; i < this._dataLength; i += 1) {
            this._axisMinMax[0].min = (this._data[i][0] < this._axisMinMax[0].min) ? this._data[i][0] : this._axisMinMax[0].min; // Reds min.
            this._axisMinMax[1].min = (this._data[i][1] < this._axisMinMax[1].min) ? this._data[i][1] : this._axisMinMax[1].min; // Greens min.
            this._axisMinMax[2].min = (this._data[i][2] < this._axisMinMax[2].min) ? this._data[i][2] : this._axisMinMax[2].min; // Blues min.

            this._axisMinMax[0].max = (this._data[i][0] > this._axisMinMax[0].max) ? this._data[i][0] : this._axisMinMax[0].max; // Reds max.
            this._axisMinMax[1].max = (this._data[i][1] > this._axisMinMax[1].max) ? this._data[i][1] : this._axisMinMax[1].max; // Greens max.
            this._axisMinMax[2].max = (this._data[i][2] > this._axisMinMax[2].max) ? this._data[i][2] : this._axisMinMax[2].max; // Blues max.
        }
    };

    /**
     * Get data median point index.
     */
    VBox.prototype._medianPoint = function () {
        var medianPoint = 0,
            median = 0,
            axis = this._getLargestAxis(),
            diff,
            minDiff = Number.MAX_VALUE,
            i;

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
                largestAxisSize = axisSize;
            }
        }

        return largestAxis;
    };

    return VBox;
}));