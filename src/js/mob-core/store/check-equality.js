import { ARRAY, MAP, SET, TYPE_IS_ANY } from './store-type';

/**
 * @param {Map<any, any>} m1
 * @param {Map<any, any>} m2
 * @returns {boolean}
 */
const mapsAreEqual = (m1, m2) =>
    m1.size === m2.size &&
    m1.keys().every((key) => m1.get(key) === m2.get(key));

/**
 * @param {Set<any>} a
 * @param {Set<any>} b
 * @returns {boolean}
 */
const setsAreEqual = (a, b) =>
    a.size === b.size && [...a].every((value) => b.has(value));

/**
 * Confronta due array per uguaglianza posizionale.
 *
 * L'ordine degli elementi è significativo: due array sono uguali solo se hanno la stessa lunghezza e ogni elemento
 * nella stessa posizione è uguale.
 *
 * - Utilizza esclusivamente `objectAreEqual` per il confronto degli elementi.
 * - Questa funzione è sufficiente per tutti i tipi: per primitive esegue un veloce strict equality (===), per oggetti
 *   esegue deep comparison ricorsiva.
 *
 * @param {any[]} a
 * @param {any[]} b
 * @returns {boolean}
 */
const arrayAreEquals = (a, b) => {
    /**
     * Lunghezze diverse = non possono essere uguali
     */
    if (a.length !== b.length) return false;

    /**
     * Confronto posizionale:
     *
     * - Ogni elemento deve corrispondere alla stessa index
     */
    for (const [i, element] of a.entries()) {
        if (!objectAreEqual(element, b[i])) {
            return false;
        }
    }

    return true;
};

/**
 * Deep comparison of two values. Optimized for performance with early exits and circular reference protection.
 *
 * @param {any} a
 * @param {any} b
 * @param {WeakMap<object, WeakSet<object>>} [seen] - Circular reference tracker
 * @returns {boolean}
 */
const objectAreEqual = (a, b, seen = new WeakMap()) => {
    /**
     * Same reference (includes both null, both undefined, same object)
     */
    if (a === b) return true;

    /**
     * One is null/undefined, the other is not
     */
    if (a == null || b == null) return false;

    /**
     * Different types
     */
    const typeA = typeof a;
    const typeB = typeof b;
    if (typeA !== typeB) return false;

    /**
     * Primitives (already checked === above, so they're different)
     */
    if (typeA !== 'object') return false;

    /**
     * Circular reference protection
     */
    if (seen.has(a)) {
        const seenSet = seen.get(a);
        if (seenSet?.has(b)) return true;
    }

    /**
     * Track this comparison
     */
    if (!seen.has(a)) seen.set(a, new WeakSet());
    seen.get(a)?.add(b);

    /**
     * Arrays - positional comparison (order matters)
     */
    const isArrayA = Array.isArray(a);
    const isArrayB = Array.isArray(b);
    if (isArrayA !== isArrayB) return false;

    if (isArrayA) {
        if (a.length !== b.length) return false;
        for (const [i, element] of a.entries()) {
            if (!objectAreEqual(element, b[i], seen)) return false;
        }
        return true;
    }

    /**
     * Date
     */
    if (a instanceof Date && b instanceof Date) {
        return a.getTime() === b.getTime();
    }
    if (a instanceof Date || b instanceof Date) return false;

    /**
     * RegExp
     */
    if (a instanceof RegExp && b instanceof RegExp) {
        return a.source === b.source && a.flags === b.flags;
    }

    if (a instanceof RegExp || b instanceof RegExp) return false;

    /**
     * Map
     */
    if (a instanceof Map && b instanceof Map) {
        if (a.size !== b.size) return false;
        for (const [key, val] of a) {
            if (!b.has(key) || !objectAreEqual(val, b.get(key), seen)) {
                return false;
            }
        }
        return true;
    }
    if (a instanceof Map || b instanceof Map) return false;

    /**
     * Set
     */
    if (a instanceof Set && b instanceof Set) {
        if (a.size !== b.size) return false;
        for (const val of a) {
            if (!b.has(val)) return false;
        }
        return true;
    }
    if (a instanceof Set || b instanceof Set) return false;

    /**
     * Plain objects
     */
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
        if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
        if (!objectAreEqual(a[key], b[key], seen)) return false;
    }

    return true;
};

/**
 * @param {any} type
 * @param {any} oldValue
 * @param {any} newValue
 * @returns {boolean}
 */
export const checkEquality = (type, oldValue, newValue) => {
    switch (type) {
        case TYPE_IS_ANY: {
            return objectAreEqual(oldValue, newValue);
        }

        case ARRAY:
        case Array: {
            return arrayAreEquals(oldValue, newValue);
        }

        case SET:
        case Set: {
            return setsAreEqual(oldValue, newValue);
        }

        case MAP:
        case Map: {
            return mapsAreEqual(oldValue, newValue);
        }

        default: {
            return oldValue === newValue;
        }
    }
};
