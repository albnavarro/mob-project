class menuClass {

  constructor(data) {
    this.s = {
      $componentWrepper: $(`${data.componentWrepper}`),
      direction: data.direction || 'horizontal',
      sideDirection: data.sideDirection || 'left',
      offCanvas: data.offCanvas || 'true',
      $offCanvasBack: {},
      $mainMenu: {},
      $toggle: {},
      $itemHasChildren: {},
      $firstLevelItem: {},
      $allSubmenu: {},
      $toggleContainer: {},
      $body: $('body'),
      subMenuWidth: 0,
      toggleWrapHeight: 0,
      menuArr: [],
      menuIsOpen: false,
      lastWindowsWidth: 0,

      // CONSTANTI
      // ( CLASSI DOM FOR QUERY )
      NAV_WRAP: 'nav-wrap', // WRAPPER OF TOGGLE AND MENU
      NAV: 'nav.nav', // HTML5 nav element
      MAIN_MENU: 'main-menu', // MAIN UL
      MENU_ITEM: 'menu-item', // LI LEMENT
      MENU_ITEM_HAS_CHILDREN: 'menu-item-has-children', // LI WITH SUBMENU INSIDE
      SUB_MENU: 'sub-menu', // ALL SUBMENU
      TOGGLE_CONTAINER: 'toggle-wrap', // Toggle container
      TOOGLE_BTN: 'toggle-element', // Toggle btn
      // ADDED ELEMENT
      ARROW_SUBMENU: 'arrow-submenu', // LI ARROW
      OFFCANVAS_ARROW_BACK: 'main-arrow-back', // OFF CANVAS ARROW
      // ADDED CLASS
      NAV_VERTICAL: 'nav--vertical',
      NAV_VERTICAL_LEFT: 'nav--vertical--left',
      NAV_VERTICAL_RIGHT: 'nav--vertical--right',
      NAV_HORIZONTAL: 'nav--horizontal',
      NAV_OFFCANVAS: 'nav--offCanvas',
      NAV_DROPDOWN: 'nav--dropDown',
      IS_SELECTED: 'is-selected', // SUBMENU VISIBLE SCROLABLE
      ARROW_SELECTED: 'arrow-selected', // ITEM ARROW ACTIVE ( AND PARENTS ARROW )
      ACTIVE: 'active', // OPENED MENU VISIBLE AND PARENTS
      OPEN: 'open', // TOGGLE OPENED
      MENU_ON: 'menu-on' // MAIN MENU ACTIVE

    }
    this.init()
  }

  init() {
    if (this.s.$componentWrepper.length == 0 ) return;

    this.s.$mainWrap = this.s.$componentWrepper.find(`.${this.s.NAV_WRAP}`);
    this.s.$menu = this.s.$componentWrepper.find(`.${this.s.NAV}`);
    this.s.$toggle = this.s.$componentWrepper.find(`.${this.s.TOOGLE_BTN}`);
    this.s.offCanvas = (this.s.offCanvas == 'true');
    this.s.$mainMenu = this.s.$menu.find(`.${this.s.MAIN_MENU}`);
    this.s.$offCanvasBack = this.s.$toggle.siblings(`.${this.s.OFFCANVAS_ARROW_BACK}`);
    this.s.$itemHasChildren = this.s.$menu.find(`.${this.s.MENU_ITEM_HAS_CHILDREN}`);
    this.s.$firstLevelItem = this.s.$menu.find(`.${this.s.MAIN_MENU} > .${this.s.MENU_ITEM_HAS_CHILDREN} > .${this.s.SUB_MENU}`);
    this.s.$allSubmenu = this.s.$menu.find(`.${this.s.SUB_MENU}`);
    this.s.$toggleContainer = this.s.$toggle.closest(`.${this.s.TOGGLE_CONTAINER}`);

    if (this.s.direction == 'vertical') {
      this.s.$mainWrap.addClass(this.s.NAV_VERTICAL)

      if(this.s.sideDirection == 'left') {
        this.s.$mainWrap.addClass(this.s.NAV_VERTICAL_LEFT)
      } else {
        this.s.$mainWrap.addClass(this.s.NAV_VERTICAL_RIGHT)
      }
    } else {
      this.s.$mainWrap.addClass(this.s.NAV_HORIZONTAL)
    }


    if (this.s.offCanvas) {
      this.s.$mainWrap.addClass(this.s.NAV_OFFCANVAS);
    } else {
      this.s.$mainWrap.addClass(this.s.NAV_DROPDOWN);
    }

    this.s.lastWindowsWidth = eventManager.windowsWidth();
    this.getSubmenuWidth();
    this.getToggleWrapHeight();
    this.addArrow();
    this.setData();
    this.resizeMenu();
    this.addHandler();
    eventManager.push('resize', this.getSubmenuWidth.bind(this));
    eventManager.push('resize', this.getToggleWrapHeight.bind(this));
    eventManager.push('resize', this.resizeMenu.bind(this));

    if (this.s.direction == 'horizontal') {
      this.SetPosition();
      eventManager.push('resize', this.SetPosition.bind(this));
    }
  }

  getToggleWrapHeight() {
    const root = document.documentElement;

    this.s.toggleWrapHeight = this.s.$toggleContainer.outerHeight();
    root.style.setProperty('--toggle-h', this.s.toggleWrapHeight + "px");
  }

  getSubmenuWidth(){
    this.s.subMenuWidth = this.s.$allSubmenu.outerWidth();
  }

  setData() {
    const _that = this;

    function obj(item) {
      let maxLevel = 0;
      this.item = item;
      this.submenu = this.item.find(`.${_that.s.SUB_MENU}`);
      this.parentItem = this.item.parents(`.${_that.s.MENU_ITEM_HAS_CHILDREN}`);
      this.parentItemPos = 0;
      this.parentItemWidth = 0;
      this.submenu.each((index,element) => {
        const numSubmenuParents = $(element).parents(`.${_that.s.SUB_MENU}`).length;
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
    const $arrow=$(`<div class='${this.s.ARROW_SUBMENU}'></div>`);
    this.s.$itemHasChildren.prepend($arrow);
  }

  addHandler() {
   if (!this.s.offCanvas) this.s.$body.on('click' , this.bodyOnCLick.bind(this));
   this.s.$itemHasChildren.find(`.${this.s.ARROW_SUBMENU}`).on('click', this.arrowOnClick.bind(this));
   this.s.$toggle.on('click', this.toggleOnCLick.bind(this));
   this.s.$offCanvasBack.on('click', this.offCanvasBack.bind(this));
  }

  offCanvasBack(evt) {
    if( mq.min('tablet') ) return;

    let $menu = this.s.$allSubmenu.filter((index, element) => {
      return ($(element).hasClass('is-selected'))
    });

    // Controllo se devo chiudere un submenu o il menu principale
    if ($menu.length > 0) {
      $menu.removeClass(this.s.ACTIVE);
      // Rimuovo la propietà overflow-y dal menu che vado a chiudere
      $menu.removeClass(this.s.IS_SELECTED);
      // Resetto un eventuale scroll nel menu un attimo dopo.
      // Il setTimeout viene usato per estetica, resetto lo scroll topo solo a menu chiuso
      setTimeout(() => {
        $menu.scrollTop(0);
      }, 350);

      // Constrollo a quale Submenu/menu (parente) attivare la propietà overflow-y: auto;
      // Solo il menu/submenu selezionato può scrollare
      const $parentMenu = $menu.closest(`.${this.s.SUB_MENU}.${this.s.ACTIVE}`);
      if ($parentMenu.length > 0) {
        $parentMenu.addClass(this.s.IS_SELECTED);
      } else {
        this.s.$mainMenu.addClass(this.s.IS_SELECTED);
      }
      ///////////

    } else {
      this.closeMainMenu();
    }
  }

  bodyOnCLick(evt) {
    if ( !$(evt.target).parents(`.${this.s.NAV_WRAP}`).length ) {
      this.closeSubmenu();
      if( mq.max('tablet') ) {
        this.closeMainMenu();
      }
    }
  }

  toggleOnCLick() {
    if (this.s.$mainWrap.hasClass(this.s.MENU_ON)){
      this.closeSubmenu();
      this.closeMainMenu();
    } else {
      this.openMainMenu();
    }
  }

  arrowOnClick(event) {
    const $target = $(event.target),
          $submenu=$target.siblings(`.${this.s.SUB_MENU}`),
          $item = $target.parent(`.${this.s.MENU_ITEM}`),
          $parentsSubmenu = $item.parents(`.${this.s.SUB_MENU}`),
          $parentsArrow = $parentsSubmenu.siblings(`.${this.s.ARROW_SUBMENU}`);

    // Attivo il click sull'arrow solo per monitor touch e mobile
    if( Modernizr.touchevents || mq.max('tablet')) {

      // Chiudo tutti i submenu non necessari ( non parenti del selezionato).
     this.s.$allSubmenu.not($parentsSubmenu).not($submenu).removeClass(this.s.ACTIVE);
     this.s.$itemHasChildren.find(`.${this.s.ARROW_SUBMENU}`).not($target).not($parentsArrow).removeClass(this.s.ARROW_SELECTED);

     if( mq.max('tablet') && !this.s.offCanvas) {
       this.s.$allSubmenu.not($parentsSubmenu).not($submenu).slideUp();
     }

     if( $submenu.hasClass(this.s.ACTIVE) ) {
       // Chiudo il menu
       $submenu.removeClass(this.s.ACTIVE)
       $target.removeClass(this.s.ARROW_SELECTED)
       if( mq.max('tablet') && !this.s.offCanvas) {
         $submenu.slideUp(() => {$(window).resize()})
       }
     } else {
       // Apro il menu
       $submenu.addClass(this.s.ACTIVE)
       $target.addClass(this.s.ARROW_SELECTED)

       // Logica offCanvas
       if(this.s.offCanvas) {
          this.s.$mainMenu.removeClass(this.s.IS_SELECTED);
          this.s.$allSubmenu.not($submenu).removeClass(this.s.IS_SELECTED);

          if( mq.max('tablet') ) {
            // Attivo la propietà overflow-y: auto; nel menu selezionato
            $submenu.addClass(this.s.IS_SELECTED);

            // Posiziono il menu in verticale rispetto al menu parente;
            let gap = this.s.$mainMenu.scrollTop();
            if($parentsSubmenu.length) {
              gap = $parentsSubmenu.scrollTop();
            }

            $submenu.css('top', gap  + 'px');
          }
       }

       if( mq.max('tablet') && !this.s.offCanvas) {
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
      if(!this.s.offCanvas) this.s.$menu.slideUp(0,() => {$(window).resize()})
    } else {
      if(!this.s.offCanvas) this.s.$menu.slideUp(() => {$(window).resize()})
    }

    this.s.$mainWrap.removeClass(this.s.MENU_ON)
    this.s.menuIsOpen = false
    this.s.$body.css('overflow','');

    // Azzero lo scroll top di tutti i menu
    this.s.$mainMenu.scrollTop(0).removeClass(this.s.IS_SELECTED);
    this.s.$allSubmenu.scrollTop(0);

    this.s.$allSubmenu.removeClass(this.s.ACTIVE);
    // Rimuovo la propietà overflow-y dal menu che vado a chiudere
    this.s.$allSubmenu.removeClass(this.s.IS_SELECTED);
  }

  openMainMenu() {
    if(!this.s.offCanvas) {
      this.s.$menu.slideDown(() => {$(window).resize()})
    } else {
      // Attivo la propietà overflow-y: auto; nel menu principale
      this.s.$mainMenu.addClass(this.s.IS_SELECTED);
      this.s.$body.css('overflow','hidden');
    }
    this.s.$mainWrap.addClass(this.s.MENU_ON)
    this.s.menuIsOpen = true
  }

  closeSubmenu() {
    this.s.$allSubmenu.removeClass(this.s.ACTIVE);
    this.s.$itemHasChildren.find(`.${this.s.ARROW_SUBMENU}`).removeClass(this.s.ARROW_SELECTED);

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

    this.s.$allSubmenu.css('top','');

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
