import { eventManager } from "../../../js/base/eventManager.js";
import { lightImageDescription } from "./lightbox-image-description.js";
import { lightboxCommonDynamic } from "./lightbox-common-dynamic.js";
import { lightBoxImage } from "./lightbox-image.js";
import { lightBoxImageSlide } from "./lightbox-image-slide.js";
import { lightBoxVideo } from "./lightbox-video.js";

export class lightBoxClass {

  constructor(data) {
    this.s = {
      $body: $('body'),
      $OpenBtn: data.openBtn || [],
      $closeBtn: data.closeBtn || [],
      $lightBox:  data.lightbox || [],
      $dynamicContent: [], // Elemento vuoto se apro una lightbox semplice
      $staticContent: [],
      dataType: data.type || 'normal'
    }

    this.init();
  }


  init(){
    this.s.$dynamicContent = this.s.$lightBox.find('.lightbox__dinamic-content') || []; // Elemento vuoto se apro una lightbox semplice
    this.s.$staticContent  = this.s.$lightBox.find('.lightbox__static-content') || [];
    this.s.$OpenBtn.on('click' , this.openBtnOnClick.bind(this));
    this.s.$closeBtn.on('click', this.closeBtnOnClick.bind(this));
    this.s.$lightBox.on('click', this.lightBoxOnClick.bind(this));
  }

  openBtnOnClick(event) {
    event.preventDefault();
    const $btn = $(event.target);

    if(!this.s.$lightBox.hasClass('active')){
      this.s.$lightBox.addClass('active');
      eventManager.setBodyOverflow();

      switch(this.s.dataType) {

        case 'normal':
          lightImageDescription.init({
              title: $btn.attr('data-title') || '',
              description: $btn.attr('data-description') || '',
              $content: this.s.$staticContent
          })
          break;

        case 'image':
          lightBoxImage.init({
              url: $btn.attr('data-url'),
              title: $btn.attr('data-title') || '',
              description: $btn.attr('data-description') || '',
              $content: this.s.$dynamicContent
          })
          break;

        case 'image-slide':
          lightBoxImageSlide.init({
            group: $btn.attr('data-imagegroup'),
            $allItem: this.s.$OpenBtn,
            $item: $btn,
            $content: this.s.$dynamicContent
          })
          break;

        case 'video':
          lightBoxVideo.init({
            url: $btn.attr('data-url'),
            title: $btn.attr('data-title') || '',
            description: $btn.attr('data-description') || '',
            ratioW: $btn.attr('data-ratioW') || '16',
            ratioH: $btn.attr('data-ratioH') || '9',
            $content: this.s.$dynamicContent
          })
          break;
      }
    }
  }

  closeBtnOnClick(event) {
    event.preventDefault();
    this.closeLightBox();
  }

  lightBoxOnClick(event) {
    if( $(event.target).is(this.s.$lightBox)){
       this.closeLightBox(event);
    }
  }

  closeLightBox(event) {
    if( this.s.$lightBox.hasClass('active')){
      this.s.$lightBox.removeClass('active');
      eventManager.removeBodyOverflow();

      if ( this.s.dataType == 'image' || this.s.dataType == 'image-slide' || this.s.dataType == 'video' ) {

        lightBoxImage.onCloseLightbox({
          $content: this.s.$dynamicContent,
          type: 'dynamic'
        })

        lightBoxImageSlide.onCloseLightbox({
          $content: this.s.$dynamicContent,
          type: 'dynamic'
        })

        lightboxCommonDynamic.onCloseLightbox({
          $content: this.s.$dynamicContent,
          type: 'dynamic'
        })

      } else {

        lightboxCommonDynamic.onCloseLightbox({
          $content: this.s.$staticContent,
          type: 'normal'
        })
      }
    }
  }

}
