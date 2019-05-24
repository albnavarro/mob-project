class accordionClass {

  constructor(data) {

      this.s = {
          $item: data.item,
          $btn: $(`${data.button}`),
          $target: $(`${data.target}`),
          breackpoint: data.breackpoint || 'x-small',
          queryType: data.queryType || 'min',
          multiple: typeof data.multiple === "undefined" ? false : data.multiple
      }
    this.init();
  }

  init() {
      this.s.$btn.on('click', this.openItem.bind(this))
  }

  openItem(e) {
      if(!mq[this.s.queryType](this.s.breackpoint)) return;

      const $btn = $(e.target),
            $target = $btn.closest(this.s.$item).find(this.s.$target);

      if ( !this.s.multiple ) {
          this.s.$btn.not($btn).removeClass('active');
          this.s.$target.not($target).slideUp();
      }

      if(!$btn.hasClass('active')) {
          $btn.addClass('active');
          $target.slideDown();
      } else {
          $btn.removeClass('active');
          $target.slideUp();
      }
  }

  closeAllItem() {
      this.s.$btn.removeClass('active');
      this.s.$target.slideUp();
  }
}
