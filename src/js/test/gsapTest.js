import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    offset,
    outerHeight,
    outerWidth,
} from '../core/utils/vanillaFunction.js';
import { handleResize } from '../core/events/resizeUtils/handleResize.js';

class gsapTestClass {
    constructor() {}

    init() {
        gsap.registerPlugin(ScrollTrigger);

        this.stikyNoPin();
        this.triggerAnimation();
        this.triggerScroll();
        this.parallaxSimple();
        this.parallaxSimpleCentered();
        this.parallax();
        this.horizontalScroll();
        this.horizontalScrollSingleCard();
    }

    stikyNoPin() {
        const stagger = gsap.utils.toArray('.gaspT__inner--0 .gaspT__pin');
        if (stagger.length == 0) return;

        const pin = gsap.timeline({
            scrollTrigger: {
                trigger: '.gaspT__inner--0',
                markers: true,
                start: 'top', // when top of container is over 100px form
                end: 'bottom top', // when bottom of container is over top window
                scrub: 1, // ease velocity
            },
        });

        pin.to(stagger, {
            ease: 'slow(0.5, 0.8)',
            scale: 0.5,
            stagger: 0.5,
        });
    }

    triggerAnimation() {
        const stagger = gsap.utils.toArray('.gaspT__inner--1 .gaspT__pin');
        if (stagger.length == 0) return;

        const tl = gsap.timeline();
        tl.to(
            stagger,
            0.5, // duration
            {
                x: 100, //Propierties
                stagger: 0.1, // Delay
            }
        );
        tl.to(
            stagger,
            0.5, // duration
            {
                y: 100, //Propierties
                stagger: 0.1, // Delay
            }
        );
        tl.pause();

        const trigger = ScrollTrigger.create({
            trigger: '.gaspT__inner--1',
            pin: true,
            pinSpacing: true,
            markers: true,
            start: 'top top', // when top of container is over top window
            end: 'bottom top', // when bottom of container is over top window
            scrub: 0,
            onEnter: () => tl.play(),
            onEnterBack: () => tl.reverse(),
        });
    }

    triggerScroll() {
        const stagger = gsap.utils.toArray('.gaspT__inner--2 .gaspT__pin');
        if (stagger.length == 0) return;

        const pin = gsap.timeline({
            scrollTrigger: {
                trigger: '.gaspT__inner--2',
                pin: true,
                pinSpacing: true,
                markers: true,
                start: '-=100', // when top of container is over 100px form
                end: 'bottom top', // when bottom of container is over top window
                scrub: 1, // ease velocity
            },
        });

        pin.to(stagger, {
            ease: 'slow(0.5, 0.8)',
            scale: 0.5,
            stagger: 0.5,
        });
    }

    parallax() {
        const parallaxArr = gsap.utils.toArray('.gaspP');
        if (parallaxArr.length == 0) return;

        parallaxArr.forEach((section, index) => {
            gsap.to(this, {
                scrollTrigger: {
                    trigger: section,
                    start: 'top 100%',
                    end: 'bottom',
                    scrub: 0,
                    onUpdate: (self) => {
                        section.style.setProperty('--progress', self.progress);
                    },
                },
            });
        });
    }

    parallaxSimple() {
        gsap.to('.gaspT__inner--3', {
            y: -300,
            scrollTrigger: {
                scrub: 1,
                scroller: window,
                trigger: '.gaspT__inner--3',
                start: 'top bottom',
                end: 'bottom top',
            },
        });
    }

    parallaxSimpleCentered() {
        const tl = gsap
            .timeline({
                scrollTrigger: {
                    trigger: '.gaspC--2',
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1,
                },
            })
            .fromTo('.gaspT__inner--4', { y: '300' }, { y: '0' })
            .fromTo('.gaspT__inner--4', { y: '0' }, { y: '-300' });
    }

    /*
    // HORIZONTAL
    */

    /*
    get total width sum of all card
    */
    cardWidth(card) {
        return [...card]
            .map((item) => {
                return outerWidth(item);
            })
            .reduce((a, b) => a + b, 0);
    }

    /*
    Apply cardWidth to card container ( width ) and trigger ( height )
    */
    applyStyle(width, container, itemToScroll) {
        const styleW = {
            width: `${width}px`,
        };
        const styleH = {
            height: `${width}px`,
        };

        // Apply to trigger Element height
        Object.assign(container.style, styleH);
        // Apply to itemContainer width
        Object.assign(itemToScroll.style, styleW);
    }

    /*
    get prcent total wodth minus windowsWidth
    */
    getPercentMaxScroll(width) {
        return (100 * (width - window.innerWidth)) / width;
    }

    /*
    First horzontal scroll, all container scroll
    */
    horizontalScroll() {
        const container = document.querySelector(
            '.gaspHorizontal__container--0'
        );

        if (!container) return;

        const itemToScroll = container.querySelector('.gaspHorizontal__item');
        const card = container.querySelectorAll('.gaspHorizontal__card');

        let width = this.cardWidth(card);
        this.applyStyle(width, container, itemToScroll);
        let percentRange = this.getPercentMaxScroll(width);

        const tl = gsap.to(itemToScroll, {
            // x: () => `-${width - windowsWidth}px`, // pixel calc
            xPercent: -percentRange, // Percent calc
            ease: 'none',
            scrollTrigger: {
                trigger: container,
                markers: true,
                scrub: 1,
                start: 'top top', // when top of container is over top window
                end: 'bottom bottom', // when bottom of container is over bottom window
                onUpdate: (self) => {
                    container.style.setProperty('--progress', self.progress);
                },
            },
        });

        handleResize(() => {
            width = this.cardWidth(card);
            this.applyStyle(width, container, itemToScroll);
            percentRange = this.getPercentMaxScroll();
            tl.scrollTrigger.refresh();
        });
    }

    /*
    Second horzontal scroll, all card scroll individually
    */
    horizontalScrollSingleCard() {
        const container = document.querySelector(
            '.gaspHorizontal__container--1'
        );

        if (!container) return;

        const itemToScroll = container.querySelector('.gaspHorizontal__item');
        const card = gsap.utils.toArray(
            '.gaspHorizontal__container--1 .gaspHorizontal__card'
        );

        let width = this.cardWidth(card);
        this.applyStyle(width, container, itemToScroll);

        const tl = gsap.to(card, {
            // x: () => `-${width - windowsWidth}px`, // pixel calc
            xPercent: -100 * (card.length - 1),
            ease: 'none',
            scrollTrigger: {
                trigger: container,
                markers: true,
                start: 'top top', // when top of container is over top window
                end: 'bottom bottom', // when bottom of container is over bottom window
                // end: () => "+=" + width, is the same
                scrub: 1,
                // snap: 1 / (card.length - 1),
            },
        });

        handleResize(() => {
            width = this.cardWidth(card);
            this.applyStyle(width, container, itemToScroll);
            tl.scrollTrigger.refresh();
        });
    }
}

export const gsapTest = new gsapTestClass();
