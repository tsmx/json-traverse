# [**json-traverse**](https://github.com/tsmx/json-traverse)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
![npm (scoped)](https://img.shields.io/npm/v/@tsmx/json-traverse)
![node-current (scoped)](https://img.shields.io/node/v/@tsmx/json-traverse)
[![Build Status](https://travis-ci.com/tsmx/json-traverse.svg?branch=master)](https://travis-ci.org/tsmx/json-traverse)
[![Coverage Status](https://coveralls.io/repos/github/tsmx/json-traverse/badge.svg?branch=master)](https://coveralls.io/github/tsmx/json-traverse?branch=master)

> Traverse and manipulate JSON objects.

## Usage

### Example 1: print out a simple object

```js
var simpleObj = {
    MyValue: 'test',
    OtherValue: 'zzz',
    NumberValue: 311,
    MyArray: [1, 2, 3, 50, 60, 70]
};

const callbacks = {
    processValue: (key, value, level, path, isObjectRoot, isArrayElement, cbSetValue) => { 
        console.log(level + ' ' + (path.length > 0 ? (path.join('.') + '.') : '') + key + ' = ' + value); 
    }
};

const jt = require('@tsmx/json-traverse');

jt.traverse(simpleObj, callbacks);
// 0 MyValue = test
// 0 OtherValue = xxx
// 0 NumberValue = 311
// 0 MyArray._0 = 1
// 0 MyArray._1 = 2
// 0 MyArray._2 = 3
// 0 MyArray._3 = 50
// 0 MyArray._4 = 60
// 0 MyArray._5 = 70

// flat array-mode: flattenArray = true (arrays are treated as one value)
jt.traverse(simpleObj, callbacks, true);
// 0 MyValue = test
// 0 OtherValue = xxx
// 0 NumberValue = 311
// 0 MyArray = 1,2,3,50,60,70
```

### Example 2: change values of an object

```js
var simpleObj = {
    MyValue: 'test',
    OtherValue: 'zzz',
    NumberValue: 311,
    MyArray: [1, 2, 3, 50, 60, 70]
};

const callbacks = {
    processValue: (key, value, level, path, isObjectRoot, isArrayElement, cbSetValue) => { 
        // change values of properties starting with 'My' and
        // multiply all numeric array values greater then 50 by 100
        if (key.startsWith('My')) {
            cbSetValue('MyNew-' + value);
        }
        if (isArrayElement && parseInt(value) > 50) {
            cbSetValue(100 * parseInt(value));
        }
    }
};

const jt = require('@tsmx/json-traverse');

jt.traverse(simpleObj, callbacks);

// {
//   MyValue : "MyNew-test",
//   OtherValue: "xxx",
//   NumberValue: 311,
//   MyArray: [ 1, 2, 3, 50, 6000, 7000 ]
// }
```

### Example 3: convert a more complex object to a collapsable HTML list

```js
const htmlObj = {
    MyArray: [0, 0],
    ArrayInArry: [0, 1, ['two', 'three', [4, 5, 6]]],
    MyNumber: 123,
    MyString: 'test',
    Child: {
        ChildVal: 1,
        SubChild: {
            SubChildVal: 777
        },
        ChildArray: [1, 2, 66, 9, 900]
    },
    TrailingValue: 'testtesttest'
}

const callbacksHtmlList = {
    processValue: (key, value, level, path, isObjectRoot, isArrayElement, cbSetValue) => {
        if (isObjectRoot) {
            console.log(('  ').repeat(level) + ' <li class=\"caret\">Key: ' + key + '</li>')
        }
        else {
            console.log(('  ').repeat(level) + ' <li>Key: ' + key + ', Value: ' + value + '</li>')
        };
    },
    enterLevel: (level, path) => {
        if (level == 0) {
            console.log('<ul>');
        }
        else {
            console.log(('  ').repeat(level) + '<ul class=\"nested\">');
        };
    },
    exitLevel: (level, path) => { console.log(('  ').repeat(level) + '</ul>'); }
};

const jt = require('@tsmx/json-traverse');

jt.traverse(htmlObj, callbacksHtmlList);

// <ul>
//  <li>Key: MyArray, Value: 0,0</li>
//  <li>Key: ArrayInArry, Value: 0,1,two,three,4,5,6</li>
//  <li>Key: MyNumber, Value: 123</li>
//  <li>Key: MyString, Value: test</li>
//  <li class="caret">Key: Child</li>
//   <ul class="nested">
//    <li>Key: ChildVal, Value: 1</li>
//    <li class="caret">Key: SubChild</li>
//     <ul class="nested">
//      <li>Key: SubChildVal, Value: 777</li>
//     </ul>
//    <li>Key: ChildArray, Value: 1,2,66,9,900</li>
//   </ul>
//  <li>Key: TrailingValue, Value: testtesttest</li>
// </ul>

```

## Key-features

- Define your callbacks for the following events:
  - `processValue`: processing a traversed value
  - `enterLevel`: entering a new nesting level
  - `exitLevel`: leaving nesting level
- For every inspected value you will get rich meta-data
  - key name
  - level of nesting
  - `isObjectRoot` flag to indicate if it's an object root (root of a nested object)
  - `isArrayElement` flag to indicate if it's an array item
  - full path to the key as an array of path elements
- Provides `cbSetValue` function to change any value in-place (directly in the traversed object)
- Supports deep inspection of
  - Subobjects
  - Arrays
  - Arrays-in-Arrays
  - Subobjects-in-Arrays
- Optional array flattening (treat arrays as flat values)

## API

### traverse(obj, callbacks = null, flattenArray = false)

Traverse the `obj` and apply the defined callbacks while traversing.

#### obj

Type: `Object`

The object to be traversed.

#### callbacks

Type: `Object`
Default: `null`

An Object containing the callback functions that should be applied while traversing `obj`. Every callback is optional. The expected form is:

```js
callbacks = {
    processValue: (key, value, level, path, isObjectRoot, isArrayElement, cbSetValue) => { /* your logic here */ },
    enterLevel: (level, path) => { /* your logic here */ },
    exitLevel: (level, path) => { /* your logic here */ }
};
```

##### processValue(key, value, level, path, isObjectRoot, isArrayElement, cbSetValue)

Defined callback function that is executed on each value when traversing the object. Receives the following input parameters:

###### key

Type: `String`

The key of the current value that is processed. If an array is deep-inspected the key for each processed item is `_ + Index` (`_0`, `_1`, `_2`,...).

###### value

Type: `String`

The actual value for `key`.

###### level

Type: `Number`

The nesting level. `0` indicates the first level.

###### path

Type: `Array`

An array containing all keys that where passed to reach the current key/value pair. Example:

```js
{
    child: {
        subchild: {
            myvalue: 123;
        }
    }
}
```

When processing the value `123` with key `myvalue`, path would be `['child', 'subchild' ]`. 

For deep-inspected arrays the path would contain the name of the array itself whereas the key would be the index of the processed value. Example:

```js
{
    child: {
        subchild: {
            myvalues: [1, 2, 3]
        }
    }
}
```

When processeing the array the keys would be `_0`, `_1` and `_2` and the path would always be `['child', 'subchild', 'array']`.

###### isObjectRoot

Type: `Boolean`

`true` if the currently processed key is the root of another sub-object. In our example:

```js
{
    child: {
        subchild: {
            myvalue: 123;
        }
    }
}
```

`isObjectRoot` would be `true` for the keys `child` and `subchild`.

###### isArrayElement

Type: `Boolean`

`true` if the currently processed key is an item of an array.

###### cbSetValue(newValue)

Type: `Function`

Callback function receiving the `newValue` that should replace the currently traversed `value`.

**Note:** Setting a new value directly changes the traversed object! So if you need the original later on be sure to create a copy of the object first.

##### enterLevel(level, path)

Defined callback function that is executed on entering a new nesting level when traversing the object. Receives the following input parameters:

###### level

Type: `Number`

0-based index of the nesting level that is entered.

###### path

Type: `Array`

An array containing all keys that where passed to reach the current level that is entered.

##### exitLevel(level, path)

Defined callback function that is executed on leaving a nesting level when traversing the object. Receives the following input parameters:

###### level

Type: `Number`

0-based index of the nesting level that is exited.

###### path

Type: `Array`

An array containing all keys that where passed to reach the current level that is exited.

#### flattenArray

Type: `Boolean`
Default: `false`

If set to `true` arrays will not be iterated but treated as one single value. The default is `false`, where arrays are iterated and each entry is processed separately including deep-inspection, e.g. if the entry is an object or another array.