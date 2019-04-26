class menuClass {

  constructor(data) {
    this.s = {
      $menu: $(`${data.menu}`),
      $toggle: $(`${data.toggle}`),
      direction: data.direction || 'horizontal',
      sideDirection: data.sideDirection || 'left',
      offCanvas: data.offCanvas || 'true',
      $offCanvasBack: {},
      $mainMenu: {},
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
    // Convert to boolean
    this.s.offCanvas = (this.s.offCanvas == 'true');
    this.s.$mainMenu = this.s.$menu.find('.main-menu');
    this.s.$offCanvasBack = this.s.$menu.find('.main-arrow-back');
    this.s.$itemHasChildren = this.s.$menu.find('.menu-item-has-children');
    this.s.$firstLevelItem = this.s.$menu.find('.main-menu > .menu-item-has-children > .sub-menu');
    this.s.$allSubmenu = this.s.$menu.find('.sub-menu');

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


    if (this.s.offCanvas) {
      this.s.$menu.addClass('nav--offCanvas');
    } else {
      this.s.$menu.addClass('nav--dropDown');
    }

    this.s.lastWindowsWidth = eventManager.windowsWidth();
    this.getSubmenuWidth();
    this.addArrow();
    if (this.s.offCanvas) this.addOffCanvasBtn();
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

  addOffCanvasBtn() {
    // DESKTOP TOUCH SHOW SUBMENU
    const $offCanvasArrow1=$("<button class='main-arrow-back'>back</button>");
    const $offCanvasArrow2=$("<button class='main-arrow-back'>back</button>");

    this.s.$mainMenu.prepend($offCanvasArrow1);
    this.s.$allSubmenu.prepend($offCanvasArrow2);
  }

  addHandler() {
   this.s.$body.on('click' , this.bodyOnCLick.bind(this));
   this.s.$itemHasChildren.find('.arrow-submenu').on('click', this.arrowOnClick.bind(this));
   this.s.$toggle.on('click', this.toggleOnCLick.bind(this));
   this.s.$mainMenu.find('.main-arrow-back').on('click', this.offCanvasBack.bind(this));
  }

  offCanvasBack(evt) {
    if( mq.min('tablet') ) return;

    const $target = $(evt.target);
    let $menu = $target.closest('.sub-menu');

    // Controllo se devo chiudere un submenu o il menu principale
    if ($menu.length > 0) {
      $menu.removeClass('active');
      // Rimuovo la propietà overflow-y dal menu che vado a chiudere
      $menu.removeClass('is-selected');

      // Constrollo a quel Submenu/menu attivare la propietà overflow-y: auto;
      // Solo il menu/submenu selezionato può scrollare
      const $parentMenu = $menu.closest('.sub-menu.active');
      if ($parentMenu.length > 0) {
        $parentMenu.addClass('is-selected');
      } else {
        this.s.$mainMenu.addClass('is-selected');
      }
      ///////////

    } else {
      this.closeMainMenu();

    }
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
       if(!this.s.offCanvas) this.s.$allSubmenu.not($parentsSubmenu).not($submenu).slideUp();
     }

     if( $submenu.hasClass('active') ) {
       $submenu.removeClass('active')
       $target.removeClass('arrow-selected')
       if( mq.max('tablet') ) {
         if(!this.s.offCanvas) $submenu.slideUp(() => {$(window).resize()})
       }
     } else {
       $submenu.addClass('active')
       if(!this.s.offCanvas) {
         $target.addClass('arrow-selected')
       } else {
          // Azzero lo scroll top dei menu di livello superiore per avere il menu aperto
          // al top 0 quando uso il menu Offcanvas
          // Rimuovo la propietà overflow-y: auto; dai menu non visibili
          this.s.$mainMenu.scrollTop(0).removeClass('is-selected');
          this.s.$allSubmenu.not($submenu).scrollTop(0).removeClass('is-selected');
          // Attivo la propietà overflow-y: auto; nel menu selezionato
          $submenu.addClass('is-selected');

       }
       if( mq.max('tablet') ) {
         if(!this.s.offCanvas) $submenu.slideDown(() => {$(window).resize()})
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
      if(!this.s.offCanvas) this.s.$menu.slideUp(0,() => {$(window).resize()})
    } else {
      if(!this.s.offCanvas) this.s.$menu.slideUp(() => {$(window).resize()})
    }
    this.s.$menu.removeClass('menu-on')
    this.s.$toggle.removeClass('open')
    this.s.menuIsOpen = false
    this.s.$body.css('overflow','');
  }

  openMainMenu() {
    if(!this.s.offCanvas) {
      this.s.$menu.slideDown(() => {$(window).resize()})
    } else {
      // Attivo la propietà overflow-y: auto; nel menu principale
      this.s.$mainMenu.addClass('is-selected');
      this.s.$body.css('overflow','hidden');
    }
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
      if(!this.s.offCanvas) this.s.$allSubmenu.slideUp(() => {$(window).resize()});
    }
  }

  resizeMenu() {
    if( this.s.lastWindowsWidth != eventManager.windowsWidth() ) {
      this.closeSubmenu();
      this.closeMainMenu(true);
    }
    this.s.lastWindowsWidth = eventManager.windowsWidth();

    if( mq.max('tablet')) {
      this.s.$allSubmenu.css({'left':'','right': ''})
    }
  }

  CloseOnScroll() {
    if( mq.max('tablet') && this.s.menuIsOpen) {
      this.closeSubmenu();
      this.closeMainMenu();
    }
  }

}
