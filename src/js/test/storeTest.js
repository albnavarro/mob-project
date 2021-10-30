import { SimpleStore } from '../utility/simpleStore.js';

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

        store.watch('input', (val, oldVal, validate) => {
            result1.innerHTML = `val: ${val} ,oldval: ${oldVal} , validate:${validate}`;
        });

        store.watch('obj', (val, oldVal, validate) => {
            const { input } = val;
            const { input: prevValue } = oldVal;
            const { input: error } = validate;

            result2.innerHTML = `val: ${input},oldval: ${prevValue} , validate:${error}`;
        });

        store.watch('sum', (val, oldVal, validate) => {
            result3.innerHTML = `val: ${val} ,oldval: ${oldVal} , validate:${validate}`;
        });

        store.addComputed('sum', ['input', 'obj'], (input, obj) => {
            return parseInt(input) + parseInt(obj.input);
        });

        inputField1.addEventListener('input', (e) => {
            store.setProp('input', inputField1.value);
        });

        inputField2.addEventListener('input', (e) => {
            store.setObj('obj', { input: inputField2.value });
        });

        inputField3.addEventListener('click', (e) => {
            const field1 = store.getProp('input');
            const field1isValid = store.getValidation('input');
            getValidate.innerHTML = `field1: ${field1} validator status is ${field1isValid}`;
        });
    }
}

export const storeTest = new StoreTestClass();
