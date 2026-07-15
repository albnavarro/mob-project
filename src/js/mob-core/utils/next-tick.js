/** @type{Set<() => any>} */
const settimeOutQueque = new Set();

/**
 * @param {() => void} fn
 * @returns {void}
 */
export const useNextLoop = (fn) => {
    settimeOutQueque.add(fn);

    if (settimeOutQueque.size === 1) {
        setTimeout(() => {
            for (const fn of settimeOutQueque) {
                fn();
            }

            settimeOutQueque.clear();
        }, 0);
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
