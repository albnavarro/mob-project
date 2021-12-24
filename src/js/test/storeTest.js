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
        store.watch('input', (val, oldVal, validate) => {
            result1.innerHTML = `input1: ${val} ,oldval: ${oldVal} , validate:${validate}`;
        });

        store.watch('obj', (val, oldVal, validate) => {
            const { input: value } = val;
            const { input: prevValue } = oldVal;
            const { input: error } = validate;

            result2.innerHTML = `input2: ${value},oldval: ${prevValue} , validate:${error}`;
        });

        store.watch('sum', (val, oldVal, validate) => {
            result3.innerHTML = `sum of input field: ${val} ,oldval: ${oldVal} , is equal 3:${validate}`;
        });

        // COMPUTED
        store.addComputed('sum', ['input', 'obj'], (input, obj) => {
            const input1IsValid = store.getValidation('input');
            const { input: input2IsValid } = store.getValidation('obj');

            return input1IsValid && input2IsValid
                ? parseInt(input) + parseInt(obj.input)
                : null;
        });

        // HANDLER
        inputField1.addEventListener('input', (e) => {
            store.setProp('input', inputField1.value);
        });

        inputField2.addEventListener('input', (e) => {
            store.setObj('obj', { input: inputField2.value });
        });

        inputField3.addEventListener('click', (e) => {
            const field1 = store.getProp('input');
            const field1isValid = store.getValidation('input');
            getValidate.innerHTML = `field1: ${field1},  is number: ${field1isValid}`;
        });
    }
}

export const storeTest = new StoreTestClass();
