// let t = null;
// requestTimeout(work, 200, id => (t = id));
// cancelAnimationFrame(t);
//

export const requestTimeout = (fn, delay, registerCancel) => {
    const noop = () => {};
    const start = new Date().getTime();

    const loop = () => {
        const delta = new Date().getTime() - start;

        if (delta >= delay) {
            fn();
            registerCancel(noop);
            return;
        }

        const raf = requestAnimationFrame(loop);
        registerCancel(() => cancelAnimationFrame(raf));
    };

    const raf = requestAnimationFrame(loop);
    registerCancel(() => cancelAnimationFrame(raf));
};
