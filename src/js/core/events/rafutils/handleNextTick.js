/**
 *
 * @example:
 *
 * handleNextTick.add(() => {
 *     myFunction()
 * });
 *
 */
export const handleNextTick = (() => {
    let callback = [];

    const add = (cb, priority = 100) => {
        callback.push({ cb, priority });
    };

    const fire = ({ time, fps, shouldRender }) => {
        if (callback.length === 0) return;

        callback.sort((a, b) => a.priority - b.priority);
        callback.forEach(({ cb }) => cb({ time, fps, shouldRender }));
        callback.length = 0;
    };

    return { add, fire };
})();
