import { getStateFromMainMap, updateMainMap } from './store-map';
import { checkType } from './store-type';

/**
 * Send instance id to binded store.
 *
 * - Used in computed operation:
 * - When: Use when a state is updated/emitted.
 * - Why: prop is used by another store with bindStore():
 * - Action: Self id is added to target store.
 * - Because: ComputedPropsQueque set() of targets store should be updated.
 *
 * @param {object} params
 * @param {string} params.selfId
 * @param {string} params.bindId
 * @returns {void}
 */
const addSelfIdToBindInstanceBy = ({ selfId, bindId }) => {
    const state = getStateFromMainMap(bindId);
    if (!state) return;

    const { bindInstanceBy } = state;
    const bindInstanceByUpdated = [...bindInstanceBy, selfId];

    updateMainMap(bindId, {
        ...state,
        bindInstanceBy: bindInstanceByUpdated,
    });
};

/**
 * Remove self id from binded store.
 *
 * @param {object} params
 * @param {string} params.selfId
 * @param {string} params.bindId
 * @returns {void}
 */
export const removeSelfIdToBindInstanceBy = ({ selfId, bindId }) => {
    const state = getStateFromMainMap(bindId);
    if (!state) return;

    const { bindInstanceBy } = state;
    const bindInstanceByUpdated = bindInstanceBy.filter((id) => id !== selfId);

    updateMainMap(bindId, {
        ...state,
        bindInstanceBy: bindInstanceByUpdated,
    });
};

/**
 * @param {object} params
 * @param {import('./type').BindStoreValueType} params.bindStores
 * @param {import('./type').StoreMapValue} params.selfStore
 * @returns {boolean}
 */
const checkDuplicatedBindProp = ({ bindStores, selfStore }) => {
    const storeToArray = checkType(Array, bindStores)
        ? /** @type {import('./type').MobStoreReturnType<any>[]} */ (
              bindStores
          ).map((store) => store.get())
        : [
              /** @type {import('./type').MobStoreReturnType<any>} */ (
                  bindStores
              ).get(),
          ];

    const stores = [...storeToArray, selfStore.store];

    let hasConflict = false;

    /**
     * All-Pairs Comparison: O(n × m).
     *
     * - 1 loop O(n) ( stores )
     * - 2 loop O(m) ( key in stores )
     */
    for (const [index, store] of stores.entries()) {
        for (const [indexCheck, storeCheck] of stores.entries()) {
            // Skip: same store (index = indexCheck) and already checked pairs (index < indexCheck)
            if (index <= indexCheck) continue;

            const duplicate = Object.keys(store).filter((key) => {
                return Object.keys(storeCheck).includes(key);
            });

            if (duplicate.length > 0) {
                hasConflict = true;

                console.warn(
                    `bindStore: prop conflict on following prop: '${duplicate}', bind store key must be univoque'`
                );
            }
        }
    }

    return hasConflict;
};

/**
 * Module entry point.
 *
 * @param {object} params
 * @param {import('./type').BindStoreValueType} params.value
 * @param {string} params.instanceId
 * @returns {void}
 */
export const bindStoreEntryPoint = ({ value, instanceId }) => {
    const state = getStateFromMainMap(instanceId);
    if (!state) return;

    /**
     * Check if selfStore and duplicated store has conflict with keys.
     *
     * - In case has conflict skip
     */
    const hasConflict = checkDuplicatedBindProp({
        bindStores: value,
        selfStore: state,
    });

    if (hasConflict) return;

    const { bindInstance, bindInstanceBy } = state;
    if (!bindInstance) return;

    const ids = checkType(Array, value)
        ? /** @type {import('./type').MobStoreReturnType<any>[]} */ (value).map(
              (store) => store.getId()
          )
        : [
              /** @type {import('./type').MobStoreReturnType<any>} */ (
                  value
              ).getId(),
          ];

    /**
     * Check circular bindnds or store bind itSelf.
     */
    const isBindable = bindInstanceBy.every((id) => !ids.includes(id));
    const alreadyBound = ids.every((id) => !bindInstance.includes(id));
    const tryToBindItself = ids.includes(instanceId);

    if (!isBindable || tryToBindItself) {
        console.warn(
            `${instanceId}, binding store failed, circular dependencies found.`
        );
        return;
    }

    if (!alreadyBound) {
        console.warn(
            `${instanceId}, binding store failed, store is binded more than once.`
        );
        return;
    }

    const bindInstanceUpdated = [...bindInstance, ...ids];

    updateMainMap(instanceId, {
        ...state,
        bindInstance: bindInstanceUpdated,
    });

    for (const id of ids) {
        addSelfIdToBindInstanceBy({ selfId: instanceId, bindId: id });
    }
};
