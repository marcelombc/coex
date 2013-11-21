/* jshint strict:false */

self.importScripts('VBox.js');

function imageDataToRgbData(imageData) {
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
}

function getPalette(maxPaletteColors, vBoxes) {
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
        vbox = vBoxes.shift();

        // Split the vbox data and create new one.
        splitedData = vbox.split();
        for (j = 0, splitedDataLength = splitedData.length; j < splitedDataLength; j += 1) {
            vBoxes.push(new self.coex.VBox(splitedData[j]));
        }

        // We do not need the first vbox anymore so we destroy it.
        vbox.destroy();
    }

    // Sort values from most dominant color to least dominant color.
    vBoxes.sort(function (vbox1, vbox2) {
        return vbox2.size() - vbox1.size();
    });

    // Create a palette with the average colors from each vbox.
    for (i = 0, length = vBoxes.length; i < length; i += 1) {
        values.push(vBoxes[i].average());
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

self.onmessage = function (e) {
    var imageData = e.data.imageData,
        maxPaletteColors = e.data.maxPaletteColors,
        instanceId = e.data.instanceId,
        vBoxes = [],
        rgbData,
        palette;

    rgbData = imageDataToRgbData(imageData);
    vBoxes.push(new self.coex.VBox(rgbData));
    palette = getPalette(maxPaletteColors, vBoxes);

    self.postMessage({
        instanceId: instanceId,
        palette: palette
    });
};