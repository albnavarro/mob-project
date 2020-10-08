class sectionClass {

    constructor() {
        this.s = {
            $sectionContainer: $("*[data-conponent='m-comp--section']"),
            $footer: {},
            $section: {},
            sectionArray: [],
            footerPosTop: 0,
            trasitionOn: false,
            forceScroll: true,
            prevId: 0
        }
    }

    init() {
        if(this.s.$sectionContainer.length == 0) return;

        this.s.$section = this.s.$sectionContainer.find('.m-section__item');
        this.s.$footer = $(this.s.$sectionContainer.attr('data-footer'));

        function obj(item, pos, height, id , hide) {
          this.item = item;
          this.pos = pos;
          this.hide = hide;
          this.height = height;
          this.id = id;
          this.calcPos = () => {
              this.pos=this.item.offset().top;
          };
          this.calcHeight = () => {
              this.height=this.item.outerHeight();
          };
        }

        this.s.$section.each((index,element) => {
          const item = $(element);
          this.s.sectionArray.push(new obj(
              item,
              item.offset().top,
              item.outerHeight(),
              index,
              true )
           );
        })

        this.s.footerPosTop = this.s.$footer.offset().top;
        this.addHandler();
    }

    addHandler() {
      eventManager.push('load',this.slideTo.bind(this))
      eventManager.push('resize',this.updateArray.bind(this))
      eventManager.push('scrollEnd',this.slideTo.bind(this))
    }

    updateArray() {
      for (let index = 0; index < this.s.sectionArray.length; index++) {
        const item = this.s.sectionArray[index];
        item.calcPos();
        item.calcHeight();
      }

      this.s.footerPosTop = this.s.$footer.offset().top;
    }


    slideTo() {
        if(this.s.trasitionOn) return;

        if(eventManager.scrollTop() < this.s.$sectionContainer.offset().top) {
            this.setDataAttr(0);
            this.s.prevId = 0
            return;
        } else if( this.s.footerPosTop < eventManager.scrollTop() + eventManager.windowsHeight()) {
            this.setDataAttr(this.s.sectionArray.length - 1);
            this.s.prevId = this.s.sectionArray.length - 1
            return;
        }

        for (let index = 0; index < this.s.sectionArray.length; index++) {
            const element = this.s.sectionArray[index];
            let postion = element.pos - eventManager.windowsHeight();
            let id = element.id;

            if( eventManager.scrollDirection() == 'DOWN') {
                if( postion  < eventManager.scrollTop()
                && postion + element.height > eventManager.scrollTop()) {

                    if(this.s.forceScroll &&
                       id - this.s.prevId >= 2 &&
                       id - this.s.prevId < 3) {
                            id --;
                            const element = this.s.sectionArray[index - 1];
                            postion = element.pos - eventManager.windowsHeight();
                    }

                    this.s.trasitionOn = true;
                    $([document.documentElement, document.body]).animate({
                        scrollTop: postion + element.height
                    }, 500, () => {
                        this.s.trasitionOn = false;
                        this.setDataAttr(id)
                        this.s.prevId = id
                    });
                }
            } else {
                if( postion + element.height > eventManager.scrollTop()
                && postion + element.height < eventManager.scrollTop() + eventManager.windowsHeight()) {
                    this.s.trasitionOn = true;
                    $([document.documentElement, document.body]).animate({
                        scrollTop: postion
                    }, 500, () => {
                        this.s.trasitionOn = false;
                        this.setDataAttr(id - 1)
                        this.s.prevId = id - 1
                    });
                }
            }
        }
    }

    setDataAttr(id) {
        this.s.$sectionContainer.attr('data-section-id', id)
    }


}

const section = new sectionClass()
