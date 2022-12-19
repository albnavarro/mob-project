import { mobbu } from '../core';

class StoreTestClass {
    constructor() {}

    init() {
        const inputField1 = document.querySelector('.input1');
        const inputField2 = document.querySelector('.input2');
        const inputField3 = document.querySelector('.input3');

        const result1 = document.querySelector('.result1');
        const result2 = document.querySelector('.result2');
        const result3 = document.querySelector('.result3');

        const getValidate = document.querySelector('.getValidate');

        const store = mobbu.createStore({
            input: () => ({
                value: 0,
                type: Number,
                validate: (val) => val < 10,
                strict: true,
                skipEqual: true,
            }),
            obj: {
                input: () => ({
                    value: 0,
                    type: Number,
                    validate: (val) => val < 10,
                    strict: true,
                    skipEqual: true,
                }),
                test: () => ({
                    value: 0,
                    type: Number,
                    validate: (val) => val < 10,
                    strict: true,
                }),
                test2: () => ({
                    value: 0,
                    type: Number,
                    validate: (val) => val < 5,
                    strict: true,
                    skipEqual: false,
                }),
                testElement: () => ({
                    value: document.createElement('div'),
                    type: Element,
                }),
                testNodeList: () => ({
                    value: document.querySelectorAll('.dummyNodelist'),
                    type: NodeList,
                }),
            },
            batchTest: () => ({
                value: 0,
                skipEqual: false,
            }),
            sum: () => ({
                value: 0,
                type: Number,
                validate: (val) => val === 3,
                skipEqual: true,
            }),
        });

        store.set('obj', { testElement: result1 });
        store.set('obj', { testNodeList: document.querySelectorAll('button') });

        store.debugStore();
        store.debugValidate();

        // WATCHER
        const unsubscribeInput = store.watch(
            'input',
            (val, oldVal, validate) => {
                console.log('Input watched fired');
                result1.innerHTML = `input1: ${val} ,oldval: ${oldVal} , val is < 10: ${validate}`;
            }
        );
        //
        const unsubscribeObj = store.watch('obj', (val, oldVal, validate) => {
            console.log('Object watched fired');
            const { input: value } = val;
            const { input: prevValue } = oldVal;
            const { input: error } = validate;

            result2.innerHTML = `input2: ${value},oldval: ${prevValue} , val is < 10:${error}`;
        });
        //
        const unsubscribeBatch = store.watch(
            'batchTest',
            (val, oldVal, validate) => {
                console.log('Batch watched fired');
            }
        );
        //
        const unsubscribeSum = store.watch('sum', (val, oldVal, validate) => {
            console.log('sum watched fired');
            store.debugStore();
            console.log('-----------');
            result3.innerHTML = `sum of input field: ${val} ,oldval: ${oldVal} , is equal 3:${validate}`;
        });

        // COMPUTED
        store.computed('sum', ['input', 'obj', 'batchTest'], (input, obj) => {
            const { input: inputValidation } = store.getValidation();
            const { obj: inputObjectValidation } = store.getValidation();

            return inputValidation && inputObjectValidation.input
                ? input + obj.input
                : 0;
        });

        // HANDLER
        inputField1.addEventListener('input', (e) => {
            store.set('input', parseInt(inputField1.value));
        });

        inputField2.addEventListener('input', (e) => {
            store.set('obj', (value) => ({
                input: parseInt(inputField2.value),
                test: 22,
                test2: value.test2 + 1,
            }));

            // test multiple state change on the samle computed
            // computed fire once
            store.set('batchTest', (val) => val + 1);
        });

        inputField3.addEventListener('click', (e) => {
            const { input } = store.get();
            const { input: inputValidation } = store.getValidation('input');
            getValidate.innerHTML = `field1: ${input},  is minus 10: ${inputValidation}`;
        });
    }
}

export const storeTest = new StoreTestClass();
