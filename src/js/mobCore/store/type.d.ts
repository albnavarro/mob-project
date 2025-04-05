export type OnlyStringKey<T> = Extract<keyof T, string>;
export type NotValue<T, K> = T extends K ? never : T;

export type StoreMap = Map<string, StoreMapValue>;

export type MobStoreValidateState = boolean | Record<string, boolean>;

export interface StoreMapValue {
    callBackWatcher: Map<
        string,
        {
            prop: string;
            fn: (
                current: any,
                previous: any,
                validate: MobStoreValidateState
            ) => void;
            wait: boolean;
        }
    >;
    callBackComputed: Set<{
        prop: string;
        fn: (arg0: Record<string, any>) => void;
        keys: string[];
    }>;
    computedPropsQueque: Set<string>;
    validationStatusObject: Record<string, any>;
    dataDepth: number;
    computedRunning: boolean;
    store: Record<string, any>;
    type: Record<string, any>;
    fnTransformation: Record<string, any>;
    fnValidate: Record<string, any>;
    strict: Record<string, any>;
    skipEqual: Record<string, any>;
    proxiObject?: Record<string, any> | null | undefined;
    bindInstance: string[];
    bindInstanceBy: string[];
    unsubscribeBindInstance: (() => void)[];
}

/**
 * Main component.
 */
type StoreDefaultMap = Record<string, any>;

export type MobStore = <T>(arg0: MobStoreParams<T>) => MobStoreReturnType<T>;

export interface MobStoreReturnType<T extends StoreDefaultMap> {
    getId: MobStoregetId;
    bindStore: BindStore;
    get: MobStoreGet<T>;
    getProp: MobStoregetProp<T>;
    set: MobStoreSet<T>;
    update: MobStoreUpdate<T>;
    quickSetProp: MobStorequickSetProp<T>;
    watch: MobStoreWatch<T>;
    computed: MobStoreComputed<T>;
    emit: MobStoreEmit<T>;
    emitAsync: MobStoreEmitAsync<T>;
    getProxi: MobStoreStoreProxi<T>;
    getValidation: () => object | undefined;
    debug: () => void;
    debugStore: () => void;
    debugValidate: () => void;
    destroy: () => void;
}

export type BindStoreValueType =
    | MobStoreReturnType<any>
    | MobStoreReturnType<any>[];

export type BindStore = (value: BindStoreValueType) => void;

export type MobStoreGet<T> = () => T;

export type MobStoregetId = () => string;

export type MobStoregetProp<T> = <K extends keyof T>(
    arg0: Extract<K, string>
) => T[K];

export type MobStoreSet<T> = <K extends keyof T>(
    prop: Extract<K, string>,
    value: T[K],
    options?: {
        emit?: boolean;
    }
) => void;

export type MobStoreUpdate<T> = <K extends keyof T>(
    prop: Extract<K, string>,
    value: (arg0: T[K]) => T[K],
    options?: {
        emit?: boolean;
        clone?: boolean;
    }
) => void;

export type MobStorequickSetProp<T> = <K extends keyof T>(
    prop: Extract<K, string>,
    value: T[K]
) => void;

export type MobStoreWatch<T> = <K extends keyof T>(
    prop: Extract<K, string>,
    callback: (
        current: T[K],
        previous: T[K],
        validate: MobStoreValidateState
    ) => void,
    options?: { wait?: boolean; immediate?: boolean }
) => () => void;

export type MobStoreComputed<T> = <K extends keyof T>(
    prop: Extract<K, string>,
    callback: (arg0: T) => T[K],
    keys?: Extract<keyof T, string>[]
) => void;

export type MobStoreEmit<T> = (props: Extract<keyof T, string>) => void;

export type MobStoreEmitAsync<T> = (
    props: Extract<keyof T, string>
) => Promise<{ success: boolean }>;

export type MobStoreStoreProxi<T> = () => T;

export type MobStoreAlias =
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

export type MobStoreNative =
    | string
    | number
    | object
    | (() => void)
    | any[]
    | boolean
    | Element
    | Map<any, any>
    | Set<any>
    | NodeList;

export interface MobStoreSetEntryPoint {
    instanceId: string;
    prop: string;
    value: any | ((arg0: any) => any);
    fireCallback?: boolean;
    clone?: boolean;
    action: 'SET' | 'UPDATE';
}

export interface storeSetAction {
    prop: string;
    value: any | ((arg0: any) => any);
    fireCallback?: boolean;
    clone?: boolean;
    instanceId: string;
    useStrict?: boolean;
    state: StoreMapValue;
    action: 'SET' | 'UPDATE';
}

export interface MobStoreQuickSetEntryPoint {
    instanceId: string;
    prop: string;
    value: any | ((arg0: any) => any);
}

export interface MobStoreWatchAction {
    prop: string;
    callback: (
        current: any,
        previous: any,
        validate: MobStoreValidateState
    ) => void;
    wait: boolean;
    state: StoreMapValue;
}

export interface MobStoreWatchReturnObject {
    state: StoreMapValue | undefined;
    unsubscribeId: string;
}

export interface MobStoreComputedAction {
    prop: string;
    keys: string[];
    fn: (arg0: Record<string, any>) => void;
    instanceId: string;
}

export interface MobStoreCallbackQueue {
    callBackWatcher: Map<
        string,
        {
            prop: string;
            fn: (
                arg0: any,
                arg1: any,
                arg2: boolean | Record<string, boolean>
            ) => void | Promise<void>;
            wait: boolean;
        }
    >;
    prop: string;
    newValue: any;
    oldValue: any;
    validationValue: boolean | Record<string, boolean>;
    instanceId?: string;
}

export type MobStoreFunctionValue<T, K> = () => {
    /**
     * @description
     * Initial value
     */
    value: T[K];

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
     * Function to transform value.
     * This function will have the current value and old value as input parameter.
     */
    transform?: (value: T[K], previousValue: T[K]) => T[K];

    /**
     * @description
     * Validation function to parse value.
     * This function will have the current value and old value as input parameter and will return a boolean value.
     * The validation status of each property will be displayed in the watchers and will be retrievable using the getValidation() method.
     */
    validate?: (value: T[K], previousValue: T[K]) => boolean;

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

type MobStoreState<T> = {
    [K in keyof T]: MobStoreFunctionValue<T, K> | T[K] | MobStoreState<T[K]>;
};

export type MobStoreParams<T = any> = MobStoreState<T>;

export type MobStoreWatchWaintList = Map<string, Map<string, any>>;
