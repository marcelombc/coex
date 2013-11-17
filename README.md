coex
====

## Introduction

coex is a library that helps you extract the most common colors of an image.

## Features

* Usage of the [median-cut](http://www.leptonica.com/papers/mediancut.pdf) algorithm.
* Find contrast colors.
* `AMD` compatible

## Installation

* Clone the repo

### Running the example

* Install bower (`npm install bower -g`)
* Install deps with (`bower install`)

## Usage

```js
var coex = new Coex(path/to/image);
coex.get(function (err, colors) {
    if (err) {
        throw err;
    }
    console.log(colors);
    var contrastColor = coex.getContrastColor(colors);
    console.log(contrastColor);
    coex.destroy();
});
```

### Using with AMD

This library is available in the `AMD` format and has several dependencies.
If you use RequireJS specify the paths like this:

```js
// ...
require.config({
    paths : {
        'coex': 'bower_components/coex/lib'
    }
});

require([
    'coex/Coex'
], function (Coex) {
    'use strict';

    // Insert the example above here.
});
//...
```

## API

### .get(callback)

### .getContrastColor(colors, mainColor)

### .destroy()

## Works on ##

All browsers that supports HTML5.

## License ##

Released under the [MIT License](http://www.opensource.org/licenses/mit-license.php).
