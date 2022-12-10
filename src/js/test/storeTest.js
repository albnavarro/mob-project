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
                value: 10,
                type: Number,
                validate: (val) => val < 10,
            }),
            obj: {
                input: () => ({
                    value: 0,
                    type: Number,
                    validate: (val) => val < 10,
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
            sum: () => ({
                value: 0,
                type: Number,
                validate: (val) => val === 3,
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
                result1.innerHTML = `input1: ${val} ,oldval: ${oldVal} , val is < 10: ${validate}`;
            }
        );
        //
        const unsubscribeObj = store.watch('obj', (val, oldVal, validate) => {
            const { input: value } = val;
            const { input: prevValue } = oldVal;
            const { input: error } = validate;

            result2.innerHTML = `input2: ${value},oldval: ${prevValue} , val is < 10:${error}`;
        });
        //
        const unsubscribeSum = store.watch('sum', (val, oldVal, validate) => {
            result3.innerHTML = `sum of input field: ${val} ,oldval: ${oldVal} , is equal 3:${validate}`;
        });

        // COMPUTED
        store.computed('sum', ['input', 'obj'], (input, obj) => {
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
            store.set('obj', { input: parseInt(inputField2.value) });
        });

        inputField3.addEventListener('click', (e) => {
            const { input } = store.get();
            const { input: inputValidation } = store.getValidation('input');
            getValidate.innerHTML = `field1: ${input},  is minus 10: ${inputValidation}`;
        });
    }
}

export const storeTest = new StoreTestClass();
