export function findElement(el) {
    return new Promise((res, reject) => {
        let start = null;
        const step = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const $el = $(`${el}`);

            if ($el.length) {
                res();
            }

            if (progress < 3000 && $el.length == 0) {
                window.requestAnimationFrame(step);
            } else {
                reject();
            }
        }
        window.requestAnimationFrame(step)
    });
}

// USAGE
// findElement('.myclass').then(() => {
//     console.log('founded')
// }).catch(() => {
//     console.log('not found');
// });
