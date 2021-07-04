import { eventManager } from '../../../js/base/eventManager.js';
import { lightDescription } from './lightbox-description.js';
import { loadImages } from '../../../js/utility/loadImages.js';
import { lightboxUtils } from './lightbox-utils.js';
import { lightPichZoom } from './lightbox-zoom-pinch.js';

class lightBoxImageClass {
    constructor() {
        this.image = [];
        this.onResizeId = -1;
        this.isLoading = false;
        this.isOpen = false;
        this.loadimage = null;
    }

    init({ wrapper, title, url, hGap, wGap, zoom, description }) {
        this.isOpen = true;
        eventManager.remove('resizeW', this.onResizeId);

        const image = new Image();
        image.classList.add('lightbox__img');
        image.src = url;

        const loader = document.createElement('div');
        loader.classList.add('loader');

        const lightbox = wrapper.closest('.lightbox');
        lightbox.appendChild(loader);

        this.isLoading = true;

        this.loadimage = new loadImages([url]);
        this.loadimage
            .init()
            .then(() => {
                // Aggiungo l'immagine solo se la lightbox è ancora aperta.
                if (!this.isOpen) return;

                wrapper.innerHTML = '';

                wrapper.appendChild(image);
                this.image = document.querySelector('.lightbox__img');
                this.displayImage(wrapper, hGap, wGap, zoom);
                this.displayDescription(wrapper, title, description);

                this.removeLoder(wrapper);

                this.onResizeId = eventManager.push('resizeW', () =>
                    this.onResizeLightboxImage(wrapper, hGap, wGap, zoom)
                );
                this.isLoading = false;
            })
            .catch((err) => console.log(err));
    }

    removeLoder(wrapper) {
        if (typeof wrapper != 'undefined' && wrapper != null) {
            const lightbox = wrapper.closest('.lightbox');
            const loader = lightbox.querySelector('.loader');

            if (typeof loader != 'undefined' && loader != null) {
                lightbox.removeChild(loader);
            }
        }
    }

    showNav(wrapper) {
        const parent = wrapper.closest('.lightbox');
        const nav = parent.querySelector('.lightbox__nav');
        if (typeof nav != 'undefined' && nav != null) {
            nav.classList.add('visible');
        }
    }

    displayImage(wrapper, hGap, wGap, zoom) {
        // WW and WH gap
        const newHGap = (eventManager.windowsHeight() / 100) * parseInt(hGap);
        const newWGap = (eventManager.windowsWidth() / 100) * parseInt(wGap);
        const height = this.image.naturalHeight;
        const width = this.image.naturalWidth;
        const maxHeight = eventManager.windowsHeight() - newHGap;
        const maxWidth = eventManager.windowsWidth() - newWGap;

        const { ratioWidth, ratioHeight } =
            lightboxUtils.calculateAspectRatioFit(
                width,
                height,
                maxWidth,
                maxHeight
            );

        const style = {
            width: `${ratioWidth}px`,
            height: `${ratioHeight}px`,
        };
        Object.assign(wrapper.style, style);

        setTimeout(() => {
            this.image.classList.add('visible');

            if (zoom) {
                lightPichZoom.init({
                    wrapper: wrapper,
                    image: this.image,
                });
            } else {
                lightPichZoom.resetData();
            }

            // Shhow nav if exist only when image is loaded
            this.showNav(wrapper);
        }, 400);
    }

    onResizeLightboxImage(wrapper, hGap, wGap, zoom) {
        this.image.classList.remove('visible');
        this.displayImage(wrapper, hGap, wGap, zoom);
    }

    displayDescription(wrapper, title, description) {
        lightDescription.init({
            title,
            description,
            wrapper,
        });
    }

    onCloseLightbox() {
        // Esco dal loading image se alla chiusara della lightbox stà ancora caricando.
        // Potrebbe caricare involontariamente la lightbox di un'immagine indesiderata
        // Posso arrivare da lignbox che non usano loadimge
        // In questo caso si presuppone sia null, utilizziamo anche un try catch per maggiore sicurezza.
        if (this.loadimage != null) {
            try {
                this.loadimage.stop();
            } catch (err) {
                // console.log(err)
            }
        }
        this.loadimage = null;
        this.isOpen = false;
        this.isLoading = false;
        this.removeLoder();
        eventManager.remove('resizeW', this.onResizeId);
    }

    imageIsLoading() {
        return this.isLoading;
    }
}

export const lightBoxImage = new lightBoxImageClass();
