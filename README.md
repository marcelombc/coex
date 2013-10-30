coex
====

## Introduction

coex is a library that helps you extract the most common colors of an image.

## Features

* `AMD` compatible

## Installation

* Clone the repo
* Install bower (`npm install bower -g`)
* Install uglify-js (`npm install uglify-js -g`)
* Install deps with (`bower install`)

## Usage

```js
coex.getColors(path/to/image, function (colors) {
    console.log(colors);
});
```
## Build ##

```js
uglifyjs lib/coex.js -o lib/coex.min.js
```
## Works on ##

All browsers that supports HTML5.

## License ##

Released under the [MIT License](http://www.opensource.org/licenses/mit-license.php).
