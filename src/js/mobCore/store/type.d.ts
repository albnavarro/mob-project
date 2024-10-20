export type storeMap = Map<string, storeMapValue>;

export type validateState = boolean | { [key: string]: boolean };

export interface storeMapValue {
    callBackWatcher: Map<
        string,
        {
            prop: string;
            fn: (current: any, previous: any, validate: validateState) => void;
        }
    >;
    callBackComputed: Set<{ prop: string; fn: () => void; keys: string[] }>;
    lastestPropsChanged: Set<string>;
    validationStatusObject: {
        [key: string]: validateState;
    };
    dataDepth: number;
    computedRunning: boolean;
    store: {
        [key: string]: any | { [key: string]: any };
    };
    type: {
        [key: string]:
            | mobStoreTypeNative
            | mobStoreTypeAlias
            | {
                  [key: string]: mobStoreTypeNative | mobStoreTypeAlias;
              };
    };
    fnValidate: {
        [key: string]:
            | (() => boolean)
            | {
                  [key: string]: () => boolean;
              };
    };
    strict: {
        [key: string]:
            | boolean
            | {
                  [key: string]: boolean;
              };
    };
    skipEqual: {
        [key: string]:
            | boolean
            | {
                  [key: string]: boolean;
              };
    };
}

export interface storePublicMethods {
    get: getType;
    getProp: getPropType;
    set: setType;
    quickSetProp: quickSetPropType;
    watch: watchType;
    computed: computedType;
    emit: emitType;
    emitAsync: emitAsyncType;
    getValidation: () => object;
    debug: () => void;
    debugStore: () => void;
    debugValidate: () => void;
    destroy: () => void;
}

export type getType = () => any;

export type getPropType = (arg0: string) => any;

export type setType = (
    prop: string,
    value: any | ((arg0: any) => any),
    fireCallback?: boolean,
    clone?: boolean
) => any;

export type quickSetPropType = (prop: string, value: any) => void;

export type watchType = (
    prop: string,
    callback: (current: any, previous: any, validate: validateState) => void
) => () => void;

export type computedType = (
    prop: string,
    keys: string[],
    callback: () => void
) => void;

export type emitType = (props: string) => void;

export type emitAsyncType = (props: string) => Promise<{ success: boolean }>;

export type mobStoreTypeAlias =
    | 'String'
    | 'Number'
    | 'Object'
    | 'Function'
    | 'Array'
    | 'Boolean'
    | 'Element'
    | 'Map'
    | 'Set'
    | 'NodeList'
    | 'Any';

export type mobStoreTypeNative =
    | string
    | number
    | object
    | (() => void)
    | Array<any>
    | boolean
    | Element
    | Map<any, any>
    | Set<any>
    | NodeList;

export interface storeSet {
    prop: string;
    value: any | ((arg0: any) => any);
    fireCallback?: boolean;
    clone?: boolean;
}

export interface storeSetEntryPoint {
    instanceId: string;
    prop: string;
    value: any | ((arg0: any) => any);
    fireCallback?: boolean;
    clone?: boolean;
}

export interface storeSetAction extends storeSet {
    instanceId: string;
    useStrict?: boolean;
    state: storeMapValue;
}

export interface storeQuickSetEntryPoint {
    instanceId: string;
    prop: string;
    value: any | ((arg0: any) => any);
}

export interface storeWatch {
    prop: string;
    callback: (current: any, previous: any, validate: validateState) => void;
}

export interface storeWatchAction extends storeWatch {
    state: storeMapValue;
}

export interface storeWatchReturnObject {
    state: storeMapValue | undefined;
    unsubscribeId: string;
}

export interface storeComputed {
    prop: string;
    keys: string[];
    fn: () => void;
}

export interface storeComputedAction extends storeComputed {
    state: storeMapValue;
}

export interface callbackQueue {
    callBackWatcher: Map<
        string,
        {
            prop: string;
            fn: (
                arg0: any,
                arg1: any,
                arg2: boolean | { [key: string]: boolean }
            ) => void | Promise<void>;
        }
    >;
    prop: string;
    newValue: any;
    oldValue: any;
    validationValue: boolean | { [key: string]: boolean };
}

export type simpleStoreCustomValue = () => {
    /**
     * @description
     * Initial value
     */
    value: any;

    /**
     * @description
     *  Supported types:
     * `String|Number|Object|Function|Array|Boolean|Element|HTMLElement|Map|Set|NodeList|"Any"`.
     *  The property will not be updated if it doesn't match, you will have a warning.
     *  For custom Object use 'Any'.
     *  Support Constructor || String.
     *  Es: type: Number || type: 'Number'
     */
    type?: any;

    /**
     * @description
     * Validation function to parse value.
     * This function will have the current value and old value as input parameter and will return a boolean value.
     * The validation status of each property will be displayed in the watchers and will be retrievable using the getValidation() method.
     */
    validate?: (arg0: any, arg1: any) => boolean;

    /**
     * @description
     * If set to true, the validation function will become blocking and the property will be updated only if the validation function is successful.
     * THe default value is `false`.
     */
    strict?: boolean;

    /**
     * @description
     * If the value is equal to the previous one, the property will not be updated. The watches will not be executed and the property will have no effect on the computed related to it.
     * The default value is `true`.
     */
    skipEqual?: boolean;
};

export interface mobStoreBaseData {
    [key: string]:
        | simpleStoreCustomValue
        | number
        | string
        | object
        | mobStoreBaseData;
}
