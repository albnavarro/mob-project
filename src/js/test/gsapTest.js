import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

class gsapTestClass {

    constructor() {

    }

    init() {
        gsap.registerPlugin(ScrollTrigger)
        this.triggerAnimation()
        this.triggerScroll()
        this.parallax()
    }

    triggerAnimation() {
        const stagger = gsap.utils.toArray('.gaspT__inner--1 .gaspT__pin')

        const tl = gsap.timeline({}).to(stagger, .5, {x: 100, stagger: .1});

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
        gsap.utils.toArray(".gaspP").forEach((section, index) => {
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

}

export const gsapTest = new gsapTestClass()
