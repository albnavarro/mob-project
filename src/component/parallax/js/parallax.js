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
    eventManager.push('scroll', this.linearParallax.bind(this));
    eventManager.push('scrollThrottle', this.smoothParallax.bind(this));
    eventManager.push('resize', this.updateArray.bind(this));
    eventManager.push('load', this.buildData.bind(this));
  }

  buildData(){
    function obj(item) {
      this.item = item
      this.container = item.closest('.parallax__container')
      this.offset = 0
      this.diff = 0
      this.height = 0
      this.velocity = (this.item.attr('data-velocity') || 2 )
      this.align = (this.item.attr('data-align') || 'top' )
      this.ease = (this.item.attr('data-ease') || 'linear' )
      this.direction = (this.item.attr('data-direction') || 'vertical' )
      this.calcOffset = () => {
        this.offset = parseInt(this.container.offset().top)
      }
      this.calcHeight = () => {
        this.height = parseInt(this.container.outerHeight())
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

    for( let element of this.$.itemArray ) {
      this.executeParallax(element)
    }
  }

  updateArray() {
    for( let element of this.$.itemArray ) {
      element.calcOffset()
      element.calcHeight();
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
    if( element.offset + element.height > eventManager.scrollTop()
      && element.offset < eventManager.scrollTop() + eventManager.windowsHeight()) {

      switch(element.align) {
        case 'start':
          element.diff = Math.floor(eventManager.scrollTop() / element.velocity);
          break;

        case 'top':
          element.diff = Math.floor(((eventManager.scrollTop() - element.offset) / element.velocity));
          break;

        case 'center':
          element.diff = Math.floor((((eventManager.scrollTop() + (eventManager.windowsHeight()/2 - element.height/2)) - element.offset) / element.velocity));
          break;

        case 'bottom':
          element.diff = Math.floor((((eventManager.scrollTop() + (eventManager.windowsHeight() - element.height)) - element.offset) / element.velocity));
          break;

        case 'end':
          element.diff = -Math.floor((eventManager.documentHeight() - (eventManager.scrollTop() + eventManager.windowsHeight())) / element.velocity);
          break;
      }


      let style = {};

      switch(element.direction ) {
        case 'vertical':
          style[this.$.transformProperty] = `translate3d(0,0,0) translateY(${element.diff}px)`;
          break;

        case 'horizontal':
          style[this.$.transformProperty] = `translate3d(0,0,0) translateX(${element.diff}px)`;
          break;

        case 'rotate':
          style[this.$.transformProperty] = `translate3d(0,0,0) rotate(${element.diff}deg)`;
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
