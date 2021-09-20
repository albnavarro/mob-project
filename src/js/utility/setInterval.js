export const requestInterval = (fn, delay) => {
    const handle = {};
    let start = new Date().getTime();

    const loop = () => {
        handle.value = requestAnimationFrame(loop);
        var current = new Date().getTime(),
        delta = current - start;

        if (delta >= delay) {
          fn.call();
          start = new Date().getTime();
        }
    }

    handle.value = requestAnimationFrame(loop);
    return handle;
};
