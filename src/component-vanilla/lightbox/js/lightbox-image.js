import { eventManager } from "../../../js/base/eventManager.js";
import { lightImageDescription } from "./lightbox-image-description.js";
import { loadImagesVanilla } from "../../../js/utility/loadImagesVanilla.js";
import { lightboxCommonDynamic } from "./lightbox-common-dynamic.js";


class lightBoxImageClass {

  constructor() {
    this.image = [];
    this.data = {};
    this.onResizeId = -1;
    this.isLoading = false;
    this.isOpen = false;
    this.loadimage = null;
  }

  init(data) {
    this.isOpen= true
    this.data = data;
    this.data.content.innerHTML = '';

    eventManager.remove('resize', this.onResizeId)

    const image = document.createElement('img')
    image.classList.add('lightbox__img')
    image.src = this.data.url

    const loader = document.createElement('div')
    loader.classList.add('loader')
    this.data.content.appendChild(loader);

    this.isLoading = true

    this.loadimage = new loadImagesVanilla([this.data.url])
    this.loadimage.init().then(() => {
        // Aggiungo l'immagine solo se la lightbox è ancora aperta.
        if(!this.isOpen) return;


        this.data.content.appendChild(image);
        this.image = document.querySelector('.lightbox__img');
        this.displayImage(this.image,  this.data);
        this.displayDescription(this.data);

        const loader = this.data.content.querySelector('.loader');
        this.data.content.removeChild(loader);

        this.onResizeId = eventManager.push('resize', this.onResizeLightboxImage.bind(this))
        this.isLoading = false
    }).catch((err) => console.log(err))
  }

  displayImage() {
    const height = this.image.naturalHeight,
          width = this.image.naturalWidth,
          maxHeight = eventManager.windowsHeight() - eventManager.windowsHeight()/3,
          maxWidth = eventManager.windowsWidth() - eventManager.windowsWidth()/3;

    const ratio = lightboxCommonDynamic.calculateAspectRatioFit(width,height,maxWidth,maxHeight);

    const style = {
        'width': ratio.width + 'px',
        'height': ratio.height + 'px'
    };
    Object.assign(this.data.content.style, style);

    setTimeout(() => {
      this.image.classList.add('visible');
    }, 400);
  }

  onResizeLightboxImage() {
    this.image.classList.remove('visible');
    this.displayImage(this.image , this.data);
  }

  displayDescription(data) {
    lightImageDescription.init({
        title: data.title,
        description: data.description,
        content: data.content
    })
  }

  onCloseLightbox() {

    // Esco dal loading image se alla chiusara della lightbox stà ancora caricando.
    // Potrebbe caricare involontariamente la lightbox di un'immagine indesiderata
    // Posso arrivare da lignbox che non usano loadimge
    // In questo caso si presuppone sia null, utilizziamo anche un try catch per maggiore sicurezza.
    if (this.loadimage != null) {
      try {
        this.loadimage.stop()
      }
      catch(err) {
        // console.log(err)
      }
    }
    this.loadimage = null;
    this.isOpen= false
    this.isLoading = false
    eventManager.remove('resize', this.onResizeId)
  }

  imageIsLoading() {
    return this.isLoading
  }

}

export const lightBoxImage = new lightBoxImageClass()
