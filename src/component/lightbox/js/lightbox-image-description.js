class lightImageDescriptionClass {

  constructor() {
    if(!lightImageDescriptionClass.instance){
      this.$ = {
        $descriptionBox: []
      }
      lightImageDescriptionClass.instance = this;
    }
    return lightImageDescriptionClass.instance;
  }

  init(data) {
    const _data = data

    if( (_data.title || _data.description != '') ) {

      this.$.$descriptionBox = _data.$content.closest('.lightbox').find('.lightbox__description');
      const $title = this.$.$descriptionBox.find('.lightbox__title'),
          $description = this.$.$descriptionBox.find('.lightbox__paragraph');

      if( _data.title != '' ) {
        $title.html('<h2>' + _data.title + '</h2>')
      }
      if( _data.description != '' ) {
        $description.html('<p>' + _data.description + '</p>')
      }

      const $HideDescriptionLightbox = this.$.$descriptionBox.find('.lightbox__description__btn');
      $HideDescriptionLightbox.off('click')
      $HideDescriptionLightbox.on('click',(e) => {
        const $btn = $(e.target);
        this.$.$descriptionBox = $btn.closest('.lightbox__description');
        if( this.$.$descriptionBox.hasClass('show') ) {
          this.$.$descriptionBox.removeClass('show');
          this.$.$descriptionBox.addClass('hide');
        } else {
          this.$.$descriptionBox.addClass('show');
          this.$.$descriptionBox.removeClass('hide');
        }
      });

      this.$.$descriptionBox.addClass('active');
    }
  }

}

const lightImageDescription = new lightImageDescriptionClass()
