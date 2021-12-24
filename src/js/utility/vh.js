import { useScroll } from '../core/events/scrollUtils/useScroll.js';
import { useResize } from '../core/events/resizeUtils/useResize.js';

class vhClass {
    constructor(images, callback) {
        this.lastWw = 0;
    }

    init() {
        this.calcVh();

        useScroll(() => this.onScroll());
        useResize(() => this.calcVh());
    }

    calcVh() {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        console.log('calc vh');
    }

    onScroll() {
        if (window.pageYOffset == 0) {
            this.calcVh();
        }
    }
}

export const vh = new vhClass();

// USAGE
// .my-element {
//   height: 100vh; /* Fallback for browsers that do not support Custom Properties */
//   height: calc(var(--vh, 1vh) * 100);
// }
