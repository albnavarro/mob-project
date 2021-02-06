// POLYFILL
import { } from "./polyfill/arrayFrom.js"
import { } from "./polyfill/objAssign.js"
import {} from "./polyfill/closest.js";
import {} from "./polyfill/matches.js";
import {} from "./polyfill/flat.js";
import {} from "./polyfill/includes.js";
import {} from "./polyfill/find.js";
import {} from "./polyfill/remove.js";
import {} from "./polyfill/customEvent.js";
import {} from "./polyfill/entries.js";

// BASE MODULE
import { eventManager } from "./base/eventManager.js";
import { mouseManager } from "./base/mouseManager.js";
import { vh } from "./utility/vh.js"
import { findElement } from "./utility/findElement.js"
import { loadImages } from "./utility/loadImages.js"

// NEW VANILLA COMPONENT MODULE
import { totop } from "../component-vanilla/to-top/js/toTop.js"
import { offsetSlider } from "../component-vanilla/offset-slider/js/offsetSlider.js"
import { tBlocks } from "../component-vanilla/threeBlocks/js/tBlocks.js";
import { parallax } from "../component-vanilla/parallax/js/parallax.js";
import { accordionClass } from "../component-vanilla/accordion/js/accordion.js"
import { showElement } from "../component-vanilla/show-element/js/ShowElement.js"
import { popToggleClass } from "../component-vanilla/popToggle/js/popToggle.js"
import { popToggleManagerClass } from "../component-vanilla/popToggle/js/popToggleManager.js"
import { overlayClass } from "../component-vanilla/overlay/js/overlay.js"
import { lightBoxClass } from "../component-vanilla/lightbox/js/lightbox.js"
import { menuClass } from "../component-vanilla/navigation/js/menu.js"
import { toolTip } from "../component-vanilla/tooltip/js/tooltip.js"
import { move3D } from "../component-vanilla/move3D/js/move3D.js"
import { mouseParallax } from "../component-vanilla/mouseParallax/js/mouseParallax.js"

eventManager.init(true,true);
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

// TBlock custom event
// L'evento su tBlocks è legato all'elemento container ( .tBlocks) che lo dispaccia
// Sul cambio di item possiamo fare cose, arriva:
// Direzione: up/down
// Active Index
const tBlockContaner1 = document.querySelector('.container-block-1 .tBlocks');
if (typeof(tBlockContaner1) != 'undefined' && tBlockContaner1 != null) {
    tBlockContaner1.addEventListener('itemChange', (e) => {
        console.log(e.detail)
    }, false);
}

// Offset custom event
// L'evento su OffsetSlider è legato all'elemento component ( .offset-slider ) che lo dispaccia
// Sul cambio di step possiamo fare cose, arriva:
// Active Index
const offsetSliderTest = document.querySelector('.offset-slider');
    if (typeof(offsetSliderTest) != 'undefined' && offsetSliderTest != null) {
    offsetSliderTest.addEventListener('stepChange', (e) => {
        console.log(e.detail)
    }, false);
}


// VANILLA LOADER
const images = [
    '/assets/img/pic1.jpg',
    '/assets/img/pic2.jpg',
    '/assets/img/pic3.jpg',
    '/assets/img/flower3.jpg'
]
const imageLoader = new loadImages(images);
imageLoader.init()
.then(() => console.log('image loaded'))
.catch((e) => console.log(e));
// imageLoader.stop()
//


// const offsetSlider = new offsetSliderClass({
//     container: '.offset-slider',
//     step: 8
// })

// FIND ELEMENT
findElement('.offset-slider').then(() => {
    console.log('founded')
}).catch(() => {
    console.log('not found');
});


// LIGHTBOX
const lightSimply = new lightBoxClass({
      openBtn: '.btn-Lightbox1',
      closeBtn: '.lightbox__closeBtn',
      lightbox: '.lightbox--static',
      type:'normal'
    });
//
const lightImage = new lightBoxClass({
      openBtn: '.btn-LightboxImage',
      closeBtn: '.lightbox__closeBtn',
      lightbox: '.lightbox--image',
      type:'image'
    });
//
const lightSlide = new lightBoxClass({
      openBtn: '.btn-LightboxImageSlide',
      closeBtn: '.lightbox__closeBtn',
      lightbox: '.lightbox--image',
      type: 'image-slide'
    });
//
const lightVideo = new lightBoxClass({
      openBtn: '.btn-LightboxVideo',
      closeBtn: '.lightbox__closeBtn',
      lightbox: '.lightbox--video',
      type: 'video'
    });




// MENU
const menu = new menuClass({
      componentWrapper: '.menu-container--top'
    });

const sidebarMenu = new menuClass({
      componentWrapper: '.menu-container--sidebar',
      direction: 'vertical',
      sideDirection: 'left',
      offCanvas: false
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
const overlay = new overlayClass({element: '#overlay--comp', delay: 300})
overlay.callback = popToggleManager.closeAllPop.bind(popToggleManager);

// POP 1
const popToggle1 = new popToggleClass({
    name: 'pop1',
    openButton: '.popTogglebtn-1',
    target: '.popTarget-1',
    manager: popToggleManager
})
popToggle1.openCallBack = overlay.open.bind(overlay,
    {
        top: '.btn-LightboxImageSlide',
        right: '.popTarget-1',
        bottom: '100',
        left: '0',
        name: 'pop1',
        bodyOverflow: true
    });
popToggle1.openCallBack = callback1.bind(this);
popToggle1.closeCallBack = overlay.close.bind(overlay);
popToggle1.closeCallBack = callback2.bind(this);

// POP 2
const popToggle2 = new popToggleClass({
    name: 'pop2',
    openButton: '.popTogglebtn-2',
    closeButton: '.popTarget-2 button',
    target: '.popTarget-2',
    manager: popToggleManager
})
popToggle2.openCallBack = overlay.open.bind(overlay,
    {
        top: '.popTogglebtn-2',
        right: '.popTarget-2',
        bottom:  '0',
        left: '0',
        name: 'pop2',
        bodyOverflow: true
    });
popToggle2.closeCallBack = overlay.close.bind(overlay);

// POP 3
const popToggle3 = new popToggleClass({
    name: 'pop3',
    openButton: '.popTogglebtn-3',
    closeButton: '.popTarget-3 button',
    target: '.popTarget-3',
    isDropDown: true,
    manager: popToggleManager
})

// POP MANAGER CALLBACK
// popToggleManager.callBackFunction(sidebarMenu.openMainMenu.bind(sidebarMenu));
// popToggleManager.callBackFunction(callback2.bind(this))




// ACCORDION
const accordion = new accordionClass({
    item: '.accrdion-item',
    button: '.accrdion-item__btn',
    target: '.accrdion-item__content',
    breackpoint: 'desktop',
    queryType: 'max'
    // multiple: true

});
// ACCORDION

// Provvisorio
const forceResize = () => {
  setTimeout(() => {
    window.dispatchEvent(new Event('resize'));
  }, 200);
}
eventManager.push('load', forceResize);
