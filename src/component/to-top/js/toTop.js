class totopClass {

  constructor() {
    if(!totopClass.instance){
      this.$ = {
        $totop: $('.to-top'),
        hide: true
      }
      totopClass.instance = this;
    }
    return totopClass.instance;
  }

  init(){
    this.addHandler();
    this.showArrow();
    eventManager.push('scroll', this.showArrow.bind(this));
  }

  addHandler() {
    this.$.$totop.on('click' , this.onClick.bind(this));
  }

  onClick(event) {
    event.preventDefault();
    $('html, body').animate({ scrollTop: 0 }, 400);
  }

  showArrow() {
    if (eventManager.scrollTop() >=  eventManager.windowsWidth() && this.$.hide) {
        this.$.$totop.addClass('visible');
        this.$.hide=false;
    } else if( eventManager.scrollTop() <  eventManager.windowsWidth() && !this.$.hide ) {
        this.$.$totop.removeClass('visible');
        this.$.hide=true;
    }
  }

}

const totop = new totopClass()
