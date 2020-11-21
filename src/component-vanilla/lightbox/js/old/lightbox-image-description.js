import { eventManager } from "../../../js/base/eventManager.js";

class lightImageDescriptionClass {

  constructor() {
    if(!lightImageDescriptionClass.instance){
      this.s = {
        $descriptionBox: []
      }
      lightImageDescriptionClass.instance = this;
    }
    return lightImageDescriptionClass.instance;
  }

  init(data) {
    const _data = data

    if( (_data.title || _data.description != '') ) {

      this.s.$descriptionBox = _data.$content.closest('.lightbox').find('.lightbox__description');
      const $title = this.s.$descriptionBox.find('.lightbox__title'),
          $description = this.s.$descriptionBox.find('.lightbox__paragraph');

      if( _data.title != '' ) {
        $title.html('<h2>' + _data.title + '</h2>')
      }
      if( _data.description != '' ) {
        $description.html('<p>' + _data.description + '</p>')
      }

      const $HideDescriptionLightbox = this.s.$descriptionBox.find('.lightbox__description__btn');
      $HideDescriptionLightbox.off('click')
      $HideDescriptionLightbox.on('click',(e) => {
        const $btn = $(e.target);
        this.s.$descriptionBox = $btn.closest('.lightbox__description');
        if( this.s.$descriptionBox.hasClass('show') ) {
          this.s.$descriptionBox.removeClass('show');
          this.s.$descriptionBox.addClass('hide');
        } else {
          this.s.$descriptionBox.addClass('show');
          this.s.$descriptionBox.removeClass('hide');
        }
      });

      this.s.$descriptionBox.addClass('active');
    }
  }

}

export const lightImageDescription = new lightImageDescriptionClass()
