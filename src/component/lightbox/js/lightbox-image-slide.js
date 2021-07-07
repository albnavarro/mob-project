import { eventManager } from '../../../js/base/eventManager.js';
import { lightboxUtils } from './lightbox-utils.js';
import { lightBoxImage } from './lightbox-image.js';

class LightBoxImageSlideClass {
    constructor() {
        this.buttons = [];
        this.itemArray = [];
        this.index = 0;
        this.open = false;
        this.wrapper = [];
        this.lightbox = [];
    }

    init({ wrapper, allItem, item, group }) {
        this.open = true;
        this.wrapper = wrapper;

        // add navigation btn
        const lightbox = this.wrapper.closest('.lightbox');
        const navEl = document.createElement('nav');
        const prevbtn = document.createElement('button');
        const nextbtn = document.createElement('button');

        navEl.classList.add('lightbox__nav');
        prevbtn.classList.add('lightbox__nav__prev');
        prevbtn.innerHTML = 'prev';
        nextbtn.classList.add('lightbox__nav__next');
        nextbtn.innerHTML = 'next';

        lightbox.appendChild(navEl);
        const nav = lightbox.querySelector('.lightbox__nav');
        nav.appendChild(prevbtn);
        nav.appendChild(nextbtn);

        const buttonsArray = Array.from(allItem);
        this.buttons = buttonsArray.filter((element) => {
            return element.getAttribute('data-imagegroup') == group;
        });

        this.itemArray = this.buttons.map((item) => new this.setitem(item));
        this.index = this.buttons.findIndex((el, i) => el === item);

        // Carico la prima immagine
        this.loadImage();

        const nextBtn = document.querySelector('.lightbox__nav__next');
        nextBtn.addEventListener('click', this.next.bind(this));

        const prevBtn = document.querySelector('.lightbox__nav__prev');
        prevBtn.addEventListener('click', this.prev.bind(this));
    }

    setitem(item) {
        this.item = item;
        this.url = item.getAttribute('data-url');
    }

    showImage(url, title, description, wrapper, hGap, wGap, zoom) {
        lightboxUtils.resetDescriptionBox(wrapper);

        lightBoxImage.init({
            wrapper,
            url: url || '',
            title: title || '',
            description: description || '',
            hGap: hGap || '20',
            wGap: wGap || '20',
            zoom,
        });
    }

    loadImage() {
        this.showImage(
            this.itemArray[this.index].url,
            this.itemArray[this.index].item.getAttribute('data-title'),
            this.itemArray[this.index].item.getAttribute('data-description'),
            this.wrapper,
            this.itemArray[this.index].item.getAttribute('data-hGap'),
            this.itemArray[this.index].item.getAttribute('data-wGap'),
            this.itemArray[this.index].item.hasAttribute('data-zoom')
        );
    }

    prev() {
        // Finche la precendente immagine non + caricata disabilito il caricamento
        // di un'altra immagine per non creare sovrapposizione di loading
        if (lightBoxImage.imageIsLoading()) return;

        this.index > 0
            ? this.index--
            : (this.index = this.itemArray.length - 1);

        this.loadImage();
    }

    next() {
        // Finche la precendente immagine non + caricata disabilito il caricamento
        // di un'altra immagine per non creare sovrapposizione di loading
        if (lightBoxImage.imageIsLoading()) return;

        this.index < this.itemArray.length - 1
            ? this.index++
            : (this.index = 0);

        this.loadImage();
    }

    onCloseLightbox() {
        if (this.open) {
            this.buttons = [];
            this.itemArray = [];
            this.index = 0;

            const lightbox = this.wrapper.closest('.lightbox');
            const nav = lightbox.querySelector('.lightbox__nav');
            if (typeof nav != 'undefined' && nav != null) {
                lightbox.removeChild(nav);
            }
        }
    }
}

export const lightBoxImageSlide = new LightBoxImageSlideClass();
