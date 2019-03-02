class parallaxBackgroundClass {

  constructor() {
    if(!parallaxBackgroundClass.instance){
      this.$ = {
        $parallaxItem: $("*[data-conponent='m-comp--parallax-bg']"),
        itemArray: [],
        transformProperty: Modernizr.prefixed('transform')
      }
      parallaxBackgroundClass.instance = this;
    }
    return parallaxBackgroundClass.instance;
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
      this.parent = this.item.closest('.parallax-background__container')
      this.bgParentOffset = 0
      this.bgParentheight = 0
      this.yPos = 0
      this.distance = (this.item.attr('data-distance') || 8 )
      this.align = (this.item.attr('data-align') || 'top' )
      this.ease = (this.item.attr('data-ease') || 'linear' )
      this.height = 0
      this.calcParentOffset = () => {
        this.bgParentOffset = parseInt(this.parent.offset().top)
      }
      this.calcParentHeight = () => {
        this.bgParentheight = parseInt(this.parent.outerHeight())
      }
      this.calcHeight = () => {
        if( this.item.attr('data-height') ) {
          this.height = this.bgParentheight * this.item.attr('data-height')
        } else {
          this.height = this.bgParentheight * 2
        }
      }
    }

    this.$.$parallaxItem.each((index,element) => {
      const item=$(element)
      this.$.itemArray.push(new obj(item));
      this.$.itemArray[this.$.itemArray.length-1].calcParentHeight()
      this.$.itemArray[this.$.itemArray.length-1].calcHeight()
      this.$.itemArray[this.$.itemArray.length-1].calcParentOffset();
      this.$.itemArray[this.$.itemArray.length-1].item.css('height',this.$.itemArray[this.$.itemArray.length-1].height);
      this.$.itemArray[this.$.itemArray.length-1].distance = this.normalizeDistance(  this.$.itemArray[this.$.itemArray.length-1].distance)

      if(this.$.itemArray[this.$.itemArray.length-1].ease == 'smooth') {
        this.$.itemArray[this.$.itemArray.length-1].item.addClass('smooth-transition')
      }
    })
  }


  normalizeDistance(n) {
    let _n = n

    if(_n < 0 ) _n = .1
    if(_n > 10 ) _n = 10

    return 10 -_n
  }

  updateArray() {
    for (let index = 0; index < this.$.itemArray.length; index++) {
      const item = this.$.itemArray[index];

      item.calcParentHeight()
      item.calcHeight()
      item.calcParentOffset();
      item.item.css('height',item.height);
      this.executeParallax(item)
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

      if(element.ease == 'smooth') this.executeParallax(element)
    }
  }

  executeParallax(element) {
    // Esegui i colcoli solo se l'lemento è visibile nello schemro
    if( element.bgParentOffset+element.bgParentheight > eventManager.scrollTop()
      && element.bgParentOffset < eventManager.scrollTop() + eventManager.windowsHeight()) {

      if(element.align == 'top') {
        element.yPos = Math.floor(((eventManager.scrollTop() - element.bgParentOffset) / element.distance));
      }

      if(element.align == 'center') {
        element.yPos = Math.floor((((eventManager.scrollTop() + (eventManager.windowsHeight()/2 - element.bgParentheight/2)) - element.bgParentOffset) / element.distance));
        let gap = (element.height - element.bgParentheight)/2
        element.yPos -= gap
      }

      if(element.align == 'bottom') {
        element.yPos = Math.floor((((eventManager.scrollTop() + (eventManager.windowsHeight() - element.bgParentheight)) - element.bgParentOffset) / element.distance));
        let gap = (element.height - element.bgParentheight)
        element.yPos -= gap
      }

      let style = {};
      style[this.$.transformProperty] = `translate3d(0,0,0) translateY(${element.yPos}px)`;
      element.item.css(style);
    }
  }

  recalcPosition() {
      this.updateArray();
  }
}

const parallaxBackground = new parallaxBackgroundClass()
