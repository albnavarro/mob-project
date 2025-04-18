import { MobTween } from '../..';
import { MobCore } from '../../../mob-core';
import {
    getTranslateValues,
    offset,
    outerHeight,
    outerWidth,
} from '../../../mob-core/utils';

export class MobMouseParallax {
    /**
     * @type {HTMLElement}
     */
    #item;

    /**
     * @type {boolean}
     */
    #centerToViewoport;

    /**
     * @type {number}
     */
    #rangex;

    /**
     * @type {number}
     */
    #rangey;

    /**
     * @type {number}
     */
    #height;

    /**
     * @type {number}
     */
    #width;

    /**
     * @type {number}
     */
    #offSetTop;

    /**
     * @type {number}
     */
    #offSetLeft;

    /**
     * @type {import('../../type').MobSpring}
     */
    #spring;

    /**
     * @type {{ x: number; y: number }}
     */
    #pageCoord;

    /**
     * @type {{ x: number; y: number }}
     */
    #clientCoord;

    /**
     * @type {number}
     */
    #lastScrolledTop;

    /**
     * @type {() => void}
     */
    #unsubscribeSpring;

    /**
     * @type {() => void}
     */
    #unsubscribeOnComplete;

    /**
     * @type {() => void}
     */
    #unsubscribeScroll;

    /**
     * @type {() => void}
     */
    #unsubscribeMouseMove;

    /**
     * @type {() => void}
     */
    #unsubscribeResize;

    /**
     * @param {import('./type').MobMouseParallax} data
     */
    constructor(data) {
        this.#item = data.item;
        this.#centerToViewoport = data?.centerToViewoport ?? true;
        this.#rangex = data?.rangeX ?? 100;
        this.#rangey = data?.rangeY ?? 100;
        this.#height = 0;
        this.#width = 0;
        this.#offSetTop = 0;
        this.#offSetLeft = 0;
        this.#spring = MobTween.createSpring({ data: { ax: 0, ay: 0 } });

        // Mouse coord
        this.#pageCoord = { x: 0, y: 0 };
        this.#clientCoord = { x: 0, y: 0 };
        this.#lastScrolledTop = 0;

        // unsubscribe handler
        this.#unsubscribeSpring = () => {};
        this.#unsubscribeOnComplete = () => {};
        this.#unsubscribeScroll = () => {};
        this.#unsubscribeMouseMove = () => {};
        this.#unsubscribeResize = () => {};
    }

    /**
     * Initialize insatance
     *
     * @example
     *     myInstance.init();
     *
     * @type {() => void}
     */
    init() {
        this.#getDimension();

        this.#unsubscribeMouseMove = MobCore.useMouseMove(
            ({ page, client }) => {
                this.#setGlobalCoord({ page, client });
                this.#onMove();
            }
        );

        this.#unsubscribeResize = MobCore.useResize(() => {
            this.#getDimension();
        });

        this.#unsubscribeScroll = MobCore.useScroll(({ scrollY }) => {
            this.#onScroll(scrollY);
        });

        this.#unsubscribeSpring = this.#spring.subscribe(({ ax, ay }) => {
            this.#item.style.transform = `translate3D(0,0,0) translateX(${ax}px) translateY(${ay}px)`;
        });

        this.#unsubscribeOnComplete = this.#spring.onComplete(({ ax, ay }) => {
            this.#item.style.transform = `translateX(${ax}px) translateY(${ay}px)`;
        });
    }

    /**
     * @type {(arg0: { page: { x: number; y: number }; client: { x: number; y: number } }) => void}
     */
    #setGlobalCoord({ page, client }) {
        this.#pageCoord = { x: page.x, y: page.y };
        this.#clientCoord = { x: client.x, y: client.y };
    }

    /**
     * @type {(scrollY: number) => void}
     */
    #onScroll(scrollY) {
        if (this.#lastScrolledTop !== scrollY) {
            this.#pageCoord.y -= this.#lastScrolledTop;
            this.#lastScrolledTop = scrollY;
            this.#pageCoord.y += this.#lastScrolledTop;
        }

        this.#onMove();
    }

    /**
     * @type {() => void}
     */
    #getDimension() {
        const x = getTranslateValues(this.#item)?.x;
        const y = getTranslateValues(this.#item)?.y;
        this.#item.style.transform = '';
        this.#height = outerHeight(this.#item);
        this.#width = outerWidth(this.#item);
        this.#offSetTop = offset(this.#item).top;
        this.#offSetLeft = offset(this.#item).left;
        this.#item.style.transform = `translate(${x}px, ${y}px)`;
    }

    /**
     * @type {() => void}
     */
    #onMove() {
        const { vw, vh } = this.#centerToViewoport
            ? {
                  vw: window.innerWidth,
                  vh: window.innerHeight,
              }
            : {
                  vw: this.#width,
                  vh: this.#height,
              };

        const x = this.#clientCoord.x;
        const y = this.#centerToViewoport
            ? this.#clientCoord.y
            : this.#pageCoord.y;

        const { ax, ay } = this.#centerToViewoport
            ? {
                  ax: (x - vw / 2) / this.#rangex,
                  ay: (y - vh / 2) / this.#rangey,
              }
            : {
                  ax: (x - this.#offSetLeft - vw / 2) / this.#rangex,
                  ay: (y - this.#offSetTop - vh / 2) / this.#rangey,
              };

        this.#spring.goTo({ ax, ay }).catch(() => {});
    }

    /**
     * @type {() => void}
     */
    destroy() {
        this.#unsubscribeScroll();
        this.#unsubscribeMouseMove();
        this.#unsubscribeResize();
        this.#unsubscribeSpring();
        this.#unsubscribeOnComplete();
        // @ts-ignore
        this.#spring = null;
    }
}
