import { eventManager } from "../../../js/base/eventManager.js";
import { lightDescription } from "./lightbox-description.js";
import { loadImagesVanilla } from "../../../js/utility/loadImagesVanilla.js";
import { lightboxUtils } from "./lightbox-utils.js";


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
        this.isOpen = true
        this.data = data;
        eventManager.remove('resize', this.onResizeId)

        const image = new Image();
        image.classList.add('lightbox__img')
        image.src = this.data.url

        const loader = document.createElement('div')
        loader.classList.add('loader')
        const lightbox = this.data.content.closest('.lightbox')
        lightbox.appendChild(loader);

        this.isLoading = true

        this.loadimage = new loadImagesVanilla([this.data.url])
        this.loadimage.init().then(() => {
            // Aggiungo l'immagine solo se la lightbox è ancora aperta.
            if (!this.isOpen) return;

            this.data.content.innerHTML = '';

            this.data.content.appendChild(image);
            this.image = document.querySelector('.lightbox__img');
            this.displayImage(this.image, this.data);
            this.displayDescription(this.data);

            this.removeLoder();

            this.onResizeId = eventManager.push('resize', this.onResizeLightboxImage.bind(this))
            this.isLoading = false
        }).catch((err) => console.log(err))
    }

    removeLoder() {
        if (typeof(this.data.content) != 'undefined' && this.data.content != null) {
            const lightbox = this.data.content.closest('.lightbox')
            const loader = lightbox.querySelector('.loader');

            if (typeof(loader) != 'undefined' && loader != null) {
                lightbox.removeChild(loader);
            }
        }
    }

    showNav() {
        const parent = this.data.content.closest('.lightbox__container');
        const nav = parent.querySelector('.lightbox__nav');
        if (typeof(nav) != 'undefined' && nav != null) {
            nav.classList.add('visible');
        }
    }

    displayImage() {
        // WW and WH gap
        const Hgap = (eventManager.windowsHeight() / 100) * parseInt(this.data.Hgap);
        const Wgap = (eventManager.windowsWidth() / 100) * parseInt(this.data.Wgap);

        const height = this.image.naturalHeight,
            width = this.image.naturalWidth,
            maxHeight = eventManager.windowsHeight() - Hgap,
            maxWidth = eventManager.windowsWidth() - Wgap;

        const ratio = lightboxUtils.calculateAspectRatioFit(width, height, maxWidth, maxHeight);

        const style = {
            'width': ratio.width + 'px',
            'height': ratio.height + 'px'
        };
        Object.assign(this.data.content.style, style);

        setTimeout(() => {
            this.image.classList.add('visible');

            // Shhow nav if exist only when image is loaded
            this.showNav()
        }, 400);
    }

    onResizeLightboxImage() {
        this.image.classList.remove('visible');
        this.displayImage(this.image, this.data);
    }

    displayDescription(data) {
        lightDescription.init({
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
            } catch (err) {
                // console.log(err)
            }
        }
        this.loadimage = null;
        this.isOpen = false;
        this.isLoading = false;
        this.removeLoder();
        eventManager.remove('resize', this.onResizeId)
    }

    imageIsLoading() {
        return this.isLoading
    }

}

export const lightBoxImage = new lightBoxImageClass()
