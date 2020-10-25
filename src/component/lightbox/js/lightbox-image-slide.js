class lightBoxImageSlideClass {

  constructor() {
    if(!lightBoxImageSlideClass.instance){
      this.s = {
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

    this.s.opened = true;
    this.s.$content = _data.$content;
    // add navigation btn
    this.s.$contentContainer = this.s.$content.closest('.lightbox__container');
    const StringToAppend = `<div class='lightbox-image-slide__nav clearfix'>\
        <button type='button' class='lightbox-image-slide__prev'>Prev</button>\
        <button type='button' class='lightbox-image-slide__next'>Next</button>\
        </div>`
    this.s.$contentContainer.append(StringToAppend);

    this.s.$el = _data.$allItem.filter((index, element) => {
      return ($(element).data("imagegroup") == _data.group)
    });

    this.s.$el.each((index, element) => {
      const item=$(element);

      this.s.itemArray.push(new this.setitem(item));
      if (item.is(_data.$item) ) {
        this.s.index = index;
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
      this.s.itemArray[this.s.index].url,
      this.s.itemArray[this.s.index].$item.data('title'),
      this.s.itemArray[this.s.index].$item.data('description'),
      this.s.$content
    );
  }

  prev(){
    // Finche la precendente immagine non + caricata disabilito il caricamento
    // di un'altra immagine per non creare sovrapposizione di loading
    if( lightBoxImage.isLoading()) return;

    if( this.s.index > 0) {
      this.s.index --;
    } else {
      this.s.index = this.s.itemArray.length-1;
    }
    this.loadImage();
  }

  next(){
    // Finche la precendente immagine non + caricata disabilito il caricamento
    // di un'altra immagine per non creare sovrapposizione di loading
    if( lightBoxImage.isLoading()) return;

    if( this.s.index < this.s.itemArray.length-1) {
      this.s.index ++;
    } else {
      this.s.index = 0;
    }
    this.loadImage();
  }

  onCloseLightbox() {
    if(this.s.opened) {
      this.s.$el = [];
      this.s.itemArray = [];
      this.s.index = 0;
      // remove navigation btn
      $('.lightbox-image-slide__next').off('click');
      $('.lightbox-image-slide__prev').off('click');
      $('.lightbox-image-slide__nav').remove();
    }
  }

}

const lightBoxImageSlide = new lightBoxImageSlideClass()
