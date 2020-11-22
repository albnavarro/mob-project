import { modernzier } from "../../../js/utility/modernizr.js"
import { eventManager } from "../../../js/base/eventManager.js";
import { mq } from "../../../js/base/mediaManager.js";
import { outerHeight, outerWidth, offset, position, getParents, getSiblings } from "../../../js/utility/vanillaFunction.js";
import { slideUp, slideDown } from "../../../js/utility/animation.js";

export class menuClass {

    constructor(data) {
        this.s = {
            $componentWrepper: document.querySelector(data.componentWrepper),
            direction: data.direction || 'horizontal',
            sideDirection: data.sideDirection || 'left',
            offCanvas: typeof data.offCanvas === "undefined" ? true : data.offCanvas,
            $offCanvasBack: {},
            $mainMenu: {},
            $toggle: {},
            $itemHasChildren: {},
            $firstLevelItem: {},
            $allSubmenu: {},
            $toggleContainer: {},
            $body: document.querySelector('body'),
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
        if (typeof(this.s.$componentWrepper) === 'undefined' && this.s.$componentWrepper === null) return;

        this.s.$mainWrap = this.s.$componentWrepper.querySelector(`.${this.s.NAV_WRAP}`);
        this.s.$menu = this.s.$componentWrepper.querySelector(`.${this.s.NAV}`);
        this.s.$toggle = this.s.$componentWrepper.querySelector(`.${this.s.TOOGLE_BTN}`);
        this.s.$mainMenu = this.s.$menu.querySelector(`.${this.s.MAIN_MENU}`);
        this.s.$offCanvasBack = this.s.$mainWrap.querySelector(`.${this.s.OFFCANVAS_ARROW_BACK}`);
        this.s.$itemHasChildren = this.s.$menu.querySelectorAll(`.${this.s.MENU_ITEM_HAS_CHILDREN}`);
        this.s.$firstLevelItem = this.s.$menu.querySelectorAll(`.${this.s.MAIN_MENU} > .${this.s.MENU_ITEM_HAS_CHILDREN} > .${this.s.SUB_MENU}`);
        this.s.$allSubmenu = this.s.$menu.querySelectorAll(`.${this.s.SUB_MENU}`);
        this.s.$toggleContainer = this.s.$toggle.closest(`.${this.s.TOGGLE_CONTAINER}`);

        if (this.s.direction == 'vertical') {
            this.s.$mainWrap.classList.add(this.s.NAV_VERTICAL)

            if (this.s.sideDirection == 'left') {
                this.s.$mainWrap.classList.add(this.s.NAV_VERTICAL_LEFT)
            } else {
                this.s.$mainWrap.classList.add(this.s.NAV_VERTICAL_RIGHT)
            }
        } else {
            this.s.$mainWrap.classList.add(this.s.NAV_HORIZONTAL)
        }


        if (this.s.offCanvas) {
            this.s.$mainWrap.classList.add(this.s.NAV_OFFCANVAS);
        } else {
            this.s.$mainWrap.classList.add(this.s.NAV_DROPDOWN);
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

        this.s.toggleWrapHeight = outerHeight(this.s.$toggleContainer);
        root.style.setProperty('--toggle-h', this.s.toggleWrapHeight + "px");
    }

    getSubmenuWidth() {
        // submenu rest for width;
        const firstSubmenu = Array.from(this.s.$allSubmenu)
        firstSubmenu[0].style.display = 'block';
        this.s.subMenuWidth = parseInt(outerWidth(firstSubmenu[0]));
        firstSubmenu[0].style.display = '';
    }

    setData() {
        const _that = this;

        function obj(item) {
            let maxLevel = 0;
            this.item = item;
            this.submenu = this.item.querySelectorAll(`.${_that.s.SUB_MENU}`);
            this.parentItem = this.item.closest(`.${_that.s.MENU_ITEM_HAS_CHILDREN}`);
            this.parentItemPos = 0;
            this.parentItemWidth = 0;
            this.submenuArray = Array.from(this.submenu);

            for (const element of this.submenuArray) {
                const numSubmenuParents = getParents(element, `.${_that.s.SUB_MENU}`).length - 1;
                if (numSubmenuParents > maxLevel) {
                    maxLevel = numSubmenuParents;
                }
            }

            this.maxLevel = maxLevel;
            this.totalWidth = 0;
        }

        const firstLevelItem = Array.from(this.s.$firstLevelItem);
        for (const element of firstLevelItem) {
            this.s.menuArr.push(new obj(element));
        }
    }

    addArrow() {
        // DESKTOP TOUCH SHOW SUBMENU
        const itemArray = Array.from(this.s.$itemHasChildren);

        for (const item of itemArray) {
            const arrow = document.createElement('div');
            arrow.classList.add(this.s.ARROW_SUBMENU)
            item.insertBefore(arrow, item.firstChild);
        };

    }

    addHandler() {
        if (!this.s.offCanvas) {
            this.s.$body.addEventListener('click', this.bodyOnCLick.bind(this));
        }

        const arrow = this.s.$mainWrap.querySelectorAll(`.${this.s.ARROW_SUBMENU}`);
        const arrowArray = Array.from(arrow);
        for (const item of arrowArray) {
            item.addEventListener('click', this.arrowOnClick.bind(this))
        };
        this.s.$toggle.addEventListener('click', this.toggleOnCLick.bind(this))
        this.s.$offCanvasBack.addEventListener('click', this.offCanvasBack.bind(this))
    }

    offCanvasBack(evt) {
        if (mq.min('tablet')) return;

        const menuArray = Array.from(this.s.$allSubmenu);
        let $menu = menuArray.filter((element) => {
            return element.classList.contains('is-selected')
        });

        // Controllo se devo chiudere un submenu o il menu principale
        if ($menu.length > 0) {
            for (const el of $menu) {
                el.classList.remove(this.s.ACTIVE);
                el.classList.remove(this.s.IS_SELECTED);

                // Rimuovo la propietà overflow-y dal menu che vado a chiudere
                // Resetto un eventuale scroll nel menu un attimo dopo.
                // Il setTimeout viene usato per estetica, resetto lo scroll topo solo a menu chiuso
                setTimeout(() => {
                    el.scrollTop = 0;
                }, 350);

                // Constrollo a quale Submenu/menu (parente) attivare la propietà overflow-y: auto;
                // Solo il menu/submenu selezionato può scrollare
                const $parentMenu = el.closest(`.${this.s.SUB_MENU}.${this.s.ACTIVE}`);

                if (typeof($parentMenu) != 'undefined' && $parentMenu != null) {
                    $parentMenu.classList.add(this.s.IS_SELECTED);
                } else {
                    this.s.$mainMenu.classList.add(this.s.IS_SELECTED);
                }
                ///////////
            }


        } else {
            this.closeMainMenu();
        }
    }

    bodyOnCLick(evt) {
        if (!$(evt.target).parents(`.${this.s.NAV_WRAP}`).length) {
            this.closeSubmenu();
            if (mq.max('tablet') && this.s.menuIsOpen) {
                this.closeMainMenu();
            }
        }
    }

    toggleOnCLick() {
        if (this.s.$mainWrap.classList.contains(this.s.MENU_ON)) {
            this.closeSubmenu();
            this.closeMainMenu();
        } else {
            this.openMainMenu();
        }
    }

    arrowOnClick(event) {
        const $target = event.target;
        const $parent = $target.parentNode;
        const $submenu = $parent.querySelector(`.${this.s.SUB_MENU}`);
        const $item = $target.closest(`.${this.s.MENU_ITEM}`);

        // POSSONO ESSERER PIU DI UNO
        const $parentsSubmenu = getParents($item, `.${this.s.SUB_MENU}`);

        let $parentsArrow = []
        if ($parentsSubmenu.length) {
            for (const item of $parentsSubmenu) {
                const temp = getSiblings(item, this.s.ARROW_SUBMENU);
                for (const item2 of temp) {
                    $parentsArrow.push(item2)
                }
            }
        }

        // Attivo il click sull'arrow solo per monitor touch e mobile
        if (Modernizr.touchevents || mq.max('tablet')) {

            // Chiudo tutti i submenu non necessari ( non parenti del selezionato).
            // chiudo tutti quelli diversi dall' attuale paerto
            const submenuArray = Array.from(this.s.$allSubmenu)
            for (const submenu of submenuArray) {
                if (submenu !== $submenu) {
                    submenu.classList.remove(this.s.ACTIVE)
                }
            };

            // apro i submenu parenti
            const parentSubmenuArray = Array.from($parentsSubmenu);
            for (const parentSubmenudd of parentSubmenuArray) {
                parentSubmenudd.classList.add(this.s.ACTIVE)
            }
            // Le du eoperazioni soprra somno da unificare.


            // Faccio al stesa operazione per le arrow
            const itemHasChildren = Array.from(this.s.$itemHasChildren);
            const arrowSubMenu = this.s.$componentWrepper.querySelectorAll(`.${this.s.ARROW_SUBMENU}`);
            const arrArrowSubmenu = Array.from(arrowSubMenu);
            for (const item of arrArrowSubmenu) {
                if (item !== $target) {
                    item.classList.remove(this.s.ARROW_SELECTED)
                }
            }

            for (const item of $parentsArrow) {
                item.classList.add(this.s.ARROW_SELECTED)
            }
            // come sopra da unificare


            if (mq.max('tablet') && !this.s.offCanvas) {
                for (const submenu of submenuArray) {
                    if (submenu !== $submenu) {
                        submenu.style.display = 'none';
                    }
                };

                for (const parentSubmenu of parentSubmenuArray) {
                    parentSubmenu.style.display = 'block';
                }

                // this.s.$allSubmenu.not($parentsSubmenu).not($submenu).slideUp(() => {
                //   eventManager.execute('resize');
                // });
            }

            if ($submenu.classList.contains(this.s.ACTIVE)) {
                // Chiudo il menu
                $submenu.classList.remove(this.s.ACTIVE)
                $target.classList.remove(this.s.ARROW_SELECTED)

                if (mq.max('tablet') && !this.s.offCanvas) {
                    // $submenu.slideUp(() => {
                    //   eventManager.execute('resize');
                    // })
                    // slideUp($submenu).then(() => {
                    //     eventManager.execute('resize');
                    // });
                    $submenu.style.display = 'none';
                }
            } else {
                // Apro il menu
                $submenu.classList.add(this.s.ACTIVE)
                $target.classList.add(this.s.ARROW_SELECTED)

                // Logica offCanvas
                if (this.s.offCanvas) {
                    this.s.$mainMenu.classList.remove(this.s.IS_SELECTED);

                    for (const submenu of submenuArray) {
                        if (submenu !== $submenu) {
                            submenu.classList.remove(this.s.IS_SELECTED);
                        }
                    }

                    if (mq.max('tablet')) {
                        // Attivo la propietà overflow-y: auto; nel menu selezionato
                        $submenu.classList.add(this.s.IS_SELECTED);

                        // Posiziono il menu in verticale rispetto al menu parente;
                        let gap = this.s.$mainMenu.scrollTop;
                        if ($parentsSubmenu.length) {
                            gap = $parentsSubmenu[0].scrollTop;
                        }
                        const syle = {
                            'top': gap + 'px'
                        }
                        Object.assign($submenu.style, syle)
                    }
                }

                if (mq.max('tablet') && !this.s.offCanvas) {
                    // $submenu.slideDown(() => {
                    //   eventManager.execute('resize');
                    // })
                    $submenu.style.display = 'block';
                }

            }
        }
    }

    SetPosition() {
        if (mq.min('tablet')) {
            for (let index = 0; index < this.s.menuArr.length; index++) {
                const item = this.s.menuArr[index];

                // console.log(item.parentItem)
                item.parentItemPos = parseInt(position(item.parentItem).left);
                item.parentItemWidth = parseInt(outerWidth(item.parentItem));
                item.totalWidth = item.parentItemPos + item.parentItemWidth + (item.maxLevel * this.s.subMenuWidth);

                if (item.totalWidth > eventManager.windowsWidth()) {
                    const itemStyle = {
                        'right': '0',
                        'left': 'auto'
                    }
                    Object.assign(item.item.style, itemStyle);

                    const submenuStyle = {
                        'right': '100%',
                        'left': 'auto'
                    }
                    const submenuArray = Array.from(item.submenu);
                    for (const el of submenuArray) {
                        Object.assign(el.style, submenuStyle);
                    }

                } else {
                    const itemStyle = {
                        'left': '0',
                        'right': 'auto'
                    }
                    Object.assign(item.item.style, itemStyle);

                    const submenuStyle = {
                        'left': '100%',
                        'right': 'auto'
                    }

                    const submenuArray = Array.from(item.submenu);
                    for (const el of submenuArray) {
                        Object.assign(el.style, submenuStyle);
                    }
                }
            }
        }
    }

    closeMainMenu(immediate) {
        if (immediate) {
            // if(!this.s.offCanvas) this.s.$menu.slideUp(0,() => {
            //   eventManager.execute('resize');
            // })
            if (!this.s.offCanvas) this.s.$menu.style.display = 'none';
        } else {
            // if(!this.s.offCanvas) this.s.$menu.slideUp(() => {
            //   eventManager.execute('resize');
            // })

            if (!this.s.offCanvas) {
                this.s.$menu.style.display = 'none';
            }
        }

        this.s.$mainWrap.classList.remove(this.s.MENU_ON)
        this.s.menuIsOpen = false
        eventManager.removeBodyOverflow();

        // Azzero lo scroll top di tutti i menu
        this.s.$mainMenu.scrollTo({
            top: 0
        })

        const allSubmenuArray = Array.from(this.s.$allSubmenu);
        for (const submenu of allSubmenuArray) {
            submenu.scrollTo({
                top: 0
            })
            submenu.classList.remove(this.s.ACTIVE)
            // Rimuovo la propietà overflow-y dal menu che vado a chiudere
            submenu.classList.remove(this.s.IS_SELECTED)
        };
    }

    openMainMenu() {
        if (!this.s.offCanvas) {
            // this.s.$menu.slideDown(() => {
            //   eventManager.execute('resize');
            // })
            this.s.$menu.style.display = 'block';

        } else {
            // Attivo la propietà overflow-y: auto; nel menu principale
            this.s.$mainMenu.classList.add(this.s.IS_SELECTED);
            eventManager.setBodyOverflow();
        }
        this.s.$mainWrap.classList.add(this.s.MENU_ON)
        this.s.menuIsOpen = true
    }

    closeSubmenu() {
        const submenuArray = Array.from(this.s.$allSubmenu);
        for (const submenu of submenuArray) {
            submenu.classList.remove(this.s.ACTIVE)
        };

        const arrows = this.s.$mainWrap.querySelectorAll(`.${this.s.ARROW_SUBMENU}`);
        const arrowsArray = Array.from(arrows);
        for (const arrow of arrowsArray) {
            arrow.classList.remove(this.s.ARROW_SELECTED)
        };

        if (mq.min('tablet')) {
            for (const submenu of submenuArray) {
                const style = {
                    'display': ''
                }

                Object.assign(submenu.style, style);
            };
        } else {
            // if(!this.s.offCanvas) this.s.$allSubmenu.slideUp(() => {
            //   eventManager.execute('resize');
            // });
            const submenuArray = Array.from(this.s.$allSubmenu);
            for (const el of submenuArray) {
                if (!this.s.offCanvas) el.style.display = 'none';
            }

        }
    }

    resizeMenu() {
        if (this.s.lastWindowsWidth != eventManager.windowsWidth()) {
            this.closeSubmenu();
            this.closeMainMenu(true);
        }
        this.s.lastWindowsWidth = eventManager.windowsWidth();

        const allSubmenu = Array.from(this.s.$allSubmenu);
        for (const submenu of allSubmenu) {
            const style = {
                'top': ''
            }
            Object.assign(submenu.style, style);
        };

        if (mq.max('tablet')) {
            for (const submenu of allSubmenu) {
                const style = {
                    'left': '',
                    'right': ''
                }
                Object.assign(submenu.style, style);
            };
        }
    }

    CloseOnScroll() {
        if (mq.max('tablet') && this.s.menuIsOpen) {
            this.closeSubmenu();
            this.closeMainMenu();
        }
    }

}
