import { eventManager } from "../../../js/base/eventManager.js";

class showElementClass {

  constructor(data) {
    this.s = {
      $item: $("*[data-conponent='m-comp--toggleEl']"),
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
      this.firstActive = false;
      this.onlyOnce = item.attr('data-onlyOnce') || false;
      this.startClass = item.attr('data-startClass');
      this.endClass = item.attr('data-endClass');
      this.calcPos = () => {
          this.pos=this.item.offset().top;
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
    this.s.entryGap = eventManager.windowsHeight()/6
    this.checkPosition()
  }

  checkPosition() {
    for (let index = 0; index < this.s.itemArray.length; index++) {

      const element = this.s.itemArray[index],
            postion = element.pos - eventManager.windowsHeight() + this.s.entryGap;

      let isAble = true;
      if(element.onlyOnce && element.firstActive) isAble = false;

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
