"use strict";

eventManager.init(true,true);
tGallery.init();
parallaxBackground.init();
parallax.init('JS');
fitImages.init();
toolTip.init();
totop.init();
vh.init();
section.init();


// LIGHTBOX
const lightSimply = new lightBoxClass({
      openBtn:$('.btn-Lightbox1'),
      closeBtn:$('.lightbox__closeBtn'),
      lightbox:$('.lightbox--static'),
      type:'normal'
    });

const lightImage = new lightBoxClass({
      openBtn:$('.btn-LightboxImage'),
      closeBtn:$('.lightbox__closeBtn'),
      lightbox:$('.lightbox--image'),
      type:'image'
    });

const lightSlide = new lightBoxClass({
      openBtn:$('.btn-LightboxImageSlide'),
      closeBtn:$('.lightbox__closeBtn'),
      lightbox:$('.lightbox--image'),
      type:'image-slide'
    });

const lightVideo = new lightBoxClass({
      openBtn:$('.btn-LightboxVideo'),
      closeBtn:$('.lightbox__closeBtn'),
      lightbox:$('.lightbox--video'),
      type:'video'
    });


// MENU
const menu = new menuClass({
      componentWrepper: '.menu-container--top'
    });

const sidebarMenu = new menuClass({
      componentWrepper: '.menu-container--sidebar',
      direction: 'vertical',
      sideDirection: 'left',
      offCanvas: false
    });


// OFFSETSLIDER
const offsetSlider = new offsetSliderClass({
    container: '.offset-slider',
    step: 8
})

// TEST CALLBACK
function callback1() {
    console.log('callback open');
}

function callback2() {
    console.log('callback close');
}

// POPTOGGLE
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
        bottom: 0,
        left: 0,
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
        bottom:  0,
        left: 0,
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
    $(window).resize()
  }, 200);
}
eventManager.push('load', forceResize);
