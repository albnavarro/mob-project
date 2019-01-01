class parallaxClass {

  constructor() {
    if(!parallaxClass.instance){
      this.$ = {
        $parallaxItem: $('.parallax__item'),
        itemArray: [],
        transformProperty: Modernizr.prefixed('transform')
      }
      parallaxClass.instance = this;
    }
    return parallaxClass.instance;
  }

  init(){
    this.buildData();
    eventManager.push('scroll', this.linearParallax.bind(this));
    eventManager.push('scrollThrottle', this.smoothParallax.bind(this));
    eventManager.push('resize', this.updateArray.bind(this));
    eventManager.push('load', this.updateArray.bind(this));
  }

  buildData(){
    function obj(item) {
      this.item = item;
      this.offset = 0
      this.yPos = 0
      this.height = 0
      this.velocity = (this.item.attr('data-velocity') || 2 )
      this.align = (this.item.attr('data-align') || 'top' )
      this.ease = (this.item.attr('data-ease') || 'linear' )
      this.direction = (this.item.attr('data-direction') || 'vertical' )
      this.calcOffset = () => {
        this.offset = parseInt(this.item.offset().top)
      }
      this.calcHeight = () => {
        this.height = parseInt(this.item.outerHeight())
      }
    }

    this.$.$parallaxItem.each((index,element) => {
      const item=$(element)
      this.$.itemArray.push(new obj(item));
      this.$.itemArray[this.$.itemArray.length-1].calcOffset()
      this.$.itemArray[this.$.itemArray.length-1].calcHeight()

      if(this.$.itemArray[this.$.itemArray.length-1].ease == 'smooth') {
        this.$.itemArray[this.$.itemArray.length-1].item.addClass('smooth-transition')
      }
    })
  }

  updateArray() {
    for( let item of this.$.itemArray ) {
      item.calcOffset()
      item.calcHeight();
    }

    // fitImages.rescanImages()
    for( let element of this.$.itemArray ) {
      this.executeParallax(element)
    }
  }

  linearParallax() {
    for( let element of this.$.itemArray ) {
      if(element.ease == 'linear') this.executeParallax(element)
    }
  }

  smoothParallax() {
    for( let element of this.$.itemArray ) {
        if(element.ease == 'smooth') this.executeParallax(element)
    }
  }

  executeParallax(element) {
    // Esegui i colcoli solo se l'lemento è visibile nello schemro
    // valutare la possibilita di eliminarlo
    if( element.offset + element.height > eventManager.scrollTop()
      && element.offset < eventManager.scrollTop() + eventManager.windowsHeight()) {

      switch(element.align) {
        case 'start':
          element.yPos = Math.floor(eventManager.scrollTop() / element.velocity);
          break;

        case 'top':
          element.yPos = Math.floor(((eventManager.scrollTop() - element.offset) / element.velocity));
          break;

        case 'center':
          element.yPos = Math.floor((((eventManager.scrollTop() + (eventManager.windowsHeight()/2 - element.height/2)) - element.offset) / element.velocity));
          break;

        case 'bottom':
          element.yPos = Math.floor((((eventManager.scrollTop() + (eventManager.windowsHeight() - element.height)) - element.offset) / element.velocity));
          break;
      }


      let style = {};

      switch(element.direction ) {
        case 'vertical':
          style[this.$.transformProperty] = `translate3d(0,0,0) translateY(${element.yPos}px)`;
          break;

        case 'horizontal':
          style[this.$.transformProperty] = `translate3d(0,0,0) translateX(${element.yPos}px)`;
          break;

        case 'rotate':
          style[this.$.transformProperty] = `translate3d(0,0,0) rotate(${element.yPos}deg)`;
          break;

      }

      element.item.css(style);
    }
  }

  recalcPosition() {
      this.updateArray();
  }
}

const parallax = new parallaxClass()
