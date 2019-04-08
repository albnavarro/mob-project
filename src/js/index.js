"use strict";

eventManager.init(false,true);
tGallery.init();
parallaxBackground.init();
parallax.init('JS');
fitImages.init();
toolTip.init();
totop.init();
vh.init();

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

const menu = new menuClass({
      menu:'.menu-container nav.nav',
      toggle:'.menu-container .toggle-element'
    });

const sidebarMenu = new menuClass({
      menu:'.menu-container--sidebar nav.nav',
      toggle:'.menu-container--sidebar .toggle-element',
      direction: 'vertical',
      sideDirection: 'left'
    });

// Provvisorio
const forceResize = () => {
  setTimeout(() => {
    $(window).resize()
  }, 200);
}
eventManager.push('load', forceResize);
