# A classic store based on the pub/sub pattern.
This module also powers the reactivity system in mobJs JavaScript components.

### Note:
`MobCore.createStore` is an external reference that implement `mobStore`
So in module:


```javascript
// Module definition ( index.js of module level )
export * as MobCore from './modules';

//  ./modules
function createStore(data) {
    return mobStore(data);
}
```

#### useNextLoop implementation:
```javascript
/** @type{Set<() => any>} */
const setTimeOutQueque = new Set();

/**
 * @param {() => void} fn
 * @returns {void}
 */
export const useNextLoop = (fn) => {
    setTimeOutQueque.add(fn);

    if (setTimeOutQueque.size === 1) {
        setTimeout(() => {
            setTimeOutQueque.forEach((fn) => {
                fn();
            });

            setTimeOutQueque.clear();
        });
    }
};
```

### Feature
- Optional Dynamic type check
- Optional Transform function
- Optional Validation function
- Optional Equal check
- Proxi support

## Basic implementations:

```JavaScript
import { MobCore } from '@mobCore';

const myStore = MobCore.createStore({
    props1: 0,
    props2: 'test',
});
```

## Advanced implementations
For advanced usage, it is necessary to return a function that returns an object containing the `value` property and at least one of the following properties: `validate`, `type`, `skipEqual` or `strict`.

```JavaScript
import { MobCore } from '@mobCore';

const myStore = MobCore.createStore({
    props1: () => ({
        value: 0,
        type: Number,
        transform: (val) => {
            return val * 2;
        },
        validate: (val) => {
            return val > 0;
        },
        strict: false,
        skipEqual: false,
    }),
    props2: () => ({
        value: 'test',
        type: String,
    }),
});
```

## Default ( controlled ) object:
You can nest up to **two levels** (supporting both basic and advanced use cases) for properties, as demonstrated in example below.

This implementation is designed to group multiple properties by `domain` rather than managing an object. It can only be used at the first level of property definition, as in the following example.

One of the advantages of this approach is the ability to use `set` or `update` to mutate a single property of the `object` without having to manage the object in its entirety, as shown in the `set` property section.

In this case, after the definition it will no longer be possible to add new properties; to add new properties dynamically use any

When using a `controlled object` but nesting it more than two levels deep, the data will be added to the store, but its validation status will automatically be set to false.


```JavaScript
import { MobCore } from '@mobCore';

const myStore = MobCore.createStore({
    myObject: {
        myProps: () => ({
            value: 'option1',
            type: String,
            transform: (val) => {
                return `option${val}`;
            },
            validate: (val) => {
                return ['option1', 'option2'].includes(val);
            },
        }),
        myProps2: () => ({
            value: [],
            type: Array,
        }),
    },
});
```

## Nested object
To use an object with infinite insertions, employ the **any** type.
With any every type of object will be accepted and no validation is applied.

The `any` type can also be used to handle custom data, such as classes and other personalized data implementations. When using `any`, no dynamic type checking will be performed.

Note that this approach disables property-specific definitions for nested properties, this works only with advanced implementation.

```JavaScript
import { MobCore } from '@mobCore';

const myStore = MobCore.createStore({
    myProps: () => ({
        value: {
            prop: {
                nestedProp: {
                    nestedProp: {
                        value: 2,
                    },
                },
            },
        },
        type: 'any',
    }),
});
```

## State params

Details of the parameters if defining a single state via an advanced implementation. Recall that in this case, the practice is to provide a function that returns an object with a `value` property and one of `validate`, `type`, `skipEqual` or `strict`.

### value
Initial value

### type
The type can be defined as a native JavaScript object or in the form of a string.<br/>
The `object` type has been intentionally omitted. Please refer to the `default controlled object` section or the `any` type.

- `Function` | 'Function'
- `String` | 'String'
- `Number` | 'Number'
- `Boolean` | 'Boolean'
- `Array` | 'Array'
- `Element` | 'Element'
- `HTMLElement` | HTMLElement
- `NodeList` | 'NodeList'
- `Set` | 'Set'
- `Map` | 'Map'
- 'Any

### transform
Transformation function that processes values before validation.

### validate
Validation function that analyzes values. It receives both the current value and previous value as parameters, returning a boolean result. Each property's validation status appears as watch function parameters and can be retrieved via the `getValidation()` method.

### skipEqual
If the value equals the previous one, the property won't update.
This prevents watch execution and makes the property irrelevant to its related computed values.
Default: `true`.

### strict
When true, the validation function acts as a blocker - the property updates only if validation succeeds.
Default: `false`.

## Typescript support:
Every store can implement an interface describing its state structure.
This example demonstrates the pattern using jsDoc.
Note: The type parameter (for dynamic type checking) operates outside TypeScript's validation system.

```JavaScript
interface MyStoreType {
    prop1: number;
    prop2: string[];
}
```

```JavaScript
/**
 * @import {MobStoreParams} from '@mobStoreType';
 */

import { MobCore } from '@mobCore';

export const myStore = MobCore.createStore(
    /** @type {MobStoreParams<import('./type').MyStoreType>} */
    {
        prop1: () => ({
            value: 0,
            type: Number,
        }),
        prop2: () => ({
            value: [],
            type: Array,
        }),
    }
);
```

In .ts files, you can pass the interface as a generic parameter.

```JavaScript
import { MobCore } from '@mobCore';
import { DebugActiveComponentStore } from './type';

export const debugActiveComponentStore = MobCore.createStore<MyStoreType>({
    prop1: () => ({
        value: 0,
        type: Number,
    }),
    prop2: () => ({
        value: [],
        type: Array,
    }),
});
```

## Methods:

### GetProxi
Returns a proxy wrapper for the original object.

- `get`: The object automatically reflects the current state values.
- `set`: Internally triggers `myStore.set('prop', value`) when modifying the object.

Using proxies enables the simplest way to both read and modify state values.

The proxy mechanism ensures that when an array or object property (excluding Map and Set) is accessed, it returns a `frozen copy` of that property. This prevents accidental direct mutations to the original store data.

**Note:** This is not a deep freeze—deeply nested properties will still be accessible. It is a compromise between simplicity and security.

```JavaScript
import { MobCore } from '@mobCore';

const myStore = MobCore.createStore({
    myProp: () => ({
        value: '',
        type: String,
    }),
    myObj: () => ({
        value: {
            prop: 2,
            prop2: {
                nested: 10,
            }
        },
        type: 'any',
    }),
});

const proxi = myStore.getProxi();

myStore.watch('myProp', (value) => {
    console.log(value);
});

/**
 * Simple propierties
 */
proxi.myProp = 'test value';
proxi.myProp = 'test value 2';
proxi.myProp = 'test value 3';

/**
* SAFE:
* override entire object and trigger reactivity.
*/
proxi.myObj = { prop: 3 };

/**
* SAFE:
* update object and trigger reactivity.
*/
proxi.myObj = { ...proxi.myObj, prop: 4 }; // right

/**
* BLOCKED:
*/
proxi.myObj.prop = 10;

/**
* !! DANGEROUS:
*/
proxi.myObj.prop.subprop = 10;
```

### Set
Set store value:

Directly updates the state while maintaining reactivity.

set provides an alternative to proxy-based state updates.
It offers more configuration options than the proxy approach.

As described above, using `set` (and `update`) allows you to modify a single property of a `group` or `domain` ( complex object ). The new value will then be automatically merged with the original object.

```JavaScript
import { MobCore } from '@mobCore';

const myStore = MobCore.createStore({
    prop: 0,
    myComplexObj: {
        prop: () => ({
            value: 0,
            type: Number,
        }),
        prop2: () => ({
            value: 0,
            type: Number,
        }),
    },
});

myStore.set('prop', 2);

// It is possible modify single propierites of complexObject.
myStore.set('myComplexObj', { prop: 10 });
```

**Set options**

- `emit`:  Modifies data without triggering reactions (no callbacks fired), with `false` relate computed will not trigger.
Default: `true`.

```JavaScript
import { MobCore } from '@mobCore';

const myStore = MobCore.createStore({
    prop: 0,
    myComplexObj: {
        prop: () => ({
            value: 0,
            type: Number,
        }),
        prop2: () => ({
            value: 0,
            type: Number,
        }),
    },
});

// Do not issue any callbacks
myStore.set('prop', 2, { emit: false });
```

**Using with proxi**

Using proxy vs object key access:

```JavaScript
const proxi = myStore.getProxi();
myStore.set(() => proxi.prop, 2);
myStore.set(() => proxi.myObject, { prop: 10 });
```

### Update
Update store value:

update serves as a proxy alternative for state modifications,
offering additional configuration options beyond proxy capabilities.

```JavaScript
import { MobCore } from '@mobCore';

const myStore = MobCore.createStore({
    prop: 0,
    myObject: {
        prop: () => ({
            value: 0,
            type: Number,
        }),
        prop2: () => ({
            value: 0,
            type: Number,
        }),
    },
});

// Default
myStore.update('prop', (oldValue) => {
    return oldValue + 1;
});

// Object
myStore.update('myObject', (obj) => {
    return { ...obj, prop: 10 };
});
```

**Update options**

- `emit`:  Modifies data without triggering reactions (no callbacks fired), with `false` relate computed will not trigger.
- `clone`:  Creates a copy of original data. Default: `false`.

```JavaScript
import { MobCore } from '@mobCore';

const myStore = MobCore.createStore({
    myArray: () => ({
        value: [],
        type: Array,
    }),
});

/**
 * Clone a array and return new array with one item added with classic push methods.
 */
myStore.update(
    'myArray',
    (value) => {
        value.push(10);
        return value;
    },
    { clone: true, emit: true }
);
```

**Attenzione alle mutazioni degli oggetti**
```javascript
// Sbagliato: muta l'oggetto originale
store.update('myObj', (obj) => {
    obj.nested = 1;
    return obj;
});

// Corretto: nuovo oggetto
store.update('myObj', (obj) => ({
    ...obj,
    nested: 1
}));

// Corretto: con clone
store.update('myObj', (obj) => {
    obj.nested = 1;
    return obj;
}, { clone: true });
```


**With proxi**

Using proxy vs object key access:

```JavaScript
const proxi = myStore.getProxi();

// Default
myStore.update(
    () => proxi.prop,
    (oldValue) => {
        return oldValue + 1;
    }
);

// Object
myStore.update(
    () => proxi.myObject,
    (obj) => {
        return { ...obj, prop: 10 };
    },
    { clone: true, emit: true }
);
```

### Get
Returns the entire store

- use object destructuring to extract specific properties.

get provides a direct access alternative to proxy-based state reading.

```JavaScript
const { prop } = myStore.get();
```

### Get props
Retrieves a specific property from the store.

getProp offers a direct alternative to proxy-based state access for reading values.

```JavaScript
const myProp = myStore.getProp('myProp');
```

### Watch
Subscribes to state changes and provides an unsubscribe callback for cleanup.

The watch system intentionally supports multiple watchers on the same property, regardless of whether the property’s
wait flag is false or true. This is because the store will later be used to create JavaScript components where
multiple watchers on the same property with different callbacks are anticipated.

```JavaScript
const unsubscribe = myStore.watch('prop', (newValue, oldValue, validation) => {
    //
});

// Remove watcher froms store.
unsubscribe();
```

**Watch options**

- `wait`:  Defers callback execution until the current JavaScript event loop completes, using the latest value. Only effective when emit-async is not used. Default: `false`.
- `immediate`:  Triggers the initial callback immediately on subscription. Default: `false`.

```JavaScript
const unsubscribe = myStore.watch(
    'prop',
    (newValue, oldValue, validation) => {
        //
    },
    { wait: true, immediate: true }
);

// Remove watcher froms store.
unsubscribe();
```

**With proxi**

Using proxy vs object key access:

```JavaScript
const proxi = myStore.getProxi();

const unsubscribe = myStore.watch(
    () => proxi.prop,
    (newValue, oldValue, validation) => {
        //
    },
    { wait: true, immediate: true }
);

// Remove watcher froms store.
unsubscribe();
```

### Emit
Triggers all property-specific callback functions.

```JavaScript
myStore.emit('prop');
```

**With proxi**

Using proxy vs object key access:

```JavaScript
myStore.emit(() => proxi.prop);
```

### Emit async
Processes all asynchronous property-related callbacks.

```JavaScript
import { MobCore } from '@mobCore';

const myStore = MobCore.createStore({
    prop: () => ({
        value: '',
        type: 'any',
    }),
});

const myAsyncFunction = async (value) => {
    return new Promise((resolve) => {
        return setTimeout(() => {
            resolve(value + 1);
        }, 1000);
    });
};

myStore.watch('prop', async (value) => {
    const valueParsed = await myAsyncFunction(value);
    console.log(valueParsed);
});

myStore.set('myProp', 'test', { emit: false });
await myStore.emitAsync('myProp');
```

**With proxi**

Using proxy vs object key access:

```JavaScript
await myStore.emitAsync(() => proxi.myProp);
```

### Computed
Computed properties automatically update when their dependencies (store properties) change. These values are recalculated in the JavaScript event loop. Key behaviors:
Batch processing: Multiple dependency changes trigger a single recomputation
Initial values are determined during initialization using current dependency states

State Locking: After function definition, the target state becomes immutable to manual changes - only updatable through its computed function.

To configure the target of a computed property and its optional dependencies, you may specify either:
Property keys as strings
A function that returns the proxy's value

Computed properties must not contain side effects; only read operations should be performed inside them, and direct
updates to the store are never allowed. This ensures the consistency of the module.

**Explicit dependencies**

Using a functional approach lets you:
- Declare explicit dependencies
- Pass current dependency values as callback parameters
- Avoid relying on state values outside the callback context

When dependencies are explicitly declared:
- The callback receives only the specified dependencies
- Alternative: Access proxies directly within the callback

```JavaScript
import { MobCore } from '@mobCore';

const myStore = MobCore.createStore({
    prop: 0,
    dependency1: 1,
    dependency2: 2,
});

myStore.computed(
    'prop',
    ({ dependency1, dependency2 }) => {
        return dependency1 + dependency2;
    },
    ['dependency1', 'dependency2']
);

console.log(myStore.get().prop); // 3

myStore.set('prop', 2); // Error
```

**With proxi ( autodetect dependencies )**

Proxy automatically captures and tracks all accessed dependencies - no explicit declaration needed.

```JavaScript
// use proxi as calculation
myStore.computed('prop', () => {
    return proxi.dependency1 + proxi.dependency2;
});

// use proxi as propierites and dependencies
myStore.computed(
    () => proxi.prop,
    () => {
        return proxi.dependency1 + proxi.dependency2;
    }
);
```

**With proxi ( explicit dependencies )**

Use proxy to explicit define dependencies.

```JavaScript
// use proxi as propierites and dependencies
myStore.computed(
    () => proxi.prop,
    () => {
        return proxi.dependency1 + proxi.dependency2;
    },
    [() => proxi.dependency1, () => proxi.dependency2]
);
```

**Cascade computed**

```JavaScript
import { MobCore } from '@mobCore';

const myStore = MobCore.createStore({
    initialProp: 1,
    dependency1: 0,
    dependency2: 0,
});

const proxi = myStore.getProxi();

myStore.computed(
    () => proxi.dependency1,
    () => {
        return proxi.initialProp * 2;
    }
);

myStore.computed(
    () => proxi.dependency2,
    () => {
        return proxi.dependency1 * 2;
    }
);
```

### BindStore
The module allows multiple stores to be linked, meaning that a specific store can be reactive to property mutations
in external stores linked via the bindStore method. When using properties such as computed, properties of the linked
store are explicitly referenced to leverage their reactivity. For this reason, in the store's lifecycle, it must
always be considered that any store linked via bindStore cannot be destroyed before the store it is linked to. The
store using bindStore must always be able to access the properties of the linked store to maintain consistency.

You can connect multiple stores to:
- Access their properties reactively
- Sync computations across stores

Connected stores will utilize these methods:

- get
- getProxi ( only as getter )
- watch
- computed
- emit
- emitAsync

Store that bind another store must be destroyed before binded store ( child store ) for consistency.


```JavaScript
import { MobCore } from '@mobCore';

const storeOne = MobCore.createStore({
    prop1: 0,
    sum: 0,
});

const storeTwo = MobCore.createStore({
    prop2: 0,
});

storeOne.bindStore([storeTwo]);
const proxi = storeOne.getProxi();

storeOne.watch('sum', (sum) => {
    console.log(sum);
});

storeOne.computed('sum', () => {
    return proxi.prop1 + proxi.prop2;
});

storeOne.set('prop1', 2);
storeTwo.set('prop2', 4);
```

When using bindStore, you must extend the type (using Readonly TypeScript utils).

```JavaScript
interface Store2 {
    prop2: number;
}

interface StoreOne extends Readonly<Store2> {
    prop1: number;
    sum: number;
}
```

### getId
Returns the unique ID of the store.

### quickSetProp
With `quickSetProp`, you can mutate a property while skipping the entire validation cycle. This is useful for animations or situations where performance is a critical factor.

### setProxiReadOnlyProp
Utility to define which properties, when used through a proxy, will be read-only. Useful for integrations with other modules.

### Built-in objects Map/Set
Map and Set, if not reassigned, are treated as shallow copies, so they will always reference the original object, which is why it is important to pay attention to setting the skipEqual property to false. In this specific case, reassignment makes little sense, since by directly mutating the map, the previous value and the current value will always be equal.

```JavaScript
import { MobCore } from '@mobCore';

const myStore = MobCore.createStore({
    myMap: () => ({
        value: new Map(),
        type: Map,
        skipEqual: false,
    }),
});

const proxi = myStore.getProxi();

myStore.watch(() => proxi.myMap, (current) => {
    console.log('Map updated:', current.get('myKey'));
});

// Metodo 1: Diretto (raccomandato)
proxi.myMap.set('myKey', 10);
myStore.emit('myMap');

// Metodo 2: Update con clone
myStore.update(
    () => proxi.myMap,
    (map) => {
        map.set('myKey', 11);
        return map;
    },
    { clone: true }
);
```



### Destroy
Destroy store and remove all reference

```JavaScript
myStore.destroy();

// Optional
myStore = null;
```

## architectural note:

Currently, no type of try/catch is implemented for callbacks passed to the store. This is an explicit design choice
at this stage. We aim to identify all issues with callbacks defined externally by the user and, in case of an error,
halt the script.

#### 1) Sicurezza del Pattern di Mutazione Interna

In diversi punti del codice, lo stato viene gestito mediante shallow copy del wrapper object con mutazione diretta delle collection interne (Set/Map):

```javascript
const state = getStateFromMainMap(instanceId);  // Shallow copy del wrapper
state.internalSet.add(value);                    // Mutazione diretta
updateMainMap(instanceId, state);                // Aggiornamento
```

**Punti dove il Pattern è applicato**
- `store-set.js` -> `addToComputedWaitLsit()` -> `computedPropsQueque` ( Set )
- `store-set.js` -> `fireComputed()` -> `callBackComputed` ( iterazione )
- `fire-queque.js` -> `runCallbackQueqe()` -> `waitMap` ( Map globale )
- `store-watch.js` -> `subscribeWatch()` -> `watcherByProp`, `watcherMetadata`
- `bind-store.js` -> `bindStoreEntryPoint()` -> `bindInstance` (array push implicito)


**Perché è Sicuro**
- JavaScript Single-Threaded

```javascript
// Tutte le operazioni tra get e update sono atomiche
const state = getStateFromMainMap(instanceId);  // Tick 1 - Inizio
state.computedPropsQueque.add(prop);            // Tick 1 - Esecuzione
updateMainMap(instanceId, state);               // Tick 1 - Fine
// Non esiste interleaving possibile
```

-  Nessuna Asincronicità nel Mezzo
Non ci sono await, Promise o callback asincroni tra la lettura ( `getStateFromMainMap` ) e la scrittura ( `updateMainMap` ). Il flusso è puramente sincrono.

- Riferimento Condiviso Intenzionale
La shallow copy restituisce un nuovo wrapper, ma le collection interne (Set/Map) sono riferimenti condivisi con l'oggetto nella mappa globale. Questo è intenzionale e sicuro perché:
L'operazione di mutazione (`add`, `set`, `delete`) è immediata
Non c'è yield del controllo tra la mutazione e l'aggiornamento della mappa
L'ordine di esecuzione garantisce che ogni modifica sia visibile alle operazioni successive nello stesso tick

- Isolamento dei Callback
```javascript
// In fire-queque.js
if (firstCycle) {
    useNextLoop(() => {
        // Qui lo stato è garantito stabile
        const propsPerIdNow = waitMap.get(instanceId);
        // ...
    });
}
```

**Punti di Attenzione per Future Modifiche**
NON introdurre await o operazioni asincrone tra getStateFromMainMap e updateMainMap

```javascript
// ERRATO - Introduce race condition
async function dangerousOperation(instanceId, value) {
    const state = getStateFromMainMap(instanceId);
    await validateAsync(value);  // YIELD! Altro codice può modificare lo stato
    state.store.prop = value;    // Sovrascrive modifiche intermedie
    updateMainMap(instanceId, state);
}

// CORRETTO - Mantiene atomicità
function safeOperation(instanceId, value) {
    const state = getStateFromMainMap(instanceId);
    state.store.prop = value;
    updateMainMap(instanceId, state);
    // Eventuali operazioni async dopo l'update
}
```

## TODO:

#### checkEquality
- `arrayAreEquals` && `objectAreEqual` must be optimize.



