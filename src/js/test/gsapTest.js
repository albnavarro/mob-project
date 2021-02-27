import {gsap} from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

class gsapTestClass {

    constructor() {

    }

    init() {
        gsap.registerPlugin(ScrollTrigger)
        this.triggerAnimation()
        this.triggerScroll()
    }

    triggerAnimation() {
        const stagger = gsap.utils.toArray('.gaspT__inner--1 .gaspT__pin')

        const tl = gsap.timeline({ paused: true }).to(stagger, .5,  {x: 100});

        const trigger = ScrollTrigger.create({
            trigger: '.gaspT__inner--1',
            pin: true,
            pinSpacing: true,
            markers: true,
            start: 'top top',
            end: 'bottom top',
            scrub: 0,
            onEnter: () => tl.play(),
            onEnterBack: () => tl.reverse(),
        });
    }

    triggerScroll() {
        const stagger = gsap.utils.toArray('.gaspT__inner--2 .gaspT__pin')

        const pin = gsap.timeline({
          scrollTrigger: {
            trigger: '.gaspT__inner--2',
            pin: true,
            pinSpacing: true,
            markers: true,
            start: '-=100',
            end: 'bottom top',
            scrub: 0,
          }
        });

        pin.to(stagger, { scale: .5, stagger: .5});
    }

}

export const gsapTest = new gsapTestClass()
