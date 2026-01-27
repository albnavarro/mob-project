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

/** @type{(() => void)[]} */
// const queue = [];
// let size = 0;
// let scheduled = false;

/**
 * @param {() => void} fn
 */
// export const useNextLoop = (fn) => {
//     queue[size++] = fn;
//
//     if (!scheduled) {
//         scheduled = true;
//
//         setTimeout(() => {
//             for (let i = 0; i < size; i++) {
//                 queue[i]();
//
//                 // @ts-ignore
//                 queue[i] = null; // libera reference
//             }
//             size = 0;
//             scheduled = false;
//         });
//     }
// };
