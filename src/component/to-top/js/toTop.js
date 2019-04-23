class totopClass {

  constructor() {
    if(!totopClass.instance){
      this.s = {
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
    this.s.$totop.on('click' , this.onClick.bind(this));
  }

  onClick(event) {
    event.preventDefault();
    $('html, body').animate({ scrollTop: 0 }, 400);
  }

  showArrow() {
    if (eventManager.scrollTop() >=  eventManager.windowsWidth() && this.s.hide) {
        this.s.$totop.addClass('visible');
        this.s.hide=false;
    } else if( eventManager.scrollTop() <  eventManager.windowsWidth() && !this.s.hide ) {
        this.s.$totop.removeClass('visible');
        this.s.hide=true;
    }
  }

}

const totop = new totopClass()
