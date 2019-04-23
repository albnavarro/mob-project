class offsetSliderClass {

  constructor(data) {
    this.s = {
      $container: $(`${data.container}`),
      containerWidth: 0,
      $el: $(`${data.container}`).find('.offset-slider__item'),
      $prevBtn: $(`${data.container}`).find('.offset-slider__prev'),
      $nextBtn: $(`${data.container}`).find('.offset-slider__next'),
      step: data.step || 5,
      drivenElIndex: 0,
      drivenTranslatePosition: 0,
      advancement: 0,
      activeStep: 0,
      elArray: [],
      transformProperty: Modernizr.prefixed('transform'),
    }
    this.init();
  }

  init() {
    this.setData();
    this.getDrivenIndex();
    this.setWidth();
    this.setContainerWidth();
    this.setAdvancement();
    this.initSwipe();
    this.s.$prevBtn.on('click', this.prevStep.bind(this))
    this.s.$nextBtn.on('click', this.nextStep.bind(this))

    eventManager.push('resize', this.setAdvancement.bind(this));
    eventManager.push('resize', this.setContainerWidth.bind(this));
    eventManager.push('resize', this.setDriveElPosition.bind(this));
    eventManager.push('resize', this.setOtherElPosition.bind(this));
  }


  setData() {
    const _this = this;

    function obj(item) {
      this.item = item;
      this.width = item.attr('data-width');
      this.advancement = 0;
      this.driven = (item.attr('data-driven') === 'true') || false;
      this.calcAdvancement = () => {
        this.advancement = (this.width - this.s.containerWidth) / parseInt(_this.s.step)
      }
    }

    this.s.$el.each((index, element) => {
      this.s.elArray.push(new obj($(element)));
    });
  }

  initSwipe() {
    const $cont = this.s.elArray[this.s.drivenElIndex].item;

    let isDown = false,
      startX = 0,
      endX = 0,
      val = 0,
      walk = 0;

    this.s.$container.on('mousedown touchstart', (e) => {
      this.s.$el.addClass('no-transition ');
      val = this.s.drivenTranslatePosition;

      if (e.type == 'mousedown') {
        startX = e.pageX;
      } else {
        const touch = e.touches[0];
        startX = touch.pageX;
      }
      isDown = true;
    });

    this.s.$container.on('mouseleave', () => {
      this.s.drivenTranslatePosition = val;
      isDown = false;
      this.updateIndex();
    });

    this.s.$container.on('mouseup touchend', () => {
      this.s.drivenTranslatePosition = val;
      isDown = false;
      this.updateIndex();
    });

    this.s.$container.on('mousemove touchmove', (e) => {
      if (!isDown) return;
      // e.preventDefault();

      if (e.type == 'mousemove') {
        endX = e.pageX
      } else {
        const touch = e.touches[0];
        endX = touch.pageX;
      }

      walk = startX - endX;
      val = this.s.drivenTranslatePosition - walk;

      let style = {};
      style[this.s.transformProperty] = `translate3d(0,0,0) translateX(${val}px)`;
      $cont.css(style);

      this.setOtherElPosition(val);
    });

  }

  setContainerWidth() {
    this.s.containerWidth = this.s.$container.outerWidth();
  }

  updateIndex() {

    for (let index = 0; index < this.s.step; index++) {
      let min = index * this.s.advancement,
        max = (index + 1) * this.s.advancement;

      this.s.$el.removeClass('no-transition ');

      if (-this.s.drivenTranslatePosition > min && -this.s.drivenTranslatePosition < max) {
        let half = min + (this.s.advancement/2);

        if (-this.s.drivenTranslatePosition >= half ) {
          this.s.activeStep = -(index + 1);
        } else {
          this.s.activeStep = -index;
        }

        this.setDriveElPosition();
        this.setOtherElPosition();
        break;

      } else if (this.s.drivenTranslatePosition > 0) {
        this.s.activeStep = 0;
        this.setDriveElPosition();
        this.setOtherElPosition();
        break;

      } else if (-this.s.drivenTranslatePosition > (this.s.step * this.s.advancement)) {
        this.s.activeStep = -this.s.step;
        this.setDriveElPosition();
        this.setOtherElPosition();
        break;
      }
    }
  }

  getDrivenIndex() {
    for (let index = 0; index < this.s.elArray.length; index++) {
      const el = this.s.elArray[index];

      if (el.driven) {
        this.s.drivenElIndex = index;
      }
    }
  }

  setWidth() {
    for (let index = 0; index < this.s.elArray.length; index++) {
      const el = this.s.elArray[index];
      el.item.css('width', `${el.width}px`);
    }
  }

  setAdvancement() {
    const el = this.s.elArray[this.s.drivenElIndex];
    this.s.advancement = (el.width - this.s.containerWidth) / parseInt(this.s.step);
  }

  prevStep() {
    if(this.s.activeStep >= 0)  return;

    this.s.activeStep++;
    this.s.$el.removeClass('no-transition ');
    this.setDriveElPosition();
    this.setOtherElPosition();
  }

  nextStep() {
    if(this.s.activeStep <= -this.s.step)  return;

    this.s.activeStep--;
    this.s.$el.removeClass('no-transition ');
    this.setDriveElPosition();
    this.setOtherElPosition();
  }

  setDriveElPosition() {
    const el = this.s.elArray[this.s.drivenElIndex],
      val = this.s.activeStep * this.s.advancement;

    let style = {};
    style[this.s.transformProperty] = `translate3d(0,0,0) translateX(${val}px)`;
    el.item.css(style);

    this.s.drivenTranslatePosition = val;
  }

  setOtherElPosition(val = null) {
    let walk = 0;

    if (val) {
      walk = val;
    } else {
      walk = this.s.drivenTranslatePosition;
    }

    for (let index = 0; index < this.s.elArray.length; index++) {
      const el = this.s.elArray[index],
        drivenEl = this.s.elArray[this.s.drivenElIndex];

      if (!el.driven) {
        const val = ((el.width - this.s.containerWidth) * walk) / (drivenEl.width - this.s.containerWidth);
        let style = {};
        style[this.s.transformProperty] = `translate3d(0,0,0) translateX(${val}px)`;
        el.item.css(style);
      }
    }
  }

}
