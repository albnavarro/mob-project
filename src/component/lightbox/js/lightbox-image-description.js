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

      this.$.$descriptionBox = _data.$content.closest('.lighbox').find('.lighbox_description');
      const $title = this.$.$descriptionBox.find('.lighbox_title'),
          $description = this.$.$descriptionBox.find('.lighbox_paragraph');

      if( _data.title != '' ) {
        $title.html('<h2>' + _data.title + '</h2>')
      }
      if( _data.description != '' ) {
        $description.html('<p>' + _data.description + '</p>')
      }

      const $HideDescriptionLightbox = this.$.$descriptionBox.find('.lighbox_description__btn');
      $HideDescriptionLightbox.off('click')
      $HideDescriptionLightbox.on('click',(e) => {
        const $btn = $(e.target);
        this.$.$descriptionBox = $btn.closest('.lighbox_description');
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
