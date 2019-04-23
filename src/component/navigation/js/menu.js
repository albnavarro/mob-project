class menuClass {

  constructor(data) {
    this.s = {
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
    this.s.$itemHasChildren = this.s.$menu.find('.menu-item-has-children')
    this.s.$firstLevelItem = this.s.$menu.find('.main-menu > .menu-item-has-children > .sub-menu')
    this.s.$allSubmenu = this.s.$menu.find('.sub-menu')

    if (this.s.direction == 'vertical') {
      this.s.$menu.addClass('nav--vertical')

      if(this.s.sideDirection == 'left') {
        this.s.$menu.addClass('nav--vertical--left')
      } else {
        this.s.$menu.addClass('nav--vertical--right')
      }
    } else {
      this.s.$menu.addClass('nav--horizontal')
    }

    this.s.lastWindowsWidth = eventManager.windowsWidth();
    this.getSubmenuWidth();
    this.addArrow();
    this.setData();
    this.resizeMenu();
    this.addHandler();
    eventManager.push('resize', this.getSubmenuWidth.bind(this));
    eventManager.push('resize', this.resizeMenu.bind(this));

    if (this.s.direction == 'horizontal') {
      this.SetPosition();
      eventManager.push('resize', this.SetPosition.bind(this));
    }
  }

  getSubmenuWidth(){
    this.s.subMenuWidth = this.s.$allSubmenu.outerWidth();
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

    this.s.$firstLevelItem.each((index,element) => {
      this.s.menuArr.push(new obj($(element)));
    });
  }

  addArrow() {
    // DESKTOP TOUCH SHOW SUBMENU
    const $arrow=$("<div class='arrow-submenu'></div>");
    this.s.$itemHasChildren.prepend($arrow);
  }

  addHandler() {
   this.s.$body.on('click' , this.bodyOnCLick.bind(this));
   this.s.$itemHasChildren.find('.arrow-submenu').on('click', this.arrowOnClick.bind(this));
   this.s.$toggle.on('click', this.toggleOnCLick.bind(this));
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
    if (this.s.$menu.hasClass('menu-on')){
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
     this.s.$allSubmenu.not($parentsSubmenu).not($submenu).removeClass('active');
     this.s.$itemHasChildren.find('.arrow-submenu').not($target).not($parentsArrow).removeClass('arrow-selected');

     if( mq.max('tablet') ) {
       this.s.$allSubmenu.not($parentsSubmenu).not($submenu).slideUp();
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
      for (let index = 0; index < this.s.menuArr.length; index++) {
        const item = this.s.menuArr[index];

        item.parentItemPos = item.parentItem.position().left;
        item.parentItemWidth = item.parentItem.outerWidth();
        item.totalWidth = item.parentItemPos + item.parentItemWidth + (item.maxLevel * this.s.subMenuWidth);

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
      this.s.$menu.slideUp(0,() => {$(window).resize()})
    } else {
      this.s.$menu.slideUp(() => {$(window).resize()})
    }
    this.s.$menu.removeClass('menu-on')
    this.s.$toggle.removeClass('open')
    this.s.menuIsOpen = false
  }

  openMainMenu() {
    this.s.$menu.slideDown(() => {$(window).resize()})
    this.s.$menu.addClass('menu-on')
    this.s.$toggle.addClass('open')
    this.s.menuIsOpen = true
  }

  closeSubmenu() {
    this.s.$allSubmenu.removeClass('active');
    this.s.$itemHasChildren.find('.arrow-submenu').removeClass('arrow-selected');

    if( mq.min('tablet') ) {
      this.s.$allSubmenu.css('display' , '');
    } else {
      this.s.$allSubmenu.slideUp(() => {$(window).resize()});
    }
  }

  resizeMenu() {
    if( this.s.lastWindowsWidth != eventManager.windowsWidth() ) {
      this.closeSubmenu();
      this.closeMainMenu(true);
    }
    this.s.lastWindowsWidth = eventManager.windowsWidth();
  }

  CloseOnScroll() {
    if( mq.max('tablet') && this.s.menuIsOpen) {
      this.closeSubmenu();
      this.closeMainMenu();
    }
  }

}
