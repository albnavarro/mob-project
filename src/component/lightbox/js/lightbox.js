class lightBoxClass {

  constructor(data) {
    this.$ = {
      $body: $('body'),
      $OpenBtn: data.openBtn || [],
      $closeBtn: data.closeBtn || [],
      $lightBox:  data.lighbox || [],
      $dynamicContent: [], // Elemento vuoto se apro una lightbox semplice
      $staticContent: [],
      dataType: data.type || 'normal'
    }

    this.init();
  }


  init(){
    this.$.$dynamicContent = this.$.$lightBox.find('.lighbox__dinamic-content') || []; // Elemento vuoto se apro una lightbox semplice
    this.$.$staticContent  = this.$.$lightBox.find('.lighbox__static-content') || [];
    this.$.$OpenBtn.on('click' , this.openBtnOnClick.bind(this));
    this.$.$closeBtn.on('click', this.closeBtnOnClick.bind(this));
    this.$.$lightBox.on('click', this.lightBoxOnClick.bind(this));
  }

  openBtnOnClick(event) {
    event.preventDefault();
    const $btn = $(event.target);

    if(!this.$.$lightBox.hasClass('active')){
      this.$.$lightBox.addClass('active');
      this.$.$body.css('overflow' , 'hidden');

      switch(this.$.dataType) {

        case 'normal':
          lightImageDescription.init({
              title: $btn.attr('data-title') || '',
              description: $btn.attr('data-description') || '',
              $content: this.$.$staticContent
          })
          break;

        case 'image':
          lightBoxImage.init({
              url: $btn.attr('data-url'),
              title: $btn.attr('data-title') || '',
              description: $btn.attr('data-description') || '',
              $content: this.$.$dynamicContent
          })
          break;

        case 'image-slide':
          lightBoxImageSlide.init({
            group: $btn.attr('data-imagegroup'),
            $allItem: this.$.$OpenBtn,
            $item: $btn,
            $content: this.$.$dynamicContent
          })
          break;

        case 'video':
          lightBoxVideo.init({
            url: $btn.attr('data-url'),
            title: $btn.attr('data-title') || '',
            description: $btn.attr('data-description') || '',
            ratioW: $btn.attr('data-ratioW') || '16',
            ratioH: $btn.attr('data-ratioH') || '9',
            $content: this.$.$dynamicContent
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
    if( $(event.target).is(this.$.$lightBox)){
       this.closeLightBox(event);
    }
  }

  closeLightBox(event) {
    if( this.$.$lightBox.hasClass('active')){
      this.$.$lightBox.removeClass('active');
      this.$.$body.css('overflow-y' , 'visible');
      this.$.$body.css('overflow-x' , 'hidden');

      if ( this.$.dataType == 'image' || this.$.dataType == 'image-slide' || this.$.dataType == 'video' ) {

        lightBoxImage.onCloseLightbox({
          $content: this.$.$dynamicContent,
          type: 'dynamic'
        })

        lightBoxImageSlide.onCloseLightbox({
          $content: this.$.$dynamicContent,
          type: 'dynamic'
        })

        lightboxCommonDynamic.onCloseLightbox({
          $content: this.$.$dynamicContent,
          type: 'dynamic'
        })

      } else {

        lightboxCommonDynamic.onCloseLightbox({
          $content: this.$.$staticContent,
          type: 'normal'
        })
      }
    }
  }

}
