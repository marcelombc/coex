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

The MIT License (MIT)

Copyright (c) 2013 Marcelo Conceição <marcelombc@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
