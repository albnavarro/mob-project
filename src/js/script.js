// POLYFILL
import { arrayFromPolyfill } from './polyfill/arrayFrom.js';
import { objAssignPolyfill } from './polyfill/objAssign.js';
import { closestPolyfill } from './polyfill/closest.js';
import { arrayMatchesPolyfill } from './polyfill/matches.js';
import { arrayFlatPolyfill } from './polyfill/flat.js';
import { arrayIncludesPolyfill } from './polyfill/includes.js';
import { arrayFindPolyfill } from './polyfill/find.js';
import { removePolyfill } from './polyfill/remove.js';
import { customEventPolyfill } from './polyfill/customEvent.js';
import { objEntriesPolyfill } from './polyfill/entries.js';

// BASE MODULE
import { eventManager } from './base/eventManager.js';
import { mouseManager } from './base/mouseManager.js';
import { vh } from './utility/vh.js';
import { findElement } from './utility/findElement.js';

// NEW VANILLA COMPONENT MODULE
import { totop } from '../component/to-top/js/toTop.js';
import { tBlocks } from '../component/threeBlocks/js/tBlocks.js';
import { parallax } from '../component/parallax/js/parallax.js';
import { ParallaxItemClass } from '../component/parallax/js/parallaxItem.js';
import { accordion } from '../component/accordion/js/accordion.js';
import { AccordionItemClass } from '../component/accordion/js/accordionItem.js';
import { showElement } from '../component/show-element/js/ShowElement.js';
import { LightBoxClass } from '../component/lightbox/js/lightbox.js';
import { menuClass } from '../component/navigation/js/menu.js';
import { toolTip } from '../component/tooltip/js/tooltip.js';
import { move3D } from '../component/move3D/js/move3D.js';
import { mouseParallax } from '../component/mouseParallax/js/mouseParallax.js';
import { glitch } from '../component/glitch/js/glitch.js';
import { wave } from '../component/wave/js/wave.js';
import { predictiveTurbolence } from '../component/predictiveTurbolence/js/predictiveTurbolence.js';
import { animate } from '../component/animate/js/animate.js';
import { pageScroll } from '../component/pageScroll/js/pageScroll.js';
import { SmoothScrollClass } from '../component/smoothScroll/js/smoothScroll.js';
import { dragger } from '../component/dragger/js/dragger.js';
import { GsapHorizontalCustomClass } from '../component/gsapHorizontalCustom/js/gsapHorizontalCustom.js';

//TEST
import { gsapTest } from './test/gsapTest.js';
import { storeTest } from './test/storeTest.js';
import { hScroller } from './test/hScroller.js';
import { loadImageFromManifest } from './test/loadImageFromManifest.js';
import { springTest } from './test/springTest.js';

const body = document.querySelector('body');
eventManager.init(true, true);

if (body.classList.contains('page-index')) {
   springTest();
}

if (body.classList.contains('template-fixed')) {
    const smoothScroll = new SmoothScrollClass();
    smoothScroll.init();
}

if (body.classList.contains('template-scrollerH')) {
    hScroller();
}

if (body.classList.contains('page-gsapHorizontal2')) {
    const gsapHorizontalCustom = new GsapHorizontalCustomClass({
        rootEl: '.test-custom-scroller',
    });
    gsapHorizontalCustom.init();

    const gsapHorizontalCustom2 = new GsapHorizontalCustomClass({
        rootEl: '.test-custom-scroller2',
    });
    gsapHorizontalCustom2.init();
}

mouseManager.init();
pageScroll.init();
parallax.init();
tBlocks.init();
showElement.init();
toolTip.init();
totop.init();
vh.init();
move3D.init();
mouseParallax.init();
dragger.init();

accordion.init();
if (
    body.classList.contains('page-gsap') ||
    body.classList.contains('page-gsapHorizontal')
)
    gsapTest.init();

if (body.classList.contains('page-store')) storeTest.init();
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
const tBlockContaner1 = document.querySelector('.container-block-1 .tBlocks');
if (typeof tBlockContaner1 != 'undefined' && tBlockContaner1 != null) {
    tBlockContaner1.addEventListener(
        'itemChange',
        (e) => {
            console.log(e.detail);
        },
        false
    );
}

// Offset custom event
// L'evento su OffsetSlider è legato all'elemento component ( .offset-slider ) che lo dispaccia
// Sul cambio di step possiamo fare cose, arriva:
// Active Index
const offsetSliderTest = document.querySelector('.offset-slider');
if (typeof offsetSliderTest != 'undefined' && offsetSliderTest != null) {
    offsetSliderTest.addEventListener(
        'stepChange',
        (e) => {
            console.log(e.detail);
        },
        false
    );
}

// const offsetSlider = new offsetSliderClass({
//     container: '.offset-slider',
//     step: 8
// })

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

// Provvisorio
const forceResize = () => {
    setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
    }, 500);
};
eventManager.push('load', forceResize);
