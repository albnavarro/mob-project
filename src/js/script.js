// POLYFILL
import {} from './polyfill/arrayFrom.js';
import {} from './polyfill/objAssign.js';
import {} from './polyfill/closest.js';
import {} from './polyfill/matches.js';
import {} from './polyfill/flat.js';
import {} from './polyfill/includes.js';
import {} from './polyfill/find.js';
import {} from './polyfill/remove.js';
import {} from './polyfill/customEvent.js';
import {} from './polyfill/entries.js';

// BASE MODULE
import { eventManager } from './base/eventManager.js';
import { mouseManager } from './base/mouseManager.js';
import { vh } from './utility/vh.js';
import { findElement } from './utility/findElement.js';

// NEW VANILLA COMPONENT MODULE
import { totop } from '../component/to-top/js/toTop.js';
import { offsetSlider } from '../component/offset-slider/js/offsetSlider.js';
import { tBlocks } from '../component/threeBlocks/js/tBlocks.js';
import { parallax } from '../component/parallax/js/parallax.js';
import { accordion } from '../component/accordion/js/accordion.js';
import { AccordionItemClass } from '../component/accordion/js/accordionItem.js';
import { showElement } from '../component/show-element/js/ShowElement.js';
import { popToggleClass } from '../component/popToggle/js/popToggle.js';
import { popToggleManagerClass } from '../component/popToggle/js/popToggleManager.js';
import { overlayClass } from '../component/overlay/js/overlay.js';
import { LightBoxClass } from '../component/lightbox/js/lightbox.js';
import { menuClass } from '../component/navigation/js/menu.js';
import { toolTip } from '../component/tooltip/js/tooltip.js';
import { move3D } from '../component/move3D/js/move3D.js';
import { mouseParallax } from '../component/mouseParallax/js/mouseParallax.js';
import { animate } from '../component/animate/js/animate.js';

//TEST
import { gsapTest } from './test/gsapTest.js';
import { loadImageFromManifest } from './test/loadImageFromManifest.js';

const body = document.querySelector('body');

eventManager.init(true, true);
mouseManager.init();
parallax.init();
tBlocks.init();
showElement.init();
toolTip.init();
totop.init();
vh.init();
offsetSlider.init();
move3D.init();
mouseParallax.init();
accordion.init();
if (
    body.classList.contains('page-gsap') ||
    body.classList.contains('page-gsapHorizontal')
)
    gsapTest.init();
animate.init();
loadImageFromManifest.init();

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

// POPTOGGLE
// TEST CALLBACK
function callback1() {
    console.log('callback open');
}

function callback2() {
    console.log('callback close');
}

const popToggleManager = new popToggleManagerClass();
const overlay = new overlayClass({ element: '#overlay--comp', delay: 300 });
overlay.callback = popToggleManager.closeAllPop.bind(popToggleManager);

// POP 1
const popToggle1 = new popToggleClass({
    name: 'pop1',
    openButton: '.popTogglebtn-1',
    target: '.popTarget-1',
    manager: popToggleManager,
});
popToggle1.openCallBack = overlay.open.bind(overlay, {
    top: '.accordion-custom',
    right: '.popTarget-1',
    bottom: '0',
    left: '0',
    name: 'pop1',
    bodyOverflow: true,
});
popToggle1.openCallBack = callback1.bind(window);
popToggle1.closeCallBack = overlay.close.bind(overlay);
popToggle1.closeCallBack = callback2.bind(window);

// POP 2
const popToggle2 = new popToggleClass({
    name: 'pop2',
    openButton: '.popTogglebtn-2',
    closeButton: '.popTarget-2 button',
    target: '.popTarget-2',
    manager: popToggleManager,
});
popToggle2.openCallBack = overlay.open.bind(overlay, {
    top: '.popTogglebtn-2',
    right: '.popTarget-2',
    bottom: '0',
    left: '0',
    name: 'pop2',
    bodyOverflow: true,
});
popToggle2.closeCallBack = overlay.close.bind(overlay);

// POP 3
const popToggle3 = new popToggleClass({
    name: 'pop3',
    openButton: '.popTogglebtn-3',
    closeButton: '.popTarget-3 button',
    target: '.popTarget-3',
    isDropDown: true,
    manager: popToggleManager,
});

// POP MANAGER CALLBACK
// popToggleManager.callBackFunction(sidebarMenu.openMainMenu.bind(sidebarMenu));
// popToggleManager.callBackFunction(callback2.bind(this))

// Provvisorio
const forceResize = () => {
    setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
    }, 200);
};
eventManager.push('load', forceResize);
