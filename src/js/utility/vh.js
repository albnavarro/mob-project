import { mobCore } from '../mobCore';

class vhClass {
    constructor(images, callback) {
        this.lastWw = 0;
    }

    init() {
        this.calcVh();
        mobCore.useScroll(({ scrollY }) => this.onScroll(scrollY));
        mobCore.useResize(() => this.calcVh());
    }

    calcVh() {
        mobCore.useFrame(() => {
            mobCore.useNextTick(() => {
                const vh = window.innerHeight * 0.01;

                mobCore.useFrame(() => {
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
