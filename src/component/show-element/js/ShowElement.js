class showElementClass {

  constructor(data) {
    this.$ = {
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
      this.startClass = item.attr('data-startClass');
      this.endClass = item.attr('data-endClass');
      this.calcPos = () => {
          this.pos=this.item.offset().top;
      }
    }

    this.$.$item.each((index,element) => {
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
    for (let index = 0; index < this.$.itemArray.length; index++) {
      const item = this.$.itemArray[index];

      item.calcPos();
    }
    this.$.entryGap = eventManager.windowsHeight()/6
    this.checkPosition()
  }

  checkPosition() {
    for (let index = 0; index < this.$.itemArray.length; index++) {
      const element = this.$.itemArray[index],
            postion = element.pos - eventManager.windowsHeight() + this.$.entryGap;

      if( postion < eventManager.scrollTop() && element.hide) {
        element.item.removeClass(element.startClass).addClass(element.endClass);
        element.hide=false
      } else if( postion >= eventManager.scrollTop() && !element.hide) {
        element.item.removeClass(element.endClass).addClass(element.startClass)
        element.hide = true
      }
    }
  }
}

const showElement = new showElementClass()
