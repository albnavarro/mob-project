export function findElement(elClass) {
    return new Promise((res, reject) => {
        let start = null;
        const step = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const el = document.querySelectorAll(elClass);
            console.log(el)

            if (el.length) {
                res();
            }

            if (progress < 3000 && el.length == 0) {
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
