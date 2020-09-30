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
    processValue: (key, value, level, path, isObjectRoot, isArrayElement, cbSetNewVal) => { 
        console.log(level + ' ' + (path.length > 0 ? (path.join('.') + '.') : '') + key + ' = ' + value); 
    }
};

const jt = require('@tsmx/json-traverse');

// print in default array-mode (arrays are iterated)
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

// print in flat array-mode (arrays are treated as one value and not inspected deeper)
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
    processValue: (key, value, level, path, isObjectRoot, isArrayElement, cbSetNewVal) => { 
        // change values of properties starting with 'My' and
        // multiply all numeric array values greater then 50 by 100
        if (key.startsWith('My')) {
            cbSetNewVal('MyNew-' + value);
        }
        if (isArrayElement && parseInt(value) > 50) {
            cbSetNewVal(100 * parseInt(value));
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

### Example 3: convert a more complex to an collapsable HTML list

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
    processValue: (key, value, level, path, isObjectRoot, isArrayElement, cbSetNewVal) => {
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
    leaveLevel: (level, path) => { console.log(('  ').repeat(level) + '</ul>'); }
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