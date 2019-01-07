class menuClass {

  constructor(data) {
    this.$ = {
      $menu: $(`${data.menu}`),
      $toggle: $(`${data.toggle}`),
      direction: data.direction || 'horizontal',
      sideDirection: data.sideDirection || 'left',
      $itemHasChildren: {},
      $firstLevelItem: {},
      $allSubmenu: {},
      $body: $('body'),
      subMenuWidth: 0,
      menuArr: [],
      menuIsOpen: false,
      lastWindowsWidth: 0
    }
    this.init()
  }

  init() {
    this.$.$itemHasChildren = this.$.$menu.find('.menu-item-has-children')
    this.$.$firstLevelItem = this.$.$menu.find('.main-menu > .menu-item-has-children > .sub-menu')
    this.$.$allSubmenu = this.$.$menu.find('.sub-menu')

    if (this.$.direction == 'vertical') {
      this.$.$menu.addClass('nav--vertical')

      if(this.$.sideDirection == 'left') {
        this.$.$menu.addClass('nav--vertical--left')
      } else {
        this.$.$menu.addClass('nav--vertical--right')
      }
    } else {
      this.$.$menu.addClass('nav--horizontal')
    }

    this.$.lastWindowsWidth = eventManager.windowsWidth();
    this.getSubmenuWidth();
    this.addArrow();
    this.setData();
    this.resizeMenu();
    this.addHandler();
    eventManager.push('resize', this.getSubmenuWidth.bind(this));
    eventManager.push('resize', this.resizeMenu.bind(this));

    if (this.$.direction == 'horizontal') {
      this.SetPosition();
      eventManager.push('resize', this.SetPosition.bind(this));
    }
  }

  getSubmenuWidth(){
    this.$.subMenuWidth = this.$.$allSubmenu.outerWidth();
  }

  setData() {
    function obj(item) {
      let maxLevel = 0;
      this.item = item;
      this.submenu = this.item.find('.sub-menu');
      this.parentItem = this.item.parents('.menu-item-has-children');
      this.parentItemPos = 0;
      this.parentItemWidth = 0;
      this.submenu.each((index,element) => {
        const numSubmenuParents = $(element).parents('.sub-menu').length;
        if( numSubmenuParents > maxLevel) {
          maxLevel = numSubmenuParents;
        }
      });
      this.maxLevel = maxLevel;
      this.totalWidth = 0;
    }

    this.$.$firstLevelItem.each((index,element) => {
      this.$.menuArr.push(new obj($(element)));
    });
  }

  addArrow() {
    // DESKTOP TOUCH SHOW SUBMENU
    const $arrow=$("<div class='arrow-submenu'></div>");
    this.$.$itemHasChildren.prepend($arrow);
  }

  addHandler() {
   this.$.$body.on('click' , this.bodyOnCLick.bind(this));
   this.$.$itemHasChildren.find('.arrow-submenu').on('click', this.arrowOnClick.bind(this));
   this.$.$toggle.on('click', this.toggleOnCLick.bind(this));
  }

  bodyOnCLick(evt) {
    if ( !$(evt.target).parents('.nav-wrap').length ) {
      this.closeSubmenu();
      if( mq.max('tablet') ) {
        this.closeMainMenu();
      }
    }
  }

  toggleOnCLick() {
    if (this.$.$menu.hasClass('menu-on')){
      this.closeMainMenu();
    } else {
      this.openMainMenu();
    }
  }

  arrowOnClick(event) {
    const $target = $(event.target),
          $submenu=$target.siblings('.sub-menu'),
          $item = $target.parent('.menu-item'),
          $parentsSubmenu = $item.parents('.sub-menu'),
          $parentsArrow = $parentsSubmenu.siblings('.arrow-submenu');

    if( Modernizr.touchevents || mq.max('tablet')) {
     this.$.$allSubmenu.not($parentsSubmenu).not($submenu).removeClass('active');
     this.$.$itemHasChildren.find('.arrow-submenu').not($target).not($parentsArrow).removeClass('arrow-selected');

     if( mq.max('tablet') ) {
       this.$.$allSubmenu.not($parentsSubmenu).not($submenu).slideUp();
     }

     if( $submenu.hasClass('active') ) {
       $submenu.removeClass('active')
       $target.removeClass('arrow-selected')
       if( mq.max('tablet') ) {
         $submenu.slideUp(() => {$(window).resize()})
       }
     } else {
       $submenu.addClass('active')
       $target.addClass('arrow-selected')
       if( mq.max('tablet') ) {
         $submenu.slideDown(() => {$(window).resize()})
       }
     }
    }
  }

  SetPosition(){
    if( mq.min('tablet') ) {
      for (let index = 0; index < this.$.menuArr.length; index++) {
        const item = this.$.menuArr[index];

        item.parentItemPos = item.parentItem.position().left;
        item.parentItemWidth = item.parentItem.outerWidth();
        item.totalWidth = item.parentItemPos + item.parentItemWidth + (item.maxLevel * this.$.subMenuWidth);

        if( item.totalWidth > eventManager.windowsWidth() ) {
          item.item.css('right' , 0).css('left' , 'auto');
          item.submenu.css('right' , '100%').css('left' , 'auto');
        } else {
          item.item.css('left' , '0').css('riht' , 'auto');
          item.submenu.css('left' , '100%').css('right' , 'auto');
        }
      }

    }
  }

  closeMainMenu(immediate) {
    if( immediate ){
      this.$.$menu.slideUp(0,() => {$(window).resize()})
    } else {
      this.$.$menu.slideUp(() => {$(window).resize()})
    }
    this.$.$menu.removeClass('menu-on')
    this.$.$toggle.removeClass('open')
    this.$.menuIsOpen = false
  }

  openMainMenu() {
    this.$.$menu.slideDown(() => {$(window).resize()})
    this.$.$menu.addClass('menu-on')
    this.$.$toggle.addClass('open')
    this.$.menuIsOpen = true
  }

  closeSubmenu() {
    this.$.$allSubmenu.removeClass('active');
    this.$.$itemHasChildren.find('.arrow-submenu').removeClass('arrow-selected');

    if( mq.min('tablet') ) {
      this.$.$allSubmenu.css('display' , '');
    } else {
      this.$.$allSubmenu.slideUp(() => {$(window).resize()});
    }
  }

  resizeMenu() {
    if( this.$.lastWindowsWidth != eventManager.windowsWidth() ) {
      this.closeSubmenu();
      this.closeMainMenu(true);
    }
    this.$.lastWindowsWidth = eventManager.windowsWidth();
  }

  CloseOnScroll() {
    if( mq.max('tablet') && this.$.menuIsOpen) {
      this.closeSubmenu();
      this.closeMainMenu();
    }
  }

}
