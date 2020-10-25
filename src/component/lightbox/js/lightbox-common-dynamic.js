import { eventManager } from "../../../js/base/eventManager.js";

class lightboxCommonDynamicClass {

  constructor() {
    if(!lightboxCommonDynamicClass.instance){
      lightboxCommonDynamicClass.instance = this;
    }
    return lightboxCommonDynamicClass.instance;
  }

  // RESETTO IL CONTENUTO DELLA DESCRIZIONE LIGHTBOX SE TALE ELEMENTO ESISTE
  // ALLA CHIUSURA DELLA LIGHTBOX O AL CAMBIO LIOGHTBOX
  resetDescriptionBox(data) {
    const _data = data,
          $descriptionBox = _data.$content.closest('.lightbox').find('.lightbox__description');

    if( $descriptionBox.length ) {
      const $title = $descriptionBox.find('.lightbox__title'),
            $description = $descriptionBox.find('.lightbox__paragraph'),
            $HideDescriptionLightbox = $descriptionBox.find('.lightbox__description__btn');

      $title.html('');
      $description.html('');
      $descriptionBox.removeClass('active');
      $HideDescriptionLightbox.off('click');
    }
  }

  // CAMBIO LO STATO HIDE SHOW DELLA DESCRIZIONE SOLO SE CHIUDO LA LIGHTBOX
  resetDescriptionBoxHideShow(data) {
    const _data = data,
          $descriptionBox = _data.$content.closest('.lightbox').find('.lightbox__description');

    if( $descriptionBox.length ) {
      $descriptionBox.removeClass('hide');
      $descriptionBox.addClass('show');
    }
  }

  // CANCELLO IL CONTENTO SOLO SE DINAMICO ( E' UN CONTENUTO DI TIPO IMMAGINE )
  onCloseLightbox(data) {
    const _data = data

    if ( _data.$content.length  && _data.type == 'dynamic') {
      _data.$content.html("");
      _data.$content.css('width' , '200px')
      .css('height' , '200px');
    }
    lightboxCommonDynamic.resetDescriptionBox(_data);
    lightboxCommonDynamic.resetDescriptionBoxHideShow(_data);
  }

  calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
    const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
    return { width: srcWidth*ratio, height: srcHeight*ratio };
  }

}

export const lightboxCommonDynamic = new lightboxCommonDynamicClass()
