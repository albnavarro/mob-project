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
      closeBtn:$('.lighbox__closeBtn'),
      lighbox:$('.lighbox--static'),
      type:'normal'
    });

const lightImage = new lightBoxClass({
      openBtn:$('.btn-LightboxImage'),
      closeBtn:$('.lighbox__closeBtn'),
      lighbox:$('.lighbox--image'),
      type:'image'
    });

const lightSlide = new lightBoxClass({
      openBtn:$('.btn-LightboxImageSlide'),
      closeBtn:$('.lighbox__closeBtn'),
      lighbox:$('.lighbox--image'),
      type:'image-slide'
    });

const lightVideo = new lightBoxClass({
      openBtn:$('.btn-LightboxVideo'),
      closeBtn:$('.lighbox__closeBtn'),
      lighbox:$('.lighbox--video'),
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
