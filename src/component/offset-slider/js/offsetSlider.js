class offsetSliderClass {

  constructor(data) {
    this.$ = {
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
    this.$.$prevBtn.on('click', this.prevStep.bind(this))
    this.$.$nextBtn.on('click', this.nextStep.bind(this))

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
        this.advancement = (this.width - this.$.containerWidth) / parseInt(_this.$.step)
      }
    }

    this.$.$el.each((index, element) => {
      this.$.elArray.push(new obj($(element)));
    });
  }

  initSwipe() {
    const $cont = this.$.elArray[this.$.drivenElIndex].item;

    let isDown = false,
      startX = 0,
      endX = 0,
      val = 0,
      walk = 0;

    this.$.$container.on('mousedown touchstart', (e) => {
      this.$.$el.addClass('no-transition ');
      val = this.$.drivenTranslatePosition;

      if (e.type == 'mousedown') {
        startX = e.pageX;
      } else {
        const touch = e.touches[0];
        startX = touch.pageX;
      }
      isDown = true;
    });

    this.$.$container.on('mouseleave', () => {
      this.$.drivenTranslatePosition = val;
      isDown = false;
      this.updateIndex();
    });

    this.$.$container.on('mouseup touchend', () => {
      this.$.drivenTranslatePosition = val;
      isDown = false;
      this.updateIndex();
    });

    this.$.$container.on('mousemove touchmove', (e) => {
      if (!isDown) return;
      // e.preventDefault();

      if (e.type == 'mousemove') {
        endX = e.pageX
      } else {
        const touch = e.touches[0];
        endX = touch.pageX;
      }

      walk = startX - endX;
      val = this.$.drivenTranslatePosition - walk;

      let style = {};
      style[this.$.transformProperty] = `translate3d(0,0,0) translateX(${val}px)`;
      $cont.css(style);

      this.setOtherElPosition(val);
    });

  }

  setContainerWidth() {
    this.$.containerWidth = this.$.$container.outerWidth();
  }

  updateIndex() {

    for (let index = 0; index < this.$.step; index++) {
      let min = index * this.$.advancement,
        max = (index + 1) * this.$.advancement;

      this.$.$el.removeClass('no-transition ');

      if (-this.$.drivenTranslatePosition > min && -this.$.drivenTranslatePosition < max) {
        let half = min + (this.$.advancement/2);

        if (-this.$.drivenTranslatePosition >= half ) {
          this.$.activeStep = -(index + 1);
        } else {
          this.$.activeStep = -index;
        }

        this.setDriveElPosition();
        this.setOtherElPosition();
        break;

      } else if (this.$.drivenTranslatePosition > 0) {
        this.$.activeStep = 0;
        this.setDriveElPosition();
        this.setOtherElPosition();
        break;

      } else if (-this.$.drivenTranslatePosition > (this.$.step * this.$.advancement)) {
        this.$.activeStep = -this.$.step;
        this.setDriveElPosition();
        this.setOtherElPosition();
        break;
      }
    }
  }

  getDrivenIndex() {
    for (let index = 0; index < this.$.elArray.length; index++) {
      const el = this.$.elArray[index];

      if (el.driven) {
        this.$.drivenElIndex = index;
      }
    }
  }

  setWidth() {
    for (let index = 0; index < this.$.elArray.length; index++) {
      const el = this.$.elArray[index];
      el.item.css('width', `${el.width}px`);
    }
  }

  setAdvancement() {
    const el = this.$.elArray[this.$.drivenElIndex];
    this.$.advancement = (el.width - this.$.containerWidth) / parseInt(this.$.step);
  }

  prevStep() {
    if(this.$.activeStep >= 0)  return;

    this.$.activeStep++;
    this.$.$el.removeClass('no-transition ');
    this.setDriveElPosition();
    this.setOtherElPosition();
  }

  nextStep() {
    if(this.$.activeStep <= -this.$.step)  return;

    this.$.activeStep--;
    this.$.$el.removeClass('no-transition ');
    this.setDriveElPosition();
    this.setOtherElPosition();
  }

  setDriveElPosition() {
    const el = this.$.elArray[this.$.drivenElIndex],
      val = this.$.activeStep * this.$.advancement;

    let style = {};
    style[this.$.transformProperty] = `translate3d(0,0,0) translateX(${val}px)`;
    el.item.css(style);

    this.$.drivenTranslatePosition = val;
  }

  setOtherElPosition(val = null) {
    let walk = 0;

    if (val) {
      walk = val;
    } else {
      walk = this.$.drivenTranslatePosition;
    }

    for (let index = 0; index < this.$.elArray.length; index++) {
      const el = this.$.elArray[index],
        drivenEl = this.$.elArray[this.$.drivenElIndex];

      if (!el.driven) {
        const val = ((el.width - this.$.containerWidth) * walk) / (drivenEl.width - this.$.containerWidth);
        let style = {};
        style[this.$.transformProperty] = `translate3d(0,0,0) translateX(${val}px)`;
        el.item.css(style);
      }
    }
  }

}
