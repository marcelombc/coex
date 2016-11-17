coex
====

## Introduction

coex is a library that helps you extract the most common colors of an image in the browser.

## Features

* Usage of the [median-cut](http://www.leptonica.com/papers/mediancut.pdf) algorithm.
* Find contrast colors.
* `AMD` compatible

## Installing

`$ npm install coex`

## Usage

```js
import Coex from 'coex';

const coex = new Coex(path/to/image);
coex.get(function (err, colors) {
    if (err) {
        throw err;
    }
    console.log(colors);
    const contrastColor = coex.getContrastColor(colors);
    console.log(contrastColor);
    coex.destroy();
});
```

## API

### .get(callback)

### .getContrastColor(colors, mainColor)

### .destroy()

## Works on

All browsers that supports HTML5.

## License

Released under the [MIT License](http://www.opensource.org/licenses/mit-license.php).
