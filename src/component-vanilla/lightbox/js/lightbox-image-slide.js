import { eventManager } from "../../../js/base/eventManager.js";
import { lightboxCommonDynamic } from "./lightbox-common-dynamic.js";
import { lightBoxImage } from "./lightbox-image.js";

class lightBoxImageSlideClass {

    constructor() {
        this.$el = [];
        this.itemArray = [];
        this.index = 0;
        this.opened = false;
        this.content = [];
        this.contentContainer = [];
    }

    init(data) {
        this.opened = true;
        this.content = data.content;

        // add navigation btn
        this.contentContainer = this.content.closest('.lightbox__container');

        const navEl = document.createElement('nav')
        const prevbtn = document.createElement('button')
        const nextbtn = document.createElement('button')

        navEl.classList.add('lightbox-image-slide__nav')
        navEl.classList.add('clearfix')
        prevbtn.classList.add('lightbox-image-slide__prev')
        prevbtn.innerHTML = 'prev';
        nextbtn.classList.add('lightbox-image-slide__next')
        nextbtn.innerHTML = 'next';

        this.contentContainer.appendChild(navEl);
        const nav = this.contentContainer.querySelector('.lightbox-image-slide__nav')
        nav.appendChild(prevbtn)
        nav.appendChild(nextbtn)

        const elArray = Array.from(data.$allItem);
        this.$el = elArray.filter((element) => {
            return (element.getAttribute("data-imagegroup") == data.group)
        });

        this.$el.forEach((element, index) => {
            this.itemArray.push(new this.setitem(element));

            if (element === data.$item) {
                this.index = index;
            }
        });

        // Carico la prima immagine
        this.loadImage();

        const nextBtn = document.querySelector('.lightbox-image-slide__next');
        nextBtn.addEventListener('click', this.next.bind(this))

        const prevBtn = document.querySelector('.lightbox-image-slide__prev');
        prevBtn.addEventListener('click', this.prev.bind(this))
    }

    setitem($item) {
        this.$item = $item;
        this.url = $item.getAttribute('data-url');
    }

    showImage(url, title, description, content) {
        lightboxCommonDynamic.resetDescriptionBox({
            content: content
        });

        lightBoxImage.init({
            content: content,
            url: url || '',
            title: title || '',
            description: description || ''
        })
    }

    loadImage() {
        this.showImage(
            this.itemArray[this.index].url,
            this.itemArray[this.index].$item.getAttribute('data-title'),
            this.itemArray[this.index].$item.getAttribute('data-description'),
            this.content
        );
    }

    prev() {
        // Finche la precendente immagine non + caricata disabilito il caricamento
        // di un'altra immagine per non creare sovrapposizione di loading
        if (lightBoxImage.imageIsLoading()) return;

        if (this.index > 0) {
            this.index--;
        } else {
            this.index = this.itemArray.length - 1;
        }
        this.loadImage();
    }

    next() {
        // Finche la precendente immagine non + caricata disabilito il caricamento
        // di un'altra immagine per non creare sovrapposizione di loading
        if (lightBoxImage.imageIsLoading()) return;

        if (this.index < this.itemArray.length - 1) {
            this.index++;
        } else {
            this.index = 0;
        }
        this.loadImage();
    }

    onCloseLightbox() {
        if (this.opened) {
            this.$el = [];
            this.itemArray = [];
            this.index = 0;

            const nav = this.contentContainer.querySelector('.lightbox-image-slide__nav');
            if (typeof(nav) != 'undefined' && nav != null) {
                this.contentContainer.removeChild(nav)
            }
        }
    }

}

export const lightBoxImageSlide = new lightBoxImageSlideClass()
