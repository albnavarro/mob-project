class parallaxClass {

  constructor() {
    if(!parallaxClass.instance){
      this.$ = {
        $parallaxItem: $("*[data-conponent='m-comp--parallax']"),
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
      this.endValue = 0
      this.startValue = 0
      this.height = 0
      // 1 - 10 , 10 = more distance,  1 = less distance
      this.distance = (this.item.attr('data-distance') || 8 )
      // 1 - 10,  10 = quick, 1 = slow
      this.jsVelocity = (this.item.attr('data-jsVelocity') || 8 )
      // true - false
      this.reverse = (this.item.attr('data-reverse') || false )
      // start - top -center - bottom - end
      this.align = (this.item.attr('data-align') || 'top' )
      // linear - smooth
      this.ease = (this.item.attr('data-ease') || 'linear' )
      // vertical - horizontal - rotate
      this.propierties = (this.item.attr('data-propierties') || 'vertical' )
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
      this.$.itemArray[this.$.itemArray.length-1].distance = this.normalizeDistance(  this.$.itemArray[this.$.itemArray.length-1].distance)
      this.$.itemArray[this.$.itemArray.length-1].jsVelocity = this.normalizeVelocity(  this.$.itemArray[this.$.itemArray.length-1].jsVelocity)

      if(this.$.itemArray[this.$.itemArray.length-1].ease == 'smooth' &&  this.$.smoothType == this.$.smoothCss) {
          this.$.itemArray[this.$.itemArray.length-1].item.addClass('smooth-transition')
      }
    })

    for (let index = 0; index < this.$.itemArray.length; index++) {
      const element = this.$.itemArray[index];

      this.executeParallax(element)
    }

    if (this.$.smoothType == this.$.smoothJs) {
      if( this.$.req ) cancelAnimationFrame(this.$.req);
      this.$.req = requestAnimationFrame(this.onReuqestAnim.bind(this))
    }
  }


  normalizeDistance(n) {
    let _n = n

    if(_n < 0 ) _n = .1
    if(_n > 10 ) _n = 10

    return 10 -_n
  }

  normalizeVelocity(n) {
    let _n = n

    if(_n < 1 ) _n = 1
    if(_n > 10 ) _n = 10

    return (10 - _n) * 10
  }

  updateArray() {
    for (let index = 0; index < this.$.itemArray.length; index++) {
      const element = this.$.itemArray[index];

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
    for (let index = 0; index < this.$.itemArray.length; index++) {
      const element = this.$.itemArray[index];
      if(element.ease == 'linear') this.executeParallax(element)
    }
  }




  smoothParallax() {
    for (let index = 0; index < this.$.itemArray.length; index++) {
      const element = this.$.itemArray[index];

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
    const _timeStamp = parseInt(timeStamp),
        start = _timeStamp,
        end = start + this.$.duration

    const draw = (timeStamp) => {
      const _timeStamp = parseInt(timeStamp)

      for (let index = 0; index < this.$.itemArray.length; index++) {
        const element = this.$.itemArray[index];

           if(element.ease != 'linear') {
             // partial: valore tra o e 1 per dare un minimo di easing
             const ease = this.easing(((_timeStamp - start) / this.$.duration)),
                   diffValue = (element.endValue - element.startValue),
                   partial = parseInt(diffValue / element.jsVelocity),
                   val = parseInt(element.startValue + diffValue / element.jsVelocity * ease) + Math.floor(partial);

             element.startValue = val;
             element.item.css(this.setStyle(element,val));
           }
      }

      if(_timeStamp > end) return;

      if( this.$.req ) cancelAnimationFrame(this.$.req);
      this.$.req = requestAnimationFrame(draw)
    }

    draw(timeStamp)
  }



  executeParallax(element,applyStyle = true) {

    // Esegui i colcoli solo se l'lemento è visibile nello schemro
    if( element.offset + element.height > eventManager.scrollTop()
      && element.offset < eventManager.scrollTop() + eventManager.windowsHeight()) {

      switch(element.align) {
        case 'start':
          element.endValue = Math.floor(eventManager.scrollTop() / element.distance);
          break;

        case 'top':
          element.endValue = Math.floor(((eventManager.scrollTop() - element.offset) / element.distance));
          break;

        case 'center':
          element.endValue = Math.floor((((eventManager.scrollTop() + (eventManager.windowsHeight()/2 - element.height/2)) - element.offset) / element.distance));
          break;

        case 'bottom':
          element.endValue = Math.floor((((eventManager.scrollTop() + (eventManager.windowsHeight() - element.height)) - element.offset) / element.distance));
          break;

        case 'end':
          element.endValue = -Math.floor((eventManager.documentHeight() - (eventManager.scrollTop() + eventManager.windowsHeight())) / element.distance);
          break;
      }

      if (!applyStyle) return;

      element.item.css(this.setStyle(element,element.endValue));
    }
  }



  setStyle(element,val) {
    let style = {};

    if (element.reverse) val = -val;

    switch(element.propierties ) {
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
