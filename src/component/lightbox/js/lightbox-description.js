import { eventManager } from '../../../js/base/eventManager.js';

class lightDescriptionClass {
    init({ title, description, wrapper }) {
        if (title || description != '') {
            const parent = wrapper.closest('.lightbox');
            const container = parent.querySelector('.lightbox__description');
            const titleEl = container.querySelector('.lightbox__title');
            const descriptionEl = container.querySelector(
                '.lightbox__paragraph'
            );

            if (title != '') {
                titleEl.innerHTML = '<h2>' + title + '</h2>';
            }

            if (description != '') {
                descriptionEl.innerHTML = '<p>' + description + '</p>';
            }

            let hideButton = container.querySelector(
                '.lightbox__description__btn'
            );

            // OFF CLICK
            const btn = hideButton.cloneNode(true);
            container.replaceChild(btn, hideButton);
            hideButton = container.querySelector('.lightbox__description__btn');
            hideButton.addEventListener(
                'click',
                this.onClick.bind(this),
                false
            );

            container.classList.add('active');
        }
    }

    onClick(e) {
        const btn = e.target;
        const container = btn.closest('.lightbox__description');

        if (container.classList.contains('show')) {
            container.classList.remove('show');
            container.classList.add('hide');
        } else {
            container.classList.add('show');
            container.classList.remove('hide');
        }
    }
}

export const lightDescription = new lightDescriptionClass();
