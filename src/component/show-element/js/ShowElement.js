import { eventManager } from "../../../js/base/eventManager.js";

class showElementClass {

  constructor(data) {
    this.s = {
      $item: $("*[data-conponent='m-comp--toggleEl']"),
      itemArray: []
    }

    this.init();
    this.addHandler();
  }


  init(){
    function obj(item, pos, hide) {
      this.item = item;
      this.pos = pos;
      this.hide = hide;
      this.firstActive = false;
      this.useOtherPosition = (this.item.attr('data-otherPos') || null );
      this.OtherPositionGap = (this.item.attr('data-otherPosGap') || 0 );
      this.onlyOnce = item.attr('data-onlyOnce') || null;
      this.startClass = item.attr('data-startClass');
      this.gap = (parseInt(this.item.attr('data-gap')) || 100 );
      this.endClass = item.attr('data-endClass');
      this.calcPos = () => {
          if(this.useOtherPosition == null) {
            this.pos = parseInt(this.item.offset().top);
          } else {
            this.pos = parseInt($(this.useOtherPosition).offset().top) + parseInt(this.OtherPositionGap);
          }
      }
    }

    this.s.$item.each((index,element) => {
      const item = $(element);
      this.s.itemArray.push(new obj(item, item.offset().top, true));
    })
  }

  addHandler() {
    eventManager.push('scroll',this.checkPosition.bind(this))
    eventManager.push('resize',this.updateArray.bind(this))
    eventManager.push('load',this.updateArray.bind(this))
  }

  updateArray() {
    for (let index = 0; index < this.s.itemArray.length; index++) {
      const item = this.s.itemArray[index];

      item.calcPos();
    }
    this.checkPosition()
  }

  checkPosition() {
    for (let index = 0; index < this.s.itemArray.length; index++) {

      const element = this.s.itemArray[index],
            postion = element.pos - eventManager.windowsHeight() + element.gap;

      let isAble = true;
      if(element.onlyOnce != null && element.firstActive) isAble = false;

      if( postion < eventManager.scrollTop() && element.hide && isAble) {
        element.item.removeClass(element.startClass).addClass(element.endClass);
        element.hide=false;
        element.firstActive = true;
      } else if( postion >= eventManager.scrollTop() && !element.hide && isAble) {
        element.item.removeClass(element.endClass).addClass(element.startClass)
        element.hide = true
      }
    }
  }
}

export const showElement = new showElementClass()
