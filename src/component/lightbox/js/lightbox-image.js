class lightBoxImageClass {

  constructor() {
    if(!lightBoxImageClass.instance){
      this.$ = {
        $image: [],
        $img: [],
        _data: {},
        onResizeId: -1,
        isLoading: false,
        isOpen: false,
        loadimage: null
      }
      lightBoxImageClass.instance = this;
    }
    return lightBoxImageClass.instance;
  }

  init(data) {
    this.$.isOpen= true
    eventManager.remove('resize', this.$.onResizeId)
    this.$._data = data;

    this.$.$img = $("<img>");
    const stringToAppend = `<div>\
        <img class='lightbox__img' src='${this.$._data.url }'>\
        </div>`;

    this.$.$img.attr('src', this.$._data.url);
    this.$._data.$content.append("<div class='loader'>Loading...</div>");
    this.$.isLoading = true
    this.$.loadimage = new loadImages( this.$.$img , callback.bind(this) );

    function callback(){
      // Aggiungo l'immagine solo se la lightbox è ancora aperta.
      if(!this.$.isOpen) return;

      this.$._data.$content.html(stringToAppend);
      this.$.$image = $('.lightbox__img');
      this.displayImage(this.$.$img , this.$.$image,  this.$._data);
      this.displayDescription(this.$._data);

      this.$.onResizeId = eventManager.push('resize', this.onResizeLightboxImage.bind(this))
      this.$.isLoading = false
    }
  }

  displayImage() {
    const height = this.$.$img.get(0).naturalHeight,
          width = this.$.$img.get(0).naturalWidth,
          maxHeight = eventManager.windowsHeight() - eventManager.windowsHeight()/3,
          maxWidth = eventManager.windowsWidth() - eventManager.windowsWidth()/3;

    const ratio = lightboxCommonDynamic.calculateAspectRatioFit(width,height,maxWidth,maxHeight);
    this.$._data.$content.css("width", ratio.width);
    this.$._data.$content.css("height", ratio.height);

    setTimeout(() => {
      this.$.$image.addClass('visible');
    }, 400);
  }

  onResizeLightboxImage() {
    this.$.$image.removeClass('visible');
    this.displayImage(this.$.$img , this.$.$image , this.$._data);
  }

  displayDescription(data) {
    lightImageDescription.init({
        title: data.title,
        description: data.description,
        $content: data.$content
    })
  }

  onCloseLightbox() {

    // Esco dal loading image se alla chiusara della lightbox stà ancora caricando.
    // Potrebbe caricare involontariamente la lightbox di un'immagine indesiderata
    // Posso arrivare da lignbox che non usano loadimge
    // In questo caso si presuppone sia null, utilizziamo anche un try catch per maggiore sicurezza.
    if (this.$.loadimage != null) {
      try {
        this.$.loadimage.stop()
      }
      catch(err) {
        // console.log(err)
      }
    }
    this.$.loadimage = null;
    this.$.isOpen= false
    this.$.isLoading = false
    eventManager.remove('resize', this.$.onResizeId)
  }

  isLoading() {
    return this.$.isLoading
  }

}

const lightBoxImage = new lightBoxImageClass()
