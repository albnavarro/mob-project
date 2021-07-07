import { eventManager } from '../../../js/base/eventManager.js';

class LightboxUtilsClass {
    // RESETTO IL CONTENUTO DELLA DESCRIZIONE LIGHTBOX SE TALE ELEMENTO ESISTE
    // ALLA CHIUSURA DELLA LIGHTBOX O AL CAMBIO LIOGHTBOX
    resetDescriptionBox(wrapper) {
        const parent = wrapper.closest('.lightbox');
        const descriptionBox = parent.querySelector('.lightbox__description');

        if (typeof descriptionBox != 'undefined' && descriptionBox != null) {
            const title = descriptionBox.querySelector('.lightbox__title');
            const description = descriptionBox.querySelector(
                '.lightbox__paragraph'
            );
            const HideDescriptionLightbox = descriptionBox.querySelector(
                '.lightbox__description__btn'
            );

            title.innerHTML = '';
            description.innerHTML = '';
            descriptionBox.classList.remove('active');
        }
    }

    // CAMBIO LO STATO HIDE SHOW DELLA DESCRIZIONE SOLO SE CHIUDO LA LIGHTBOX
    resetDescriptionBoxHideShow(wrapper) {
        const parent = wrapper.closest('.lightbox');
        const descriptionBox = parent.querySelector('.lightbox__description');

        if (typeof descriptionBox != 'undefined' && descriptionBox != null) {
            descriptionBox.classList.remove('hide');
            descriptionBox.classList.add('show');
        }
    }

    // CANCELLO IL wrapperO SOLO SE DINAMICO ( E' UN CONTENUTO DI TIPO IMMAGINE )
    onCloseLightbox({ wrapper, type }) {
        if (
            typeof wrapper != 'undefined' &&
            wrapper != null &&
            type == 'dynamic'
        ) {
            wrapper.innerHTML = '';
            const style = {
                width: '200px',
                height: '200px',
            };

            Object.assign(wrapper.style, style);
        }

        lightboxUtils.resetDescriptionBox(wrapper);
        lightboxUtils.resetDescriptionBoxHideShow(wrapper);
    }

    calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
        const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
        return {
            ratioWidth: srcWidth * ratio,
            ratioHeight: srcHeight * ratio,
        };
    }
}

export const lightboxUtils = new LightboxUtilsClass();
