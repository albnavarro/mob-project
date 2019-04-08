class lightBoxImageSlideClass {

  constructor() {
    if(!lightBoxImageSlideClass.instance){
      this.$ = {
        $el: [],
        itemArray: [],
        index: 0,
        opened: false,
        $content : {},
        $contentContainer: {}
      }
      lightBoxImageSlideClass.instance = this;
    }
    return lightBoxImageSlideClass.instance;
  }

  init(data) {
    const _data = data

    this.$.opened = true;
    this.$.$content = _data.$content;
    // add navigation btn
    this.$.$contentContainer = this.$.$content.closest('.lightbox__container');
    const StringToAppend = `<div class='lightbox-image-slide__nav clearfix'>\
        <button type='button' class='lightbox-image-slide__prev'>Prev</button>\
        <button type='button' class='lightbox-image-slide__next'>Next</button>\
        </div>`
    this.$.$contentContainer.append(StringToAppend);

    this.$.$el = _data.$allItem.filter((index, element) => {
      return ($(element).data("imagegroup") == _data.group)
    });

    this.$.$el.each((index, element) => {
      const item=$(element);

      this.$.itemArray.push(new this.setitem(item));
      if (item.is(_data.$item) ) {
        this.$.index = index;
      }
    });

    // Carico la prima immagine
    this.loadImage();
    $('.lightbox-image-slide__next').off('click');
    $('.lightbox-image-slide__next').on('click', this.next.bind(this));
    $('.lightbox-image-slide__prev').off('click');
    $('.lightbox-image-slide__prev').on('click', this.prev.bind(this));
  }

  setitem($item) {
    this.$item = $item;
    this.url = $item.data('url');
  }

  showImage(url,title,description,$content) {
    lightboxCommonDynamic.resetDescriptionBox({
      $content: $content
    });

    lightBoxImage.init({
      $content: $content,
      url: url || '',
      title: title || '',
      description: description || ''
    })
  }

  loadImage() {
    this.showImage(
      this.$.itemArray[this.$.index].url,
      this.$.itemArray[this.$.index].$item.data('title'),
      this.$.itemArray[this.$.index].$item.data('description'),
      this.$.$content
    );
  }

  prev(){
    // Finche la precendente immagine non + caricata disabilito il caricamento
    // di un'altra immagine per non creare sovrapposizione di loading
    if( lightBoxImage.isLoading()) return;

    if( this.$.index > 0) {
      this.$.index --;
    } else {
      this.$.index = this.$.itemArray.length-1;
    }
    this.loadImage();
  }

  next(){
    // Finche la precendente immagine non + caricata disabilito il caricamento
    // di un'altra immagine per non creare sovrapposizione di loading
    if( lightBoxImage.isLoading()) return;

    if( this.$.index < this.$.itemArray.length-1) {
      this.$.index ++;
    } else {
      this.$.index = 0;
    }
    this.loadImage();
  }

  onCloseLightbox() {
    if(this.$.opened) {
      this.$.$el = [];
      this.$.itemArray = [];
      this.$.index = 0;
      // remove navigation btn
      $('.lightbox-image-slide__next').off('click');
      $('.lightbox-image-slide__prev').off('click');
      $('.lightbox-image-slide__nav').remove();
    }
  }

}

const lightBoxImageSlide = new lightBoxImageSlideClass()
