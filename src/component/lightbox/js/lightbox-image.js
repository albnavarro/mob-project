import { eventManager } from "../../../js/base/eventManager.js";
import { lightImageDescription } from "./lightbox-image-description.js";
import { loadImages } from "../../../js/utility/loadImages.js";
import { lightboxCommonDynamic } from "./lightbox-common-dynamic.js";


class lightBoxImageClass {

  constructor() {
    if(!lightBoxImageClass.instance){
      this.s = {
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
    this.s.isOpen= true
    eventManager.remove('resize', this.s.onResizeId)
    this.s._data = data;

    this.s.$img = $("<img>");
    const stringToAppend = `<div>\
        <img class='lightbox__img' src='${this.s._data.url }'>\
        </div>`;

    this.s.$img.attr('src', this.s._data.url);
    this.s._data.$content.append("<div class='loader'>Loading...</div>");
    this.s.isLoading = true
    this.s.loadimage = new loadImages( this.s.$img , callback.bind(this) );

    function callback(){
      // Aggiungo l'immagine solo se la lightbox è ancora aperta.
      if(!this.s.isOpen) return;

      this.s._data.$content.html(stringToAppend);
      this.s.$image = $('.lightbox__img');
      this.displayImage(this.s.$img , this.s.$image,  this.s._data);
      this.displayDescription(this.s._data);

      this.s.onResizeId = eventManager.push('resize', this.onResizeLightboxImage.bind(this))
      this.s.isLoading = false
    }
  }

  displayImage() {
    const height = this.s.$img.get(0).naturalHeight,
          width = this.s.$img.get(0).naturalWidth,
          maxHeight = eventManager.windowsHeight() - eventManager.windowsHeight()/3,
          maxWidth = eventManager.windowsWidth() - eventManager.windowsWidth()/3;

    const ratio = lightboxCommonDynamic.calculateAspectRatioFit(width,height,maxWidth,maxHeight);
    this.s._data.$content.css("width", ratio.width);
    this.s._data.$content.css("height", ratio.height);

    setTimeout(() => {
      this.s.$image.addClass('visible');
    }, 400);
  }

  onResizeLightboxImage() {
    this.s.$image.removeClass('visible');
    this.displayImage(this.s.$img , this.s.$image , this.s._data);
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
    if (this.s.loadimage != null) {
      try {
        this.s.loadimage.stop()
      }
      catch(err) {
        // console.log(err)
      }
    }
    this.s.loadimage = null;
    this.s.isOpen= false
    this.s.isLoading = false
    eventManager.remove('resize', this.s.onResizeId)
  }

  isLoading() {
    return this.s.isLoading
  }

}

export const lightBoxImage = new lightBoxImageClass()
