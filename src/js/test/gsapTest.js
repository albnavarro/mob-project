import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { eventManager } from "../base/eventManager.js";
import { offset, outerHeight, outerWidth } from "../utility/vanillaFunction.js";

class gsapTestClass {

    constructor() {

    }

    init() {
        gsap.registerPlugin(ScrollTrigger)
        this.stikyNoPin()
        this.triggerAnimation()
        this.triggerScroll()
        this.parallax()
        this.horizontalScroll()
        this.horizontalScrollSingleCard()
    }

    stikyNoPin() {
        const stagger = gsap.utils.toArray('.gaspT__inner--0 .gaspT__pin')
        if (stagger.length == 0) return;

        const pin = gsap.timeline({
            scrollTrigger: {
                trigger: '.gaspT__inner--0',
                markers: true,
                start: 'top', // when top of container is over 100px form
                end: 'bottom top', // when bottom of container is over top window
                scrub: 1, // ease velocity
            }
        });

        pin.to(stagger, {
            ease: "slow(0.5, 0.8)",
            scale: .5,
            stagger: .5
        });
    }

    triggerAnimation() {
        const stagger = gsap.utils.toArray('.gaspT__inner--1 .gaspT__pin')
        if (stagger.length == 0) return;

        const tl = gsap.timeline()
        tl.to(stagger,
            .5, // duration
            {
                x: 100, //Propierties
                stagger: .1 // Delay
            }
        )
        tl.to(stagger,
            .5, // duration
            {
                y: 100, //Propierties
                stagger: .1 // Delay
            }
        )
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
        })
    }

    triggerScroll() {
        const stagger = gsap.utils.toArray('.gaspT__inner--2 .gaspT__pin')
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
            }
        });

        pin.to(stagger, {
            ease: "slow(0.5, 0.8)",
            scale: .5,
            stagger: .5
        });
    }

    parallax() {
        const parallaxArr = gsap.utils.toArray(".gaspP")
        if (parallaxArr.length == 0) return;

        parallaxArr.forEach((section, index) => {
            gsap.to(this, {
                scrollTrigger: {
                    trigger: section,
                    start: "top 100%",
                    end: "bottom",
                    scrub: 0,
                    onUpdate: (self) => {
                        section.style.setProperty("--progress", self.progress);
                    }
                }
            });
        });

    }

    horizontalScroll() {
        const container = document.querySelector(".gaspHorizontal__container--0")

        if (!container) return;
        
        const itemToScroll = container.querySelector(".gaspHorizontal__item")
        const card = container.querySelectorAll(".gaspHorizontal__card")
        const windowsWidth = eventManager.windowsWidth()

        // total with , sum of 4 card
        const width = [...card].map(item => {
            return outerWidth(item)
        }).reduce((a, b) => a + b, 0)

        const styleW = {
            'width': `${width}px`
        }
        const styleH = {
            'height': `${width}px`
        }

        // Apply to trigger Element height
        Object.assign(container.style, styleH)
        // Apply to itemContainer width
        Object.assign(itemToScroll.style, styleW)

        // Now itemContainer with and trigger el height is equal so they can scroll in syncronus
        // itemToScroll is in sticky position ( top 0 ) respect container

        // Rage in vw total width - windowsWidth
        const percentRange = (100 * (width - windowsWidth)) / width

        gsap.to(itemToScroll, {
            // x: () => `-${width - windowsWidth}px`, // pixel calc
            xPercent: -percentRange, // Percent calc
            scrollTrigger: {
                trigger: container,
                markers: true,
                scrub: 1,
                start: 'top top', // when top of container is over top window
                end: 'bottom bottom', // when bottom of container is over bottom window
                onUpdate: (self) => {
                    container.style.setProperty("--progress", self.progress);
                }
            }
        })
    }


    horizontalScrollSingleCard() {
        const container = document.querySelector(".gaspHorizontal__container--1")

        if (!container) return;

        const itemToScroll = container.querySelector(".gaspHorizontal__item")
        const card = gsap.utils.toArray(".gaspHorizontal__container--1 .gaspHorizontal__card")
        const windowsWidth = eventManager.windowsWidth()

        const width = [...card].map(item => {
            return outerWidth(item)
        }).reduce((a, b) => a + b, 0)

        const styleW = {
            'width': `${width}px`
        }
        const styleH = {
            'height': `${width}px`
        }
        Object.assign(container.style, styleH)
        Object.assign(itemToScroll.style, styleW)



        gsap.to(card, {
            // x: () => `-${width - windowsWidth}px`, // pixel calc
            xPercent: -100 * (card.length - 1),
            scrollTrigger: {
                trigger: container,
                markers: true,
                start: 'top top', // when top of container is over top window
                end: 'bottom bottom', // when bottom of container is over bottom window
                // end: () => "+=" + width, is the same
                scrub: 1,
                // snap: 1 / (card.length - 1),
            }
        });
    }

}

export const gsapTest = new gsapTestClass()
