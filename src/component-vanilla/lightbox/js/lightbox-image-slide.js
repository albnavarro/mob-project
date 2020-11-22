import { eventManager } from "../../../js/base/eventManager.js";
import { lightboxUtils } from "./lightbox-utils.js";
import { lightBoxImage } from "./lightbox-image.js";

class lightBoxImageSlideClass {

    constructor() {
        this.buttons = [];
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

        navEl.classList.add('lightbox__nav')
        prevbtn.classList.add('lightbox__nav__prev')
        prevbtn.innerHTML = 'prev';
        nextbtn.classList.add('lightbox__nav__next')
        nextbtn.innerHTML = 'next';

        this.contentContainer.appendChild(navEl);
        const nav = this.contentContainer.querySelector('.lightbox__nav')
        nav.appendChild(prevbtn)
        nav.appendChild(nextbtn)

        const buttonsArray = Array.from(data.allItem);
        this.buttons = buttonsArray.filter((element) => {
            return (element.getAttribute("data-imagegroup") == data.group)
        });

        let index = 0;
        for (const element of this.buttons) {
            this.itemArray.push(new this.setitem(element));

            if (element === data.item) {
                this.index = index;
                console.log('found', index)
            }

            index++
        };

        // Carico la prima immagine
        this.loadImage();

        const nextBtn = document.querySelector('.lightbox__nav__next');
        nextBtn.addEventListener('click', this.next.bind(this))

        const prevBtn = document.querySelector('.lightbox__nav__prev');
        prevBtn.addEventListener('click', this.prev.bind(this))
    }

    setitem(item) {
        this.item = item;
        this.url = item.getAttribute('data-url');
    }

    showImage(url, title, description, content, Hgap, Wgap) {
        lightboxUtils.resetDescriptionBox({
            content: content
        });

        lightBoxImage.init({
            content: content,
            url: url || '',
            title: title || '',
            description: description || '',
            Hgap: Hgap || '20',
            Wgap : Wgap || '20'
        })
    }

    loadImage() {

        this.showImage(
            this.itemArray[this.index].url,
            this.itemArray[this.index].item.getAttribute('data-title'),
            this.itemArray[this.index].item.getAttribute('data-description'),
            this.content,
            this.itemArray[this.index].item.getAttribute('data-hgap'),
            this.itemArray[this.index].item.getAttribute('data-wgap')
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
            this.buttons = [];
            this.itemArray = [];
            this.index = 0;

            const nav = this.contentContainer.querySelector('.lightbox__nav');
            if (typeof(nav) != 'undefined' && nav != null) {
                this.contentContainer.removeChild(nav)
            }
        }
    }

}

export const lightBoxImageSlide = new lightBoxImageSlideClass()
