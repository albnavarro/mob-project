import { handleScroll } from '../mobbu/events/scrollUtils/handleScroll.js';
import { handleResize } from '../mobbu/events/resizeUtils/handleResize.js';
import { handleNextTick } from '../mobbu/events/rafutils/handleNextTick.js';
import { handleFrame } from '../mobbu/events/rafutils/handleFrame.js';

class vhClass {
    constructor(images, callback) {
        this.lastWw = 0;
    }

    init() {
        this.calcVh();
        handleScroll(({ scrollY }) => this.onScroll(scrollY));
        handleResize(() => this.calcVh());
    }

    calcVh() {
        handleFrame.add(() => {
            handleNextTick.add(() => {
                const vh = window.innerHeight * 0.01;

                handleFrame.add(() => {
                    document.documentElement.style.setProperty(
                        '--vh',
                        `${vh}px`
                    );
                });
            });
        });
    }

    onScroll(scrollY) {
        if (scrollY == 0) {
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
