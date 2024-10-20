// @ts-check

/**
 * @param {import("./type").callbackQueue} param
 * @returns {void}
 */
export const runCallbackQueqe = ({
    callBackWatcher,
    prop,
    newValue,
    oldValue,
    validationValue,
}) => {
    for (const { prop: currentProp, fn } of callBackWatcher.values()) {
        if (currentProp === prop) fn(newValue, oldValue, validationValue);
    }
};

/**
 * @param {import("./type").callbackQueue} param
 * @returns {Promise<any>}
 */
export const runCallbackQueqeAsync = async ({
    callBackWatcher,
    prop,
    newValue,
    oldValue,
    validationValue,
}) => {
    for (const { prop: currentProp, fn } of callBackWatcher.values()) {
        if (currentProp === prop) await fn(newValue, oldValue, validationValue);
    }
};
