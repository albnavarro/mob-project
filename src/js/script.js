// POLYFILL
// import { arrayFromPolyfill } from './polyfill/arrayFrom.js';
// import { objAssignPolyfill } from './polyfill/objAssign.js';
// import { closestPolyfill } from './polyfill/closest.js';
// import { arrayMatchesPolyfill } from './polyfill/matches.js';
// import { arrayFlatPolyfill } from './polyfill/flat.js';
// import { arrayIncludesPolyfill } from './polyfill/includes.js';
// import { arrayFindPolyfill } from './polyfill/find.js';
// import { removePolyfill } from './polyfill/remove.js';
// import { customEventPolyfill } from './polyfill/customEvent.js';
// import { objEntriesPolyfill } from './polyfill/entries.js';

// BASE MODULE
import { vh } from './utility/vh.js';
import { findElement } from './utility/findElement.js';

// NEW VANILLA COMPONENT MODULE
import { totop } from '../component/to-top/js/toTop.js';
import { tBlocks } from '../component/threeBlocks/js/tBlocks.js';
import { accordion } from '../component/accordion/js/accordion.js';
import { AccordionItemClass } from '../component/accordion/js/accordionItem.js';
import { showElement } from '../component/show-element/js/ShowElement.js';
import { LightBoxClass } from '../component/lightbox/js/lightbox.js';
import { menuClass } from '../component/navigation/js/menu.js';
import { toolTip } from '../component/tooltip/js/tooltip.js';
import { move3D } from '../component/move3D/js/move3D.js';
import { glitch } from '../component/glitch/js/glitch.js';
import { wave } from '../component/wave/js/wave.js';
import { predictiveTurbolence } from '../component/predictiveTurbolence/js/predictiveTurbolence.js';
import { animate } from '../component/animate/js/animate.js';
import { pageScroll } from '../component/pageScroll/js/pageScroll.js';
import { dragger } from '../component/dragger/js/dragger.js';
import { GsapHorizontalCustomClass } from '../component/gsapHorizontalCustom/js/gsapHorizontalCustom.js';

//TEST
import { gsapTest } from './test/gsapTest.js';
import { storeTest } from './test/storeTest.js';
import { hScroller } from './test/hScroller.js';
import { loadImageFromManifest } from './test/loadImageFromManifest.js';
import { springTest } from './test/springTest.js';
import { tweenTest } from './test/tweenTest.js';
import { lerpTest } from './test/lerpTest.js';
import { staggerTweenTest } from './test/staggerTweenTest.js';
import { staggerSpringTest } from './test/staggerSpringTest.js';
import { staggerLerpTest } from './test/staggerLerpTest.js';
import { mouseStagger } from './test/mouseStagger.js';
import { timlineMixTest } from './test/timlineMixTest.js';
import { indexParallax } from './test/indexParallax.js';
import { noGsap } from './test/noGsapScroller.js';
import { sinAnimation } from './test/sinAnimation.js';
import { sinRevertAnimation } from './test/sinRevertAnimation.js';
import { circleAnimation } from './test/circleAnimation.js';
import { circleAnimationTimeline } from './test/circleAnimationTimeline.js';
import { infiniteAnimation } from './test/infiniteAnimation.js';
import { syncTimelineTest } from './test/syncTimelineTest.js';
import { infiniteAnimationSync } from './test/infiniteAnimationSync.js';
import { scrollStagger } from './test/scrollStagger.js';
import { gridStaggerTween } from './test/gridStaggerTween.js';
import { gridStaggerSpring } from './test/gridStaggerSpring.js';
import { gridStaggerLerp } from './test/gridStaggerLerp.js';
import { gridStaggerSequencer } from './test/gridStaggerSequencer.js';
import { radialStaggerTween } from './test/radialStaggerTween.js';
import { stressTestStagger } from './test/stressTestStagger.js';
import { masterSequencer } from './test/masterSequencer.js';
import { sequencerStaggerTime } from './test/sequencerStaggerTime.js';
import { createStagger } from './test/createStagger.js';
import { tweenRealtive } from './test/tweenRelative.js';
import { testCanvas } from './test/testCanvas.js';
import { freeMode } from './test/freemode.js';
import { mouseParallaxTest } from './test/mouseParallaxTest.js';
import { core } from './mobbu';
import { timlineReverseImmediateTest } from './test/timlineReverseImmediateTest.js';

core.useLoad(() => {
    core.setDefault({
        deferredNextTick: true,
        // fpsScalePercent: { 0: 1, 30: 2, 50: 3 },
        useScaleFps: true,
        // throttle: 60,
        mq: {
            desktop: 1024,
        },
        spring: {
            config: {
                customSpring: {
                    friction: 1,
                    mass: 1,
                    precision: 0.01,
                    tension: 180,
                    velocity: 0,
                },
            },
        },
    });

    core.printDefault();

    // core.useFps(({ averageFPS }) => {
    //     console.log('fps ready at:', averageFPS);
    // });

    // core.useFrameIndex(() => {
    //     console.log('test');
    //     console.log('fps: ', core.getFps());
    // }, 500);

    const body = document.querySelector('body');

    pageScroll.init();
    tBlocks.init();
    showElement.init();
    toolTip.init();
    totop.init();
    vh.init();
    move3D.init();
    dragger.init();
    accordion.init();
    animate.init();
    loadImageFromManifest.init();

    // SVG
    glitch.init();
    wave.init();
    predictiveTurbolence.init();

    // CUSTOM ACCORDION VIA JS
    const accordionCustom = new AccordionItemClass({
        container: document.querySelector('.accordion-custom'),
        item: '.accrdion-item',
        toggle: '.accrdion-item__btn',
        content: '.accrdion-item__content',
        multiple: true,
    });
    accordionCustom.init();

    // TBlock custom event
    // L'evento su tBlocks è legato all'elemento container ( .tBlocks) che lo dispaccia
    // Sul cambio di item possiamo fare cose, arriva:
    // Direzione: up/down
    // Active Index
    const tBlockContaner1 = document.querySelector(
        '.container-block-1 .tBlocks'
    );
    if (typeof tBlockContaner1 != 'undefined' && tBlockContaner1 != null) {
        tBlockContaner1.addEventListener(
            'itemChange',
            (e) => {
                console.log(e.detail);
            },
            false
        );
    }

    // FIND ELEMENT
    findElement('.offset-slider')
        .then(() => {
            console.log('founded');
        })
        .catch(() => {
            console.log('not found');
        });

    // LIGHTBOX
    const lightSimply = new LightBoxClass({
        openBtn: '.btn-Lightbox1',
        closeBtn: '.lightbox__closeBtn',
        lightbox: '.lightbox--static',
        type: 'normal',
    });
    //
    const lightImage = new LightBoxClass({
        openBtn: '.btn-LightboxImage',
        closeBtn: '.lightbox__closeBtn',
        lightbox: '.lightbox--image',
        type: 'image',
    });
    //
    const lightSlide = new LightBoxClass({
        openBtn: '.btn-LightboxImageSlide',
        closeBtn: '.lightbox__closeBtn',
        lightbox: '.lightbox--image',
        type: 'image-slide',
    });
    //
    const lightVideo = new LightBoxClass({
        openBtn: '.btn-LightboxVideo',
        closeBtn: '.lightbox__closeBtn',
        lightbox: '.lightbox--video',
        type: 'video',
    });

    // MENU
    const menu = new menuClass({
        componentWrapper: '.menu-container--top',
    });

    const sidebarMenu = new menuClass({
        componentWrapper: '.menu-container--sidebar',
        direction: 'vertical',
        sideDirection: 'left',
        offCanvas: false,
    });

    if (body.classList.contains('page-index')) {
        core.setDefault({
            usePassive: false,
        });
        indexParallax();
    }

    if (
        body.classList.contains('page-gsap') ||
        body.classList.contains('page-gsapHorizontal')
    ) {
        gsapTest.init();
    }

    if (body.classList.contains('page-store')) storeTest.init();

    if (body.classList.contains('template-mouseParallax')) {
        mouseParallaxTest();
    }

    if (body.classList.contains('page-asyncTimeline')) {
        springTest();
        tweenTest();
        lerpTest();
        timlineMixTest();
        timlineReverseImmediateTest();
    }

    if (body.classList.contains('page-asyncTimelineStagger')) {
        staggerTweenTest();
        staggerSpringTest();
        staggerLerpTest();
    }

    if (body.classList.contains('page-asyncShape')) {
        sinAnimation();
        sinRevertAnimation();
        circleAnimation();
        circleAnimationTimeline();
        infiniteAnimation();
    }

    if (body.classList.contains('page-syncShape')) {
        infiniteAnimationSync();
    }

    if (body.classList.contains('page-syncTimeline')) {
        syncTimelineTest();
    }

    if (body.classList.contains('page-mouseStagger')) {
        mouseStagger();
    }

    if (body.classList.contains('template-scrollerH')) {
        core.setDefault({
            usePassive: false,
        });
        core.printDefault();
        hScroller();
    }

    if (body.classList.contains('page-gsapHorizontal2')) {
        const gsapHorizontalCustom = new GsapHorizontalCustomClass({
            rootEl: '.gsap-test-custom-scroller',
        });
        gsapHorizontalCustom.init();

        const gsapHorizontalCustom2 = new GsapHorizontalCustomClass({
            rootEl: '.gsap-test-custom-scroller2',
        });
        gsapHorizontalCustom2.init();
    }

    if (body.classList.contains('page-noGsapHorizontal2')) {
        noGsap();
    }

    if (body.classList.contains('page-scrollStagger')) {
        scrollStagger();
    }
    if (body.classList.contains('page-gridStagger')) {
        gridStaggerTween();
        gridStaggerSpring();
        gridStaggerLerp();
        gridStaggerSequencer();
    }

    if (body.classList.contains('page-radialStagger')) {
        radialStaggerTween();
    }

    if (body.classList.contains('page-stressTestStagger')) {
        stressTestStagger();
    }

    if (body.classList.contains('page-masterSequencer')) {
        masterSequencer();
    }

    if (body.classList.contains('page-sequencerStaggerTime')) {
        sequencerStaggerTime();
    }

    if (body.classList.contains('page-createStagger')) {
        createStagger();
    }

    if (body.classList.contains('page-tweenRelative')) {
        tweenRealtive();
    }

    if (body.classList.contains('page-canvas')) {
        testCanvas();
    }

    if (body.classList.contains('page-freemode')) {
        freeMode();
    }

    // Provvisorio
    // const forceResize = () => {
    //     setTimeout(() => {
    //         console.log('resize');
    //         window.dispatchEvent(new Event('resize'));
    //     }, 2000);
    // };
    // forceResize();
});
