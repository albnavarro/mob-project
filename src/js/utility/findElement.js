function findElement(el, callback) {
    let start = null;
    const step = (timestamp) => {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        const $el = $(`${el}`);

        if ($el.length) {
            callback();
        }

        if (progress < 10000 && $el.length == 0) {
            window.requestAnimationFrame(step);
        }
    }
    window.requestAnimationFrame(step)
}

// USAGE
// findElement('.class', this.callback.bind(this))
