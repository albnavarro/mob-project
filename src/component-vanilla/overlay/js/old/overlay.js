import { eventManager } from "../../../js/base/eventManager.js";

export class overlayClass {

  constructor(data) {
      this.s = {
          $overlay: $(`${data.element}`),
          delay: data.delay || 300,
          callBack: null,
          bodyOverflow: false,
          $body: $('body'),

      }
    this.init();
  }

  init() {
      this.s.$overlay.on('click', this.onClick.bind(this))
  }

  onClick() {
      this.close();

      if(this.s.callBack != null) {
          this.s.callBack();
      }
  }


  open(data) {
      let top = 0,
          right = 0,
          bottom = 0,
          left = 0,
          dataName = '';

      setTimeout(() => {
          this.s.bodyOverflow = data.bodyOverflow;
          if( this.s.bodyOverflow) eventManager.setBodyOverflow();

          if ( isNaN(data.top) ) {
              const $el = $(`${data.top}`);
              top = $el.offset().top + $el.outerHeight();
          } else {
              top = data.top;
          }

          if ( isNaN(data.right) ) {
              const $el = $(`${data.right}`);
              right =  eventManager.windowsWidth() - $el.offset().left;
          } else {
              right = data.right;
          }

          if ( isNaN(data.bottom) ) {
              const $el = $(`${data.bottom}`);
              bottom = eventManager.windowsHeight() - $el.offset().top;
          } else {
              bottom = data.bottom;
          }

          if ( isNaN(data.left) ) {
              const $el = $(`${data.left}`);
              left = $el.offset().left + $el.outerWidth();
          } else {
              left = data.left;
          }

          if(data.name) dataName = data.name;

          this.s.$overlay.css({'top': top, 'bottom': bottom, 'left': left, 'right': right});
          this.s.$overlay.addClass('active');
          this.s.$overlay.attr('data-name', dataName)
      }, this.s.delay);
  }

  close() {
      this.s.$overlay.removeClass('active');
      this.s.$overlay.attr('data-name', '')
      if( this.s.bodyOverflow ) eventManager.removeBodyOverflow();
  }

  set callback(fn) {
      this.s.callBack = fn;
  }

}
