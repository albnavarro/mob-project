/**
 *
 * @example:
 *
 * handleNextFrame.add(() => {
 *     myFunction()
 * });
 *
 */
export const handleNextFrame = (() => {
    let callback = [];

    const add = (cb) => {
        callback.push(cb);
    };

    const get = () => {
        const cb = [...callback];
        callback.length = 0;
        return cb;
    };

    return { add, get };
})();
