export default class Vbox {
    constructor(data) {
        this._data = data;
        this._dataLength = data.length;
        this._calculateMinMaxAxis();
    }

    // PUBLIC METHODS

    destroy() {
        this._data = null;
        this._dataLength = null;
        this._axisMinMax = null;
    }

    split() {
        const axis = this._getLargestAxis();

        // Sort all vbox data based on the largest axis.
        this._data.sort((a, b) => {
            return a[axis] - b[axis];
        });

        const medianPoint = this._medianPoint();
        const data1 = this._data.slice(0, medianPoint); // Data from 0 index to median point index.
        const data2 = this._data.slice(medianPoint);    // Data from median point index to final index.

        return [data1, data2];
    }

    /**
     * Get data average value.
     *
     * @return {Array} The data.
     */
    average() {
        let averageRed = 0;
        let averageGreen = 0;
        let averageBlue = 0;
        let i;

        for (i = 0; i < this._dataLength; i += 1) {
            averageRed += this._data[i][0];
            averageGreen += this._data[i][1];
            averageBlue += this._data[i][2];
        }

        averageRed /= this._dataLength;
        averageGreen /= this._dataLength;
        averageBlue /= this._dataLength;

        return [
            parseInt(averageRed, 10),
            parseInt(averageGreen, 10),
            parseInt(averageBlue, 10),
        ];
    }

    /**
     * Get size.
     *
     * @return {Number} The size.
     */
    size() {
        return this._dataLength;
    }

    // PROTECTED METHODS

    /**
     * Calculate the min/max values for each data RGB axis.
     */
    _calculateMinMaxAxis() {
        let i = 1;

        this._axisMinMax = [
            { min: this._data[0][0], max: this._data[0][0] },
            { min: this._data[0][1], max: this._data[0][1] },
            { min: this._data[0][2], max: this._data[0][2] },
        ];

        for (; i < this._dataLength; i += 1) {
            this._axisMinMax[0].min = (this._data[i][0] < this._axisMinMax[0].min) ? this._data[i][0] : this._axisMinMax[0].min; // Reds min.
            this._axisMinMax[1].min = (this._data[i][1] < this._axisMinMax[1].min) ? this._data[i][1] : this._axisMinMax[1].min; // Greens min.
            this._axisMinMax[2].min = (this._data[i][2] < this._axisMinMax[2].min) ? this._data[i][2] : this._axisMinMax[2].min; // Blues min.

            this._axisMinMax[0].max = (this._data[i][0] > this._axisMinMax[0].max) ? this._data[i][0] : this._axisMinMax[0].max; // Reds max.
            this._axisMinMax[1].max = (this._data[i][1] > this._axisMinMax[1].max) ? this._data[i][1] : this._axisMinMax[1].max; // Greens max.
            this._axisMinMax[2].max = (this._data[i][2] > this._axisMinMax[2].max) ? this._data[i][2] : this._axisMinMax[2].max; // Blues max.
        }
    }

    /**
     * Get data median point index.
     *
     * @return {Number} The median point.
     */
    _medianPoint() {
        const axis = this._getLargestAxis();
        let medianPoint = 0;
        let median = 0;
        let diff;
        let minDiff = Number.MAX_VALUE;
        let i;

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
    _getLargestAxis() {
        let largestAxis = 0;
        let largestAxisSize = 0;
        let axisSize;

        for (let i = 0, length = this._axisMinMax.length; i < length; i += 1) {
            axisSize = this._axisMinMax[i].max - this._axisMinMax[i].min;
            if (axisSize >= largestAxisSize) {
                largestAxis = i;
                largestAxisSize = axisSize;
            }
        }

        return largestAxis;
    }
}
