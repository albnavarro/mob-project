/** @type {string[]} */
let current_computed_keys = [];
let active = false;

/**
 * @returns {void}
 */
export const initializeCurrentDependencies = () => {
    active = true;
    current_computed_keys.length = 0;
};

/**
 * Return a copy of items. Avoid side effect.
 *
 * @returns {string[]}
 */
export const getCurrentDependencies = () => {
    active = false;
    return [...current_computed_keys];
};

/**
 * Return a copy of items. Avoid side effect.
 *
 * @returns {string}
 */
export const getFirstCurrentDependencies = () => {
    active = false;
    const copy = [...current_computed_keys];
    return copy?.[0] ?? '';
};

/**
 * @param {string} key
 * @returns {void}
 */
export const setCurrentDependencies = (key) => {
    if (!active || !key) return;
    if (current_computed_keys.includes(key)) return;
    current_computed_keys = [...current_computed_keys, key];
};
