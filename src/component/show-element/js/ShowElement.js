class showElementClass {

  constructor(data) {
    this.$ = {
      $box: data.item,
      onClass:data.onClass,
      offClass:data.offClass,
      itemArray: [],
      entryGap: eventManager.windowsHeight()/6
    }

    this.init();
    this.addHandler();
  }


  init(){
    function obj(item, pos, hide) {
      this.item = item;
      this.pos = pos;
      this.hide = hide;
      this.calcPos = () => {
          this.pos=this.item.offset().top;
      }
    }

    this.$.$box.each((index,element) => {
      const item = $(element);
      this.$.itemArray.push(new obj(item, item.offset().top, true));
    })
  }

  addHandler() {
    eventManager.push('scroll',this.checkPosition.bind(this))
    eventManager.push('resize',this.updateArray.bind(this))
    eventManager.push('load',this.updateArray.bind(this))
  }

  updateArray() {
    for( let item of this.$.itemArray ) {
      item.calcPos();
    }
    this.$.entryGap = eventManager.windowsHeight()/6
    this.checkPosition()
  }

  checkPosition() {
    for( let element of this.$.itemArray ) {
      const postion = element.pos - eventManager.windowsHeight() + this.$.entryGap;

      if( postion < eventManager.scrollTop() && element.hide) {
        element.item.removeClass(this.$.offClass).addClass(this.$.onClass);
        element.hide=false
      } else if( postion >= eventManager.scrollTop() && !element.hide) {
        element.item.removeClass(this.$.onClass).addClass(this.$.offClass)
        element.hide = true
      }
    }
  }

}
