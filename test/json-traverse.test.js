describe('json-traverse test suite', () => {

    const jt = require('../json-traverse');

    var testOutput = [];
    const originalConsoleLog = console.log;
    const testConsoleLog = (output) => { testOutput.push(output) };

    const simpleTestObj = {
        'MyValue': 'test',
        'OtherValue': 'zzz',
        'NumberValue': 311,
        'MyArray': [1, 2, 3, 50, 60, 70]
    };

    const complexTestObj = {
        'arr': [0, 0],
        'arr-in-arr': [0, 1, ['two', 'three', [4, 5, 6]]],
        'number': 123,
        'string': 'ttt',
        'parent': {
            'test': 1,
            'child': {
                'childval': 777
            },
            'array': [1, 2, 66, 9, { 'array-ob-key': 'zzz', 'array-in-array': ['a', 'b', 'c'] }, 900]
        },
        'trail': 'testtesttest'
    };

    const htmlTestobj = {
        'arr': [0, 0],
        'arr-in-arr': [0, 1, ['two', 'three', [4, 5, 6]]],
        'number': 123,
        'string': 'test',
        'parent': {
            'test': 1,
            'child': {
                'childval': 777
            },
            'array': [1, 2, 66, 9, 900]
        },
        'trail': 'testtesttest'
    };

    beforeEach(() => {
        console.log = testConsoleLog;
        testOutput = [];

    });

    afterEach(() => {
        console.log = originalConsoleLog;
    });

    it('tests a manipulation of plain properties and array entries', async (done) => {
        callbacksChangeValue = {
            processValue: (key, value, level, path, isObjectRoot, isArrayElement, cbSetNewVal) => {
                if (key.startsWith('My')) {
                    cbSetNewVal('MyNew-' + value);
                }
                if (isArrayElement && parseInt(value) > 50) {
                    cbSetNewVal(100 * parseInt(value));
                }
            },
        };
        jt.traverse(simpleTestObj, callbacksChangeValue);
        expect(simpleTestObj.MyValue).toBe('MyNew-test');
        expect(simpleTestObj.OtherValue).toBe('zzz');
        expect(simpleTestObj.NumberValue).toBe(311);
        expect(simpleTestObj.MyArray.length).toBe(6);
        expect(simpleTestObj.MyArray[0]).toBe(1);
        expect(simpleTestObj.MyArray[1]).toBe(2);
        expect(simpleTestObj.MyArray[2]).toBe(3);
        expect(simpleTestObj.MyArray[3]).toBe(50);
        expect(simpleTestObj.MyArray[4]).toBe(6000);
        expect(simpleTestObj.MyArray[5]).toBe(7000);
        done();
    });

    it('tests a full traversal of a complex JSON object', async (done) => {
        callbacks = {
            processValue: (key, value, level, path, isObjectRoot, isArrayElement) => {
                console.log(level + ' ' + (path.length > 0 ? (path.join('.') + '.') : '') + key + ' = ' + value);
            },
            enterLevel: (level, path) => { console.log('Entering level ' + level + '...'); },
            leaveLevel: (level, path) => { console.log('Leaving level ' + level + '...'); }
        };
        jt.traverse(complexTestObj, callbacks);
        expect(testOutput.length).toBe(37);
        expect(testOutput[0]).toBe('Entering level 0...');
        expect(testOutput[1]).toBe('0 arr._0 = 0');
        expect(testOutput[2]).toBe('0 arr._1 = 0');
        expect(testOutput[3]).toBe('0 arr-in-arr._0 = 0');
        expect(testOutput[4]).toBe('0 arr-in-arr._1 = 1');
        expect(testOutput[5]).toBe('0 arr-in-arr._2 = two,three,4,5,6');
        expect(testOutput[6]).toBe('Entering level 1...');
        expect(testOutput[7]).toBe('1 arr-in-arr._2.0 = two');
        expect(testOutput[8]).toBe('1 arr-in-arr._2.1 = three');
        expect(testOutput[9]).toBe('1 arr-in-arr._2.2._0 = 4');
        expect(testOutput[10]).toBe('1 arr-in-arr._2.2._1 = 5');
        expect(testOutput[11]).toBe('1 arr-in-arr._2.2._2 = 6');
        expect(testOutput[12]).toBe('Leaving level 1...');
        expect(testOutput[13]).toBe('0 number = 123');
        expect(testOutput[14]).toBe('0 string = ttt');
        expect(testOutput[15]).toBe('0 parent = [object Object]');
        expect(testOutput[16]).toBe('Entering level 1...');
        expect(testOutput[17]).toBe('1 parent.test = 1');
        expect(testOutput[18]).toBe('1 parent.child = [object Object]');
        expect(testOutput[19]).toBe('Entering level 2...');
        expect(testOutput[20]).toBe('2 parent.child.childval = 777');
        expect(testOutput[21]).toBe('Leaving level 2...');
        expect(testOutput[22]).toBe('1 parent.array._0 = 1');
        expect(testOutput[23]).toBe('1 parent.array._1 = 2');
        expect(testOutput[24]).toBe('1 parent.array._2 = 66');
        expect(testOutput[25]).toBe('1 parent.array._3 = 9');
        expect(testOutput[26]).toBe('1 parent.array._4 = [object Object]');
        expect(testOutput[27]).toBe('Entering level 2...');
        expect(testOutput[28]).toBe('2 parent.array._4.array-ob-key = zzz');
        expect(testOutput[29]).toBe('2 parent.array._4.array-in-array._0 = a');
        expect(testOutput[30]).toBe('2 parent.array._4.array-in-array._1 = b');
        expect(testOutput[31]).toBe('2 parent.array._4.array-in-array._2 = c');
        expect(testOutput[32]).toBe('Leaving level 2...');
        expect(testOutput[33]).toBe('1 parent.array._5 = 900');
        expect(testOutput[34]).toBe('Leaving level 1...');
        expect(testOutput[35]).toBe('0 trail = testtesttest');
        expect(testOutput[36]).toBe('Leaving level 0...');
        done();
    });

    it('tests a conversion to a HTML list of a complex JSON object', async (done) => {
        callbacksHtml = {
            processValue: (key, value, level, path, isObjectRoot, isArrayElement) => {
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
        jt.traverse(htmlTestobj, callbacksHtml, true);
        expect(testOutput.length).toBe(16);
        expect(testOutput[0]).toBe('<ul>');
        expect(testOutput[1]).toBe(' <li>Key: arr, Value: 0,0</li>');
        expect(testOutput[2]).toBe(' <li>Key: arr-in-arr, Value: 0,1,two,three,4,5,6</li>');
        expect(testOutput[3]).toBe(' <li>Key: number, Value: 123</li>');
        expect(testOutput[4]).toBe(' <li>Key: string, Value: test</li>');
        expect(testOutput[5]).toBe(' <li class="caret">Key: parent</li>');
        expect(testOutput[6]).toBe('  <ul class="nested">');
        expect(testOutput[7]).toBe('   <li>Key: test, Value: 1</li>');
        expect(testOutput[8]).toBe('   <li class="caret">Key: child</li>');
        expect(testOutput[9]).toBe('    <ul class="nested">');
        expect(testOutput[10]).toBe('     <li>Key: childval, Value: 777</li>');
        expect(testOutput[11]).toBe('    </ul>');
        expect(testOutput[12]).toBe('   <li>Key: array, Value: 1,2,66,9,900</li>');
        expect(testOutput[13]).toBe('  </ul>');
        expect(testOutput[14]).toBe(' <li>Key: trail, Value: testtesttest</li>');
        expect(testOutput[15]).toBe('</ul>');
        done();
    });

});