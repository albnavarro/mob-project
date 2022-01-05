import { SimpleStore } from '../core/store/simpleStore.js';

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

        const store = new SimpleStore({
            input: 0,
            obj: {
                input: 0,
            },
            sum: 0,
        });

        store.validate({
            input: (val) => !isNaN(parseFloat(val)) && isFinite(val),
            obj: {
                input: (val) => !isNaN(parseFloat(val)) && isFinite(val),
            },
            sum: (val) => val === 3,
        });

        // WATCHER
        const unsubscribeInput = store.watch(
            'input',
            (val, oldVal, validate) => {
                result1.innerHTML = `input1: ${val} ,oldval: ${oldVal} , validate:${validate}`;
            }
        );

        const unsubscribeObj = store.watch('obj', (val, oldVal, validate) => {
            const { input: value } = val;
            const { input: prevValue } = oldVal;
            const { input: error } = validate;

            result2.innerHTML = `input2: ${value},oldval: ${prevValue} , validate:${error}`;
        });

        const unsubscribeSum = store.watch('sum', (val, oldVal, validate) => {
            result3.innerHTML = `sum of input field: ${val} ,oldval: ${oldVal} , is equal 3:${validate}`;
        });

        // COMPUTED
        store.computed('sum', ['input', 'obj'], (input, obj) => {
            const { input: inputValidation } = store.getValidation();
            const { obj: inputObjectValidation } = store.getValidation();

            return inputValidation && inputObjectValidation.input
                ? parseInt(input) + parseInt(obj.input)
                : null;
        });

        // HANDLER
        inputField1.addEventListener('input', (e) => {
            store.set('input', inputField1.value);
        });

        inputField2.addEventListener('input', (e) => {
            store.set('obj', { input: inputField2.value });
        });

        inputField3.addEventListener('click', (e) => {
            const { input } = store.get();
            const { input: inputValidation } = store.getValidation('input');
            getValidate.innerHTML = `field1: ${input},  is number: ${inputValidation}`;
        });
    }
}

export const storeTest = new StoreTestClass();
