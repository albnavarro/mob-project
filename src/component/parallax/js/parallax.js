class parallaxClass {

  constructor() {
    if(!parallaxClass.instance){
      this.$ = {
        $parallaxItem: $('.parallax__item'),
        itemArray: [],
        transformProperty: Modernizr.prefixed('transform'),

        // SMOOTH JS
        smoothCss: 'CSS',
        smoothJs: 'JS',
        smoothType: '',
        duration: 1000,
        req: null
      }
      parallaxClass.instance = this;
    }
    return parallaxClass.instance;
  }




  init(smoothType = this.$.smoothCss){
    let _smoothType = smoothType

    this.$.smoothType = _smoothType
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
      this.startValue = 0
      this.height = 0
      this.distance = (this.item.attr('data-distance') || 2 )
      this.jsVelocity = (this.item.attr('data-jsVelocity') || 20 )
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

      if(this.$.itemArray[this.$.itemArray.length-1].ease == 'smooth' &&  this.$.smoothType == this.$.smoothCss) {
          this.$.itemArray[this.$.itemArray.length-1].item.addClass('smooth-transition')
      }
    })

    for( let element of this.$.itemArray ) {
      this.executeParallax(element)
    }

    if (this.$.smoothType == this.$.smoothJs) {
      if( this.$.req ) cancelAnimationFrame(this.$.req);
      this.$.req = requestAnimationFrame(this.onReuqestAnim.bind(this))
    }
  }




  updateArray() {
    for( let element of this.$.itemArray ) {
      element.calcOffset()
      element.calcHeight();
      this.executeParallax(element)
    }

    if (this.$.smoothType == this.$.smoothJs) {
      if( this.$.req ) cancelAnimationFrame(this.$.req);
      this.$.req = requestAnimationFrame(this.onReuqestAnim.bind(this))
    }
  }




  linearParallax() {
    for( let element of this.$.itemArray ) {
      if(element.ease == 'linear') this.executeParallax(element)
    }
  }




  smoothParallax() {
    for( let element of this.$.itemArray ) {

      // Se è un item con ease smooth in css calcolo ivalori e li applico
      if(element.ease == 'smooth' && this.$.smoothType == this.$.smoothCss) {
        this.executeParallax(element)
      }

      // Se è un item con ease smotth in js calcolo ivalori e non li applico
      if (element.ease == 'smooth' && this.$.smoothType == this.$.smoothJs) {
        this.executeParallax(element,false)
      }
    }

    // Se uso lo smooth js faccio partire il loop di RAF
    // Al suo interno verranno filtrati tutti gli elementi senza easing
    if (this.$.smoothType == this.$.smoothJs) {
      if( this.$.req ) cancelAnimationFrame(this.$.req);
      this.$.req = requestAnimationFrame(this.onReuqestAnim.bind(this))
    }
  }


  easing (n){
    n *= 2;
    if (n < 1) return 0.5 * n * n;
    return - 0.5 * (--n * (n - 2) - 1);
  }

  // RAF
  onReuqestAnim(timeStamp) {
    let _this = this,
        _timeStamp = parseInt(timeStamp),
        start = _timeStamp,
        end = start + this.$.duration

    function draw(timeStamp) {
      let _timeStamp = parseInt(timeStamp)

      for( let element of _this.$.itemArray ) {
        ((element) => {
           if(element.ease == 'linear') return;

            let partial = _this.easing(((_timeStamp - start) / _this.$.duration)),
                val = parseInt(element.startValue + (element.diff - element.startValue) / element.jsVelocity * partial),
                x = parseInt((element.diff - element.startValue) / element.jsVelocity);

            val +=  Math.floor(x);
            element.startValue = val;
            element.item.css(_this.setStyle(element,val));

        })(element)
      }

      if(_timeStamp > end) return;

      if( _this.$.req ) cancelAnimationFrame(_this.$.req);
      _this.$.req = requestAnimationFrame(draw)
    }

    draw(timeStamp)
  }



  executeParallax(element,applyStyle = true) {

    // Esegui i colcoli solo se l'lemento è visibile nello schemro
    if( element.offset + element.height > eventManager.scrollTop()
      && element.offset < eventManager.scrollTop() + eventManager.windowsHeight()) {

      switch(element.align) {
        case 'start':
          element.diff = Math.floor(eventManager.scrollTop() / element.distance);
          break;

        case 'top':
          element.diff = Math.floor(((eventManager.scrollTop() - element.offset) / element.distance));
          break;

        case 'center':
          element.diff = Math.floor((((eventManager.scrollTop() + (eventManager.windowsHeight()/2 - element.height/2)) - element.offset) / element.distance));
          break;

        case 'bottom':
          element.diff = Math.floor((((eventManager.scrollTop() + (eventManager.windowsHeight() - element.height)) - element.offset) / element.distance));
          break;

        case 'end':
          element.diff = -Math.floor((eventManager.documentHeight() - (eventManager.scrollTop() + eventManager.windowsHeight())) / element.distance);
          break;
      }

      if (!applyStyle) return;

      element.item.css(this.setStyle(element,element.diff));
    }
  }



  setStyle(element,val) {
    let style = {};

    switch(element.direction ) {
      case 'vertical':
        style[this.$.transformProperty] = `translate3d(0,0,0) translateY(${val}px)`;
        break;

      case 'horizontal':
        style[this.$.transformProperty] = `translate3d(0,0,0) translateX(${val}px)`;
        break;

      case 'rotate':
        style[this.$.transformProperty] = `translate3d(0,0,0) rotate(${val}deg)`;
        break;
    }

    return style
  }



  recalcPosition() {
      this.updateArray();
  }
}

const parallax = new parallaxClass()
