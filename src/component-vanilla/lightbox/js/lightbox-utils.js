import { eventManager } from "../../../js/base/eventManager.js";

class lightboxUtilsClass {

    constructor() {

    }

    // RESETTO IL CONTENUTO DELLA DESCRIZIONE LIGHTBOX SE TALE ELEMENTO ESISTE
    // ALLA CHIUSURA DELLA LIGHTBOX O AL CAMBIO LIOGHTBOX
    resetDescriptionBox(data) {
        const parent = data.content.closest('.lightbox');
        const descriptionBox = parent.querySelector('.lightbox__description');

        if (typeof(descriptionBox) != 'undefined' && descriptionBox != null) {
            const title = descriptionBox.querySelector('.lightbox__title');
            const description = descriptionBox.querySelector('.lightbox__paragraph');
            const HideDescriptionLightbox = descriptionBox.querySelector('.lightbox__description__btn');

            title.innerHTML = '';
            description.innerHTML = '';
            descriptionBox.classList.remove('active');
        }
    }

    // CAMBIO LO STATO HIDE SHOW DELLA DESCRIZIONE SOLO SE CHIUDO LA LIGHTBOX
    resetDescriptionBoxHideShow(data) {
        const parent = data.content.closest('.lightbox');
        const descriptionBox = parent.querySelector('.lightbox__description');

        if (typeof(descriptionBox) != 'undefined' && descriptionBox != null) {
            descriptionBox.classList.remove('hide');
            descriptionBox.classList.add('show');
        }
    }

    // CANCELLO IL CONTENTO SOLO SE DINAMICO ( E' UN CONTENUTO DI TIPO IMMAGINE )
    onCloseLightbox(data) {
        if (typeof(data.content) != 'undefined' && data.content != null && data.type == 'dynamic') {
            data.content.innerHTML = "";
            const style = {
                'width': '200px',
                'height': '200px'
            }

            Object.assign(data.content.style, style);
        }

        lightboxUtils.resetDescriptionBox(data);
        lightboxUtils.resetDescriptionBoxHideShow(data);
    }

    calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
        const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
        return {
            width: srcWidth * ratio,
            height: srcHeight * ratio
        };
    }

}

export const lightboxUtils = new lightboxUtilsClass()
