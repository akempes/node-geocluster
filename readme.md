# geocluster

`geocluster` finds clusters in sets of coordinates. It's a port of [S-means](https://www.npmjs.org/package/smeans) by [Brian Hann](https://www.npmjs.org/~c0bra) (which itself is a [stdev](http://en.wikipedia.org/wiki/Standard_deviation)-driven form of [K-means](http://en.wikipedia.org/wiki/K-means)), but with two dimensions, Earth-[geodesic distance](http://en.wikipedia.org/wiki/Geodesics_on_an_ellipsoid) and properly working code.

## Install

```
npm install geocluster
```

## API

### result = geocluster(coordinates[, bias, type])

`coordinates` is an list of objects containing the attributes `x`, `y` and `z`. (`{x: <x>, y: <y>, x: <x>}`)
`bias` is a factor the standard deviation gets multiplied with, which acts as threshold to determine if a coordinate belongs to a cluster.
`type` can contain the value `geodetic` (default) or `linear` defining to the distance calculation method.
`result` is an Array of cluster objects, which have `centroid` and `elements` properties. Example:

``` javascript
[
    {
        "centroid": {
            "x": 2,
            "y": 2,
            "z": 0.3333333333333333
        },
        "elements": [
            {
                "x": 2,
                "y": 2,
                "z": 0
            },
            {
                "x": 1.9,
                "y": 2.1,
                "z": 0
            },
            {
                "x": 2.1,
                "y": 1.9,
                "z": 1
            }
        ]
    },
    {
        "centroid": {
            "x": 1,
            "y": 1,
            "z": 0.3333333333333333
        },
        "elements": [
            {
                "x": 1,
                "y": 1,
                "z": 0
            },
            {
                "x": 0.9,
                "y": 1.1,
                "z": 0
            },
            {
                "x": 1.1,
                "y": 0.9,
                "z": 1
            }
        ]
    }
]
``` 

## Sample Code

``` javascript

var geocluster = require("geocluster");

var coordinates = [ // array of x-y-z-pairs
	{x: 1.0, y: 1.0, z: 0},
	{x: 0.9, y: 1.1, z: 0},
	{x: 1.1, y: 0.9, z: 1},
	{x: 2.0, y: 2.0, z: 0},
	{x: 1.9, y: 2.1, z: 0},
	{x: 2.1, y: 1.9, z: 1}
	// ...
];

var bias = 1.5; // multiply stdev with this factor, the smaller the more clusters

var result = geocluster(coordinates, bias); // geodetic
var result = geocluster(coordinates, bias, 'linear'); // linear

// result is an array of cluster objects with `centroid` and `elements` properties

```

## License

[Public Domain](http://unlicense.org/UNLICENSE)
