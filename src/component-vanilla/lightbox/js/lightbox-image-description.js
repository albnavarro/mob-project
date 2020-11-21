import { eventManager } from "../../../js/base/eventManager.js";

class lightImageDescriptionClass {

  constructor() {

  }

  init(data) {
    if( (data.title || data.description != '') ) {
      const parent = data.content.closest('.lightbox');
      const container = parent.querySelector('.lightbox__description');
      const title = container.querySelector('.lightbox__title');
      const description = container.querySelector('.lightbox__paragraph');

      if( data.title != '' ) {
        title.innerHTML = '<h2>' + data.title + '</h2>';
      }
      if( data.description != '' ) {
        description.innerHTML = '<p>' + data.description + '</p>';
      }

      let hideButton = container.querySelector('.lightbox__description__btn');

      // OFF CLICK
      const btn = hideButton.cloneNode(true);
      container.replaceChild(btn, hideButton);
      hideButton = container.querySelector('.lightbox__description__btn');
      //
      hideButton.addEventListener('click', this.onClick.bind(this), false);

      container.classList.add('active');
    }
  }

  onClick(e) {
      const btn = e.target;
      const container = btn.closest('.lightbox__description');

      if( container.classList.contains('show') ) {
        container.classList.remove('show');
        container.classList.add('hide');
      } else {
        container.classList.add('show');
        container.classList.remove('hide');
      }
  }

}

export const lightImageDescription = new lightImageDescriptionClass()
