import { checkType, getTypeName, storeType } from './storeType.js';

import {
    maxDepth,
    getDataRecursive,
    getValidateRecursive,
    getTypeRecursive,
} from './storeUtils.js';

export class SimpleStore {
    /**
     * @description
     * SimpleStore inizialization.
       If objects are used, it is not possible to graft more than two levels. 
     * It is possible to have a type and a validation function for each property of the store, the supported types are:
     * `String | Number | Object | Function | Array | Boolean | Element | NodeList`.
     *
     * If the type is used the property will not be updated if it doesn't match, you will have a waring.
       The validation function is non-blocking. the validation status of each property will be displayed in the watchers and will be retrievable using the getValidation() method.
     *
     *
     * @param {Object} data - local data of the store.
     *
     * @example
     * ```js
     *
     * Use propierties with type checking:
     * const myStore = new SimpleStore({
     *     myProp: () => ({
     *         value: 10,
     *         type: Number,
     *         validate: (val) => val < 10,
     *     }),
     *     myObject: {
     *         prop1: () => ({
     *             value: 0,
     *             type: Number,
     *             validate: (val) => val < 10,
     *         }),
     *         prop2: () => ({
     *             value: document.createElement('div'),
     *             type: Element,
     *         }),
     *     }
     * });
     *
     *
     *
     * Use simlple propierties.
     * const myStore = new SimpleStore({
     *     prop1: 0,
     *     prop2: 0
     * });
     *
     *
     * Available methods:
     * myStore.set();
     * myStore.setProp();
     * myStore.setProp();
     * myStore.setObj();
     * myStore.computed();
     * myStore.get();
     * myStore.getProp();
     * myStore.getValidation();
     * myStore.watch();
     * myStore.emit();
     * myStore.debugStore();
     * myStore.debugValidate();
     * myStore.setStyle();
     * myStore.destroy();
     * ```
     */
    constructor(data = {}) {
        this.logStyle = 'padding: 10px;';

        /**
         * @private
         *
         * @description
         * Subscriber id counter
         */
        this.counterId = 0;

        /**
         * @private
         *
         * @description
         * Callback store
         */
        this.callBackWatcher = [];

        /**
         * @private
         *
         * @description
         * Callback store
         */
        this.callBackComputed = [];

        /**
         * @private
         *
         * @description
         * Object that store calidation status for each props
         */
        this.validationStatusObject = {};

        /**
         * @private
         * @description
         * Depth of initial data object
         */
        this.dataDepth = maxDepth(data);

        /**
         * @private
         *
         * @description
         * Main Object that store the value of each props/Object.
         * Max depth allowed is 2.
         */
        this.store = (() => {
            if (this.dataDepth > 2) {
                console.warn(
                    `%c data depth on store creation allowed is maximun 2 this data is ${this.dataDepth}`,
                    this.logStyle
                );
                return {};
            } else {
                return getDataRecursive(data);
            }
        })();

        /**
         * @private
         *
         * @description
         * Main Object that store the type of each props.
         * Max depth allowed is 2.
         */
        this.type = (() => {
            if (this.dataDepth > 2) {
                console.warn(
                    `%c data depth on store creation allowed is maximun 2 this data is ${this.dataDepth}`,
                    this.logStyle
                );
                return {};
            } else {
                return getTypeRecursive(data);
            }
        })();

        /**
         * @private
         *
         * @description
         * Main Object that store the validate function for every prop.
         * Max depth allowed is 2.
         */
        this.fnValidate = (() => {
            if (this.dataDepth > 2) {
                console.warn(
                    `%c data depth on store creation allowed is maximun 2 this data is ${this.dataDepth}`,
                    this.logStyle
                );
                return {};
            } else {
                return getValidateRecursive(data);
            }
        })();

        this.inizializeValidation();
    }

    /**
     * @private
     *
     * @description
     * Inizialize validation status for each prop.
     */
    inizializeValidation() {
        /**
         * Inizialize empty Object if prop is an object.
         */
        for (const key in this.store) {
            if (storeType.isObject(this.store[key]))
                this.validationStatusObject[key] = {};
        }

        /**
         * First run execute each propierites to check validation without fire event
         */
        Object.entries(this.store).forEach((item) => {
            const [key, value] = item;
            this.set(key, value, false);
        });
    }

    /**
     * @private
     * @description
     * Update prop target of computed.
     */
    fireComputed(propChanged) {
        this.callBackComputed.forEach((item) => {
            const {
                prop: propToUpdate,
                keys: propsShouldChange,
                fn: computedFn,
            } = item;

            /**
             * I'm getting the list of all the store keys
             */
            const storeKeys = Object.keys(this.store);

            /**
             * I check that all keys to monitor in computed exist in the store*
             */
            const propsShouldChangeIsInStore = propsShouldChange.every((item) =>
                storeKeys.includes(item)
            );

            /**
             * If one of the keys to monitor does not exist in the store, I interrupt.
             */
            if (!propsShouldChangeIsInStore) {
                console.warn(
                    `%c one of this key ${propsShouldChange} defined in computed method of prop to monitor '${propToUpdate}' prop not exist`,
                    this.logStyle
                );

                return;
            }

            /**
             * I check that the incoming prop is a computed dependency
             * It is the key control that triggers the computed
             */
            const propChangedIsDependency =
                propsShouldChange.includes(propChanged);

            if (!propChangedIsDependency) return;

            /**
             * I take the value of each property given the key
             */
            const propValues = propsShouldChange.map((item) => {
                return this.store[item];
            });

            /**
             * I generate the value from the callback function to pass to the
             * setters to update the prop
             */
            const computedValue = computedFn(...propValues);
            this.set(propToUpdate, computedValue);
        });
    }

    /**
     * @param {String} prop - propierties to update
     * @param {any} value - new value
     * @param {Boolean} fireCallback - fire watcher callback on update,  default value is `true`
     *
     * @description
     * Update object and non-objects propierties
     *
     * @example
     * ```js
     * myStore.set('myProp', newValue, true);
     * myStore.set('myPropObject', { myProp: newValue, ... });
     *
     * ```
     */
    set(prop, value, fireCallback = true) {
        /**
         * Check if prop exist in store
         */
        if (!(prop in this.store)) {
            console.warn(
                `%c trying to execute set method: store.${prop} not exist`,
                this.logStyle
            );
            return;
        }

        if (storeType.isObject(this.store[prop])) {
            this.setObj(prop, value, fireCallback);
        } else {
            this.setProp(prop, value, fireCallback);
        }
    }

    /**
     * @param {String} prop - propierties to update
     * @param {any} value - new value
     * @param {Boolean} fireCallback - fire watcher callback on update,  default value is `true`
     *
     * @description
     * Update non-object propierties
     *
     * @example
     * ```js
     * myStore.setProp('myProp', newValue, true);
     *
     * ```
     */
    setProp(prop, val, fireCallback = true) {
        /**
         * Check if val is an Object
         */
        if (storeType.isObject(val)) {
            console.warn(
                `%c trying to execute setProp method on '${prop}' propierties: setProp methods doasn't allow objects as value, ${JSON.stringify(
                    val
                )} is an Object`,
                this.logStyle
            );
            return;
        }

        /**
         * Check if prop is an Object
         */
        if (storeType.isObject(this.store[prop])) {
            console.warn(
                `%c trying to execute setProp method on '${prop}' propierties: '${JSON.stringify(
                    prop
                )}' is an objects`,
                this.logStyle
            );
            return;
        }

        const isValidType = checkType(this.type[prop], val);
        if (!isValidType) {
            console.warn(
                `%c trying to execute setProp method on '${prop}' propierties: ${val} is not ${getTypeName(
                    this.type[prop]
                )}`,
                this.logStyle
            );
            return;
        }

        /**
         * Check if there is a validate function and update validationStatusObject arr
         */
        this.validationStatusObject[prop] = this.fnValidate[prop](val);

        /**
         * Update value and fire callback associated
         */
        const oldVal = this.store[prop];
        this.store[prop] = val;

        if (fireCallback) {
            const fnByProp = this.callBackWatcher.filter(
                (item) => item.prop === prop
            );
            fnByProp.forEach((item) => {
                item.fn(val, oldVal, this.validationStatusObject[prop]);
            });
        }

        this.fireComputed(prop);
    }

    /**
     * @param {String} prop - propierties to update
     * @param {any} value - new value
     * @param {Boolean} fireCallback - fire watcher callback on update,  default value is `true`
     *
     * @description
     * Update object propierties
     *
     * @example
     * ```js
     * myStore.set('myPropObject', { myProp: newValue, ... }, true);
     *
     * ```
     */
    setObj(prop, val, fireCallback = true) {
        /**
         * Check if val is not an Object
         */
        if (!storeType.isObject(val)) {
            console.warn(
                `%c trying to execute setObj method on '${prop}' propierties: setObj methods allow only objects as value, ${val} is not an Object`,
                this.logStyle
            );
            return;
        }

        /**
         * Check if prop is not an Object
         */
        if (!storeType.isObject(this.store[prop])) {
            console.warn(
                `%c trying to execute setObj data method on '${prop}' propierties: store propierties '${prop}' is not an object`,
                this.logStyle
            );
            return;
        }

        /**
         * Check if prop has val keys
         */
        const valKeys = Object.keys(val);
        const propKeys = Object.keys(this.store[prop]);
        const hasKeys = valKeys.every((item) => propKeys.includes(item));
        if (!hasKeys) {
            console.warn(
                `%c trying to execute setObj data method: one of these keys '${valKeys}' not exist in store.${prop}`,
                this.logStyle
            );
            return;
        }

        /**
         * Check val have nested Object
         */
        const dataDepth = maxDepth(val);
        if (dataDepth > 1) {
            console.warn(
                `%c trying to execute setObj data method on '${prop}' propierties: '${JSON.stringify(
                    val
                )}' have a depth > 1, nested obj is not allowed`,
                this.logStyle
            );
            return;
        }

        // Check type of eachpropierties
        const isValidType = Object.entries(val)
            .map((item) => {
                const [subProp, subVal] = item;
                const typeResponse = checkType(
                    this.type[prop][subProp],
                    subVal
                );

                if (!typeResponse) {
                    console.warn(
                        `%c trying to execute setObj data method on ${prop}.${subProp} propierties: ${subVal} is not a ${getTypeName(
                            this.type[prop][subProp]
                        )}`,
                        this.logStyle
                    );
                }

                return typeResponse;
            })
            .every((item) => item === true);

        if (!isValidType) {
            return;
        }

        /**
         * Validate value (value passed to setObj is a Object to merge with original) and store the result in validationStatusObject arr
         * id there is no validation return true, otherwse get boolean value from fnValidate obj
         */

        Object.entries(val).forEach((item) => {
            const [subProp, subVal] = item;
            this.validationStatusObject[prop][subProp] =
                this.fnValidate[prop][subProp](subVal);
        });

        /**
         * Update value and fire callback associated
         */
        const oldVal = this.store[prop];
        this.store[prop] = { ...this.store[prop], ...val };

        if (fireCallback) {
            const fnByProp = this.callBackWatcher.filter(
                (item) => item.prop === prop
            );
            fnByProp.forEach((item) => {
                item.fn(
                    this.store[prop],
                    oldVal,
                    this.validationStatusObject[prop]
                );
            });
        }

        this.fireComputed(prop);
    }

    /**
     * @description
     * Get store object
     *
     * @example
     * ```js
     * const storeObject = myStore.get();
     * const { myProp } = myStore.get();
     *
     * ```
     *
     */
    get() {
        return this.store;
    }

    /**
     * @param {string} prop - propierites froms store.
     * @returns {any} property value
     *
     * @description
     * Get specific prop from store.
     *
     * @example
     * ```js
     * const myProp= myStore.get('myProp');
     *
     * ```
     */
    getProp(prop) {
        if (prop in this.store) {
            return this.store[prop];
        } else {
            console.warn(
                `%c trying to execute get data method: store.${prop} not exist`,
                this.logStyle
            );
        }
    }

    /**
     * @returns {Object} Object validation.
     *
     * @description
     * Get validation object status
     *
     * @example
     * ```js
     * const storeValidationObject = myStore.getValidation();
     * const { myProp } = myStore.getValidation();
     *
     * ```
     *
     */
    getValidation() {
        return this.validationStatusObject;
    }

    /**
     * @param {String} prop - property to watch.
     * @param {function(any,any,(boolean|object))} callback - callback Function, fired on prop value change
     * @returns {function} unsubscribe function
     *
     * @description
     * Watch property mutation
     *
     * @example
     * ```js
     *
     * const unsubscribe =  myStore.watch('myProp', (newVal, oldVal, validate) => {
     *      // code
     * })
     * unsubscribe();
     *
     *
     * ```
     */
    watch(prop, callback = () => {}) {
        this.callBackWatcher.push({
            prop,
            fn: callback,
            id: this.counterId,
        });

        const cbId = this.counterId;
        this.counterId++;

        return () => {
            this.callBackWatcher = this.callBackWatcher.filter(
                (item) => item.id !== cbId
            );
        };
    }

    /**
     * @description
     * Fire callback related to specific property.
     *
     * @param {string} prop
     *
     * @example
     * ```js
     * myStore.emit('myProp');
     * ```
     */
    emit(prop) {
        if (prop in this.store) {
            const fnByProp = this.callBackWatcher.filter(
                (item) => item.prop === prop
            );
            fnByProp.forEach((item) => {
                // Val , OldVal, Validate
                item.fn(
                    this.store[prop],
                    this.store[prop],
                    this.validationStatusObject[prop]
                );
            });
        } else {
            console.warn(
                `trying to execute set data method: store.${prop} not exist`
            );
        }
    }

    /**
     * @description
     * Run a console.log() of store object.
     */
    debugStore() {
        console.log(this.store);
    }

    /**
     * @description
     * Run a console.log() of validation object
     */
    debugValidate() {
        console.log(this.validationStatusObject);
    }

    /**
     * @description
     * Modify style of warining.
     * Utils to have a different style for each store.
     *
     * @example
     * Store.setStyle('color:#ccc;');
     */
    setStyle(string) {
        this.logStyle = string;
    }

    /**
     * @param  {string} prop - Property in store to update
     * @param  {Array.<String>} keys - Array of property to watch.
     * @param {function(any,any):any} fn - Callback function launched when one of the properties of the array changes, the result of the function will be the new value of the property. The parameters of the function are the current values of the properties specified in the array.
     *
     * @description
     * Update propierties value if some dependency change.
     *
     *
     * @example
     * ```js
     * Prop target is not an object, and dependency is not an object:
     * myStore.computed('prop', ['prop1', 'prop2'], (val1, val2) => {
     *     return val1 + val2;
     * });
     *
     * Prop target is not an object and dependency is an object.
     * myStore.computed('prop', ['objectProp'], (obj) => {
     *      return obj.val1 + obj.val2;
     * })
     *
     * Prop target is an object and dependency is not an object.
       When target is on object the result will be mergerd with original object.
     * myStore.computed('objectProp', ['prop1', 'prop2'], (val1, val2) => {
     *     return { sum: val1 + val2 };
     * });
     *
     * Prop target is an object, and dependency is an object.
       When target is on object the result will be mergerd with original object.
     * myStore.computed('objectProp', ['objectProp1'], (obj) => {
     *     return { sum: obj.val1 + obj.val2 };
     * });
     * ```
     */
    computed(prop, keys, fn) {
        // Create a temp array with the fuiture computeda added to check
        const tempComputedArray = [
            ...this.callBackComputed,
            ...[{ prop, keys, fn }],
        ];

        // Get all prop stored in tempComputedArray
        const propList = tempComputedArray.map((item) => item.prop).flat();

        //  Keys can't be a prop used in some computed
        const keysIsusedInSomeComputed = propList.some((item) =>
            keys.includes(item)
        );

        // Key is not a prop
        const keysIsNotProp = keys.includes(prop);

        /**
         * if - Key to watch can't be a prop used in some computed to avoid infinite loop
         *
         * @param  {Bollean} keysIsusedInSomeComputed
         * @return {void}
         */
        if (keysIsusedInSomeComputed) {
            console.warn(
                `%c una delel chiavi [${keys}] é gia usata come target di una computed`,
                this.logStyle
            );
            return;
        }

        /**
         * if - Key to watch can't be a prop to mutate to avoid infinite loop
         *
         * @param  {Bollean} keysIsNotProp
         * @return {void}
         */
        if (keysIsNotProp) {
            console.warn(
                `%c una delel chiavi [${keys}] coincide con la prop '${prop}' da mutare`,
                this.logStyle
            );
            return;
        }

        this.callBackComputed.push({
            prop,
            keys,
            fn,
        });
    }

    /**
     * @descrition
     * Delete all data inside store.
     */
    destroy() {
        this.counterId = 0;
        this.callBackWatcher = [];
        this.callBackComputed = [];
        this.validationStatusObject = {};
        this.store = {};
        this.type = {};
        this.fnValidate = {};
    }
}
