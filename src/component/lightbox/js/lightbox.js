import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import { eventManager } from "../../../js/base/eventManager.js";
import { lightDescription } from "./lightbox-description.js";
import { lightboxUtils } from "./lightbox-utils.js";
import { lightBoxImage } from "./lightbox-image.js";
import { lightBoxImageSlide } from "./lightbox-image-slide.js";
import { lightBoxVideo } from "./lightbox-video.js";
import { lightPichZoom } from "./lightbox-zoom-pinch.js";

export class lightBoxClass {

    constructor(data) {
        this.openBtn = document.querySelectorAll(data.openBtn) || null;
        this.closeBtn = document.querySelectorAll(data.closeBtn) || null;
        this.lightBox = document.querySelector(data.lightbox) || null;
        this.dynamicContent = [], // Elemento vuoto se apro una lightbox semplic;
        this.staticContent = [];
        this.dataType = data.type || 'normal';

        this.init()
    }

    init() {
        if (typeof(this.lightBox) === 'undefined' || this.lightBox === null) return;

        this.dynamicContent = this.lightBox.querySelector('.lightbox__dinamic-content') || []; // Elemento vuoto se apro una lightbox semplice
        this.staticContent = this.lightBox.querySelector('.lightbox__static-content') || [];

        const buttonArray = Array.from(this.openBtn);
        for (const button of buttonArray) {
            button.addEventListener('click', this.openBtnOnClick.bind(this))
        };

        const closeButtonArray = Array.from(this.closeBtn);
        for (const button of closeButtonArray) {
            button.addEventListener('click', this.closeBtnOnClick.bind(this))
        }

        this.lightBox.addEventListener('click', this.lightBoxOnClick.bind(this));
    }

    openBtnOnClick(event) {
        event.preventDefault();
        const $btn = event.currentTarget;

        if (!this.lightBox.classList.contains('active')) {
            this.lightBox.classList.add('active');
            disableBodyScroll(this.lightBox);

            switch (this.dataType) {

                case 'normal':
                    lightDescription.init({
                        title: $btn.getAttribute('data-title') || '',
                        description: $btn.getAttribute('data-description') || '',
                        content: this.staticContent
                    })
                    break;

                case 'image':
                    lightBoxImage.init({
                        url: $btn.getAttribute('data-url'),
                        title: $btn.getAttribute('data-title') || '',
                        description: $btn.getAttribute('data-description') || '',
                        content: this.dynamicContent,
                        Hgap : $btn.getAttribute('data-hgap') || '20',
                        Wgap : $btn.getAttribute('data-wgap') || '20',
                        zoom : $btn.hasAttribute('data-zoom'),
                    })
                    break;

                case 'image-slide':
                    lightBoxImageSlide.init({
                        group: $btn.getAttribute('data-imagegroup'),
                        allItem: this.openBtn,
                        item: $btn,
                        content: this.dynamicContent
                    })
                    break;

                case 'video':
                    lightBoxVideo.init({
                        sourceType: $btn.getAttribute('data-sourceType') || 'youtube',
                        url: $btn.getAttribute('data-url'),
                        title: $btn.getAttribute('data-title') || '',
                        description: $btn.getAttribute('data-description') || '',
                        ratioW: $btn.getAttribute('data-ratioW') || '16',
                        ratioH: $btn.getAttribute('data-ratioH') || '9',
                        content: this.dynamicContent,
                        Hgap : $btn.getAttribute('data-hgap') || '20',
                        Wgap : $btn.getAttribute('data-wgap') || '20'
                    })
                    break;
            }
        }
    }

    closeBtnOnClick(event) {
        event.preventDefault();
        this.closeLightBox();
    }

    lightBoxOnClick(event) {
        if (event.target === this.lightBox) {
            this.closeLightBox(event);
        }
    }

    closeLightBox(event) {
        if (this.lightBox.classList.contains('active')) {
            this.lightBox.classList.remove('active');
            enableBodyScroll(this.lightBox);

            if (this.dataType == 'image' ||
                this.dataType == 'image-slide' ||
                this.dataType == 'video') {

                lightBoxImage.onCloseLightbox({
                    content: this.dynamicContent,
                    type: 'dynamic'
                })

                lightPichZoom.resetData();

                lightBoxImageSlide.onCloseLightbox({
                    content: this.dynamicContent,
                    type: 'dynamic'
                })

                lightboxUtils.onCloseLightbox({
                    content: this.dynamicContent,
                    type: 'dynamic'
                })

            } else {

                lightboxUtils.onCloseLightbox({
                    content: this.staticContent,
                    type: 'normal'
                })
            }
        }
    }

}