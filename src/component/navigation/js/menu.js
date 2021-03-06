import {
    disableBodyScroll,
    enableBodyScroll,
    clearAllBodyScrollLocks,
} from 'body-scroll-lock';
import { modernzier } from '../../../js/utility/modernizr.js';
import { eventManager } from '../../../js/base/eventManager.js';
import { mq } from '../../../js/base/mediaManager.js';
import {
    outerHeight,
    outerWidth,
    offset,
    getParents,
    getSiblings,
} from '../../../js/utility/vanillaFunction.js';
import {
    slideUpDownReset,
    slideUp,
    slideDown,
} from '../../../js/utility/animation.js';

export class menuClass {
    constructor(data) {
        this.componentWrapper = document.querySelector(data.componentWrapper);
        this.direction = data.direction || 'horizontal';
        this.sideDirection = data.sideDirection || 'left';
        this.mediaQ = data.mediaQ || 'tablet';
        this.offCanvas =
            typeof data.offCanvas === 'undefined' ? true : data.offCanvas;
        this.offCanvasBackButton = {};
        this.mainMenu = {};
        this.toggle = {};
        this.itemHasChildren = {};
        this.firstLevelItem = {};
        this.allSubmenu = {};
        this.toggleContainer = {};
        this.body = document.querySelector('body');
        this.subMenuWidth = 0;
        this.toggleWrapHeight = 0;
        this.menuArr = [];
        this.menuIsOpen = false;
        this.lastWindowsWidth = 0;

        // CONSTANTI
        // ( CLASSI DOM FOR QUERY )
        this.NAV_WRAP = 'nav-wrap'; // WRAPPER OF TOGGLE AND MENU
        this.NAV = 'nav.nav'; // HTML5 nav element
        this.MAIN_MENU = 'main-menu'; // MAIN UL
        this.MENU_ITEM = 'menu-item'; // LI LEMENT
        this.MENU_ITEM_HAS_CHILDREN = 'menu-item-has-children'; // LI WITH SUBMENU INSIDE
        this.SUB_MENU = 'sub-menu'; // ALL SUBMENU
        this.TOGGLE_CONTAINER = 'toggle-wrap'; // Toggle container
        this.TOOGLE_BTN = 'toggle-element'; // Toggle btn
        // ADDED ELEMENT
        this.ARROW_SUBMENU = 'arrow-submenu'; // LI ARROW
        this.OFFCANVAS_ARROW_BACK = 'main-arrow-back'; // OFF CANVAS ARROW
        // ADDED CLASS
        this.NAV_VERTICAL = 'nav--vertical';
        this.NAV_VERTICAL_LEFT = 'nav--vertical--left';
        this.NAV_VERTICAL_RIGHT = 'nav--vertical--right';
        this.NAV_HORIZONTAL = 'nav--horizontal';
        this.NAV_OFFCANVAS = 'nav--offCanvas';
        this.NAV_DROPDOWN = 'nav--dropDown';
        this.IS_SELECTED = 'is-selected'; // SUBMENU VISIBLE SCROLABLE
        this.ARROW_SELECTED = 'arrow-selected'; // ITEM ARROW ACTIVE ( AND PARENTS ARROW )
        this.ACTIVE = 'active'; // OPENED MENU VISIBLE AND PARENTS
        this.OPEN = 'open'; // TOGGLE OPENED
        this.MENU_ON = 'menu-on'; // MAIN MENU ACTIVE

        this.init();
    }

    init() {
        if (
            typeof this.componentWrapper === 'undefined' ||
            this.componentWrapper === null
        )
            return;

        this.mainWrap = this.componentWrapper.querySelector(
            `.${this.NAV_WRAP}`
        );
        this.menu = this.componentWrapper.querySelector(`.${this.NAV}`);
        this.toggle = this.componentWrapper.querySelector(
            `.${this.TOOGLE_BTN}`
        );
        this.mainMenu = this.menu.querySelector(`.${this.MAIN_MENU}`);
        this.offCanvasBackButton = this.mainWrap.querySelector(
            `.${this.OFFCANVAS_ARROW_BACK}`
        );
        this.itemHasChildren = this.menu.querySelectorAll(
            `.${this.MENU_ITEM_HAS_CHILDREN}`
        );
        this.firstLevelItem = this.menu.querySelectorAll(
            `.${this.MAIN_MENU} > .${this.MENU_ITEM_HAS_CHILDREN} > .${this.SUB_MENU}`
        );
        this.allSubmenu = this.menu.querySelectorAll(`.${this.SUB_MENU}`);
        this.toggleContainer = this.toggle.closest(`.${this.TOGGLE_CONTAINER}`);

        if (this.direction == 'vertical') {
            this.mainWrap.classList.add(this.NAV_VERTICAL);

            if (this.sideDirection == 'left') {
                this.mainWrap.classList.add(this.NAV_VERTICAL_LEFT);
            } else {
                this.mainWrap.classList.add(this.NAV_VERTICAL_RIGHT);
            }
        } else {
            this.mainWrap.classList.add(this.NAV_HORIZONTAL);
        }

        if (this.offCanvas) {
            this.mainWrap.classList.add(this.NAV_OFFCANVAS);
        } else {
            this.mainWrap.classList.add(this.NAV_DROPDOWN);
        }

        this.lastWindowsWidth = eventManager.windowsWidth();
        this.getSubmenuWidth();
        this.getToggleWrapHeight();
        this.addArrow();
        this.setData();
        this.resizeMenu();
        this.addHandler();
        this.resetSubmenuHeight();
        eventManager.push('resize', this.getSubmenuWidth.bind(this));
        eventManager.push('resize', this.getToggleWrapHeight.bind(this));
        eventManager.push('resize', this.resizeMenu.bind(this));
        eventManager.push('resize', this.resetSubmenuHeight.bind(this));

        if (this.direction == 'horizontal') {
            this.SetPosition();
            eventManager.push('resize', this.SetPosition.bind(this));
        }
    }

    // utils for mobile accordion menu slideUp/Down init
    resetSubmenuHeight() {
        if (mq.max(this.mediaQ) && !this.offCanvas) {
            slideUpDownReset(this.menu);

            const targetArray = Array.from(this.allSubmenu);
            let i = 0;
            for (const el of targetArray) {
                slideUpDownReset(el);
                el.setAttribute('node-id', i);
                i++;
            }
        }
    }

    getToggleWrapHeight() {
        const root = document.documentElement;

        this.toggleWrapHeight = outerHeight(this.toggleContainer);
        root.style.setProperty('--toggle-h', this.toggleWrapHeight + 'px');
    }

    getSubmenuWidth() {
        // submenu rest for width;
        const firstSubmenu = Array.from(this.allSubmenu);
        firstSubmenu[0].style.display = 'block';
        this.subMenuWidth = parseInt(outerWidth(firstSubmenu[0]));
        firstSubmenu[0].style.display = '';
    }

    setData() {
        function obj(item, context) {
            this.item = item;
            this.submenu = this.item.querySelectorAll(`.${context.SUB_MENU}`);
            this.parentItem = this.item.closest(
                `.${context.MENU_ITEM_HAS_CHILDREN}`
            );
            this.parentItemPos = 0;
            this.parentItemWidth = 0;
            this.submenuArray = Array.from(this.submenu);
            this.maxLevel = this.submenuArray.reduce((p, c) => {
                const numSubmenuParents =
                    getParents(c, context.SUB_MENU).length - 1;
                return numSubmenuParents > p ? numSubmenuParents : 0;
            }, 0);
            this.totalWidth = 0;
        }

        const firstLevelItem = Array.from(this.firstLevelItem);
        this.menuArr = firstLevelItem.map((element) => {
            return new obj(element, this);
        });
    }

    addArrow() {
        // DESKTOP TOUCH SHOW SUBMENU
        const itemArray = Array.from(this.itemHasChildren);

        for (const item of itemArray) {
            const arrow = document.createElement('div');
            arrow.classList.add(this.ARROW_SUBMENU);
            item.insertBefore(arrow, item.firstChild);
        }
    }

    addHandler() {
        if ((!this.offCanvas && mq.max(this.mediaQ)) || Modernizr.touchevents) {
            this.body.addEventListener('click', this.bodyOnCLick.bind(this));
        }

        const arrow = this.mainWrap.querySelectorAll(`.${this.ARROW_SUBMENU}`);
        const arrowArray = Array.from(arrow);
        for (const item of arrowArray) {
            item.addEventListener('click', this.arrowOnClick.bind(this));
        }
        this.toggle.addEventListener('click', this.toggleOnCLick.bind(this));
        this.offCanvasBackButton.addEventListener(
            'click',
            this.offCanvasBack.bind(this)
        );
    }

    offCanvasBack(evt) {
        if (mq.min(this.mediaQ)) return;

        const menuArray = Array.from(this.allSubmenu);
        const selectedMenu = menuArray.filter((element) => {
            return element.classList.contains('is-selected');
        });

        // Controllo se devo chiudere un submenu o il menu principale
        if (selectedMenu.length > 0) {
            for (const el of selectedMenu) {
                el.classList.remove(this.ACTIVE);
                el.classList.remove(this.IS_SELECTED);

                // Rimuovo la propietà overflow-y dal menu che vado a chiudere
                // Resetto un eventuale scroll nel menu un attimo dopo.
                // Il setTimeout viene usato per estetica, resetto lo scroll topo solo a menu chiuso
                setTimeout(() => {
                    el.scrollTop = 0;
                }, 350);

                // Constrollo a quale Submenu/menu (parente) attivare la propietà overflow-y: auto;
                // Solo il menu/submenu selezionato può scrollare
                const parentMenu = el.closest(
                    `.${this.SUB_MENU}.${this.ACTIVE}`
                );

                if (typeof parentMenu != 'undefined' && parentMenu != null) {
                    parentMenu.classList.add(this.IS_SELECTED);
                } else {
                    this.mainMenu.classList.add(this.IS_SELECTED);
                }
                ///////////
            }
        } else {
            this.closeMainMenu();
        }
    }

    bodyOnCLick(e) {
        const parents = getParents(e.target, this.NAV_WRAP);
        if (!parents.length) {
            this.closeSubmenu();
            if (mq.max(this.mediaQ) && this.menuIsOpen) {
                this.closeMainMenu();
            }
        }
    }

    toggleOnCLick() {
        if (this.mainWrap.classList.contains(this.MENU_ON)) {
            this.closeSubmenu();
            this.closeMainMenu();
        } else {
            this.openMainMenu();
        }
    }

    arrowOnClick(event) {
        if (!Modernizr.touchevents && mq.min(this.mediaQ)) return;

        const target = event.target;
        const parent = target.parentNode;
        const activeSubmenu = parent.querySelector(`.${this.SUB_MENU}`);
        const submenuArray = Array.from(this.allSubmenu);
        const item = target.closest(`.${this.MENU_ITEM}`);

        // get parents submenu
        const parentSubmenus = getParents(item, this.SUB_MENU);
        const parentSubmenusArray = Array.from(parentSubmenus);

        // Remove active class form all submenu leaving out active
        for (const item of submenuArray) {
            if (item !== activeSubmenu) {
                item.classList.remove(this.ACTIVE);
            }
        }

        // add active class on partents submenu
        for (const item of parentSubmenusArray) {
            item.classList.add(this.ACTIVE);
        }

        // get parents arrow
        const parentsArrow = parentSubmenus
            .map((item) => {
                return getSiblings(item, this.ARROW_SUBMENU);
            })
            .flat();

        // Remove active class form all arrows leaving out active
        const arrowSubMenu = this.componentWrapper.querySelectorAll(
            `.${this.ARROW_SUBMENU}`
        );
        const arrArrowSubmenu = Array.from(arrowSubMenu);
        for (const item of arrArrowSubmenu) {
            if (item !== target) {
                item.classList.remove(this.ARROW_SELECTED);
            }
        }

        // add active class on partents arrow
        for (const item of parentsArrow) {
            item.classList.add(this.ARROW_SELECTED);
        }

        if (!this.offCanvas) {
            // Slide Up submenu not active
            const allSubmenuId = submenuArray.map((item) => {
                return item.getAttribute('node-id');
            });

            const parentSubmenusId = parentSubmenusArray.map((item) => {
                return item.getAttribute('node-id');
            });

            const submenuToClose = allSubmenuId.filter(
                (item) => !parentSubmenusId.includes(item)
            );

            for (const item of submenuToClose) {
                const el = document.querySelector(`[node-id="${item}"]`);
                if (typeof el != 'undefined' && el != null) {
                    slideUp(el);
                }
            }
        }

        // OPEN/CLOSE
        const isOpen = activeSubmenu.classList.contains(this.ACTIVE);
        switch (isOpen) {
            case true:
                activeSubmenu.classList.remove(this.ACTIVE);
                target.classList.remove(this.ARROW_SELECTED);

                switch (this.offCanvas) {
                    case false:
                        slideUp(activeSubmenu);
                        break;
                }

                break;

            case false:
                activeSubmenu.classList.add(this.ACTIVE);
                target.classList.add(this.ARROW_SELECTED);

                switch (this.offCanvas) {
                    case true:
                        this.mainMenu.classList.remove(this.IS_SELECTED);

                        for (const item of submenuArray) {
                            if (item !== activeSubmenu) {
                                item.classList.remove(this.IS_SELECTED);
                            }
                        }

                        // Attivo la propietà overflow-y: auto; nel menu selezionato
                        activeSubmenu.classList.add(this.IS_SELECTED);

                        // Posiziono il menu in verticale rispetto al menu parente;
                        let gap = this.mainMenu.scrollTop;
                        if (parentSubmenus.length) {
                            const parent =
                                parentSubmenus[parentSubmenus.length - 1];
                            gap = parent.scrollTop;
                        }
                        const syle = { top: gap + 'px' };

                        if (mq.max(this.mediaQ))
                            Object.assign(activeSubmenu.style, syle);

                        break;

                    case false:
                        slideDown(activeSubmenu);

                        break;
                }
                break;
        }
    }

    SetPosition() {
        if (mq.min(this.mediaQ)) {
            for (let index = 0; index < this.menuArr.length; index++) {
                const item = this.menuArr[index];

                item.parentItemPos = parseInt(offset(item.parentItem).left);
                item.parentItemWidth = parseInt(outerWidth(item.parentItem));
                item.totalWidth =
                    item.parentItemPos +
                    item.parentItemWidth +
                    item.maxLevel * this.subMenuWidth;

                if (item.totalWidth > eventManager.windowsWidth()) {
                    const itemStyle = {
                        right: '0',
                        left: 'auto',
                    };
                    Object.assign(item.item.style, itemStyle);

                    const submenuStyle = {
                        right: '100%',
                        left: 'auto',
                    };
                    const submenuArray = Array.from(item.submenu);
                    for (const el of submenuArray) {
                        Object.assign(el.style, submenuStyle);
                    }
                } else {
                    const itemStyle = {
                        left: '0',
                        right: 'auto',
                    };
                    Object.assign(item.item.style, itemStyle);

                    const submenuStyle = {
                        left: '100%',
                        right: 'auto',
                    };

                    const submenuArray = Array.from(item.submenu);
                    for (const item of submenuArray) {
                        Object.assign(item.style, submenuStyle);
                    }
                }
            }
        }
    }

    closeMainMenu(immediate) {
        this.mainWrap.classList.remove(this.MENU_ON);
        this.menuIsOpen = false;
        enableBodyScroll(this.mainWrap);

        if (mq.max(this.mediaQ) && !this.offCanvas) {
            slideUp(this.menu);
        }

        // Azzero lo scroll top di tutti i menu
        this.mainMenu.scrollTop = 0;

        const allSubmenuArray = Array.from(this.allSubmenu);
        for (const submenu of allSubmenuArray) {
            submenu.scrollTop = 0;
            submenu.classList.remove(this.ACTIVE);
            // Rimuovo la propietà overflow-y dal menu che vado a chiudere
            submenu.classList.remove(this.IS_SELECTED);
        }
    }

    openMainMenu() {
        if (!this.offCanvas) {
            slideDown(this.menu);
        } else {
            // Attivo la propietà overflow-y: auto; nel menu principale
            this.mainMenu.classList.add(this.IS_SELECTED);
            disableBodyScroll(this.mainWrap);
        }
        this.mainWrap.classList.add(this.MENU_ON);
        this.menuIsOpen = true;
    }

    closeSubmenu() {
        const submenuArray = Array.from(this.allSubmenu);
        for (const submenu of submenuArray) {
            submenu.classList.remove(this.ACTIVE);
        }

        const arrows = this.mainWrap.querySelectorAll(`.${this.ARROW_SUBMENU}`);
        const arrowsArray = Array.from(arrows);
        for (const arrow of arrowsArray) {
            arrow.classList.remove(this.ARROW_SELECTED);
        }

        if (mq.min(this.mediaQ)) {
            for (const submenu of submenuArray) {
                const style = {
                    display: '',
                };

                Object.assign(submenu.style, style);
            }
        } else {
            const submenuArray = Array.from(this.allSubmenu);
            for (const el of submenuArray) {
                if (!this.offCanvas) slideUp(el);
            }
        }
    }

    resizeMenu() {
        if (this.lastWindowsWidth != eventManager.windowsWidth()) {
            this.closeSubmenu();
            this.closeMainMenu(true);
        }
        this.lastWindowsWidth = eventManager.windowsWidth();

        const allSubmenu = Array.from(this.allSubmenu);
        for (const submenu of allSubmenu) {
            const style = {
                top: '',
            };
            Object.assign(submenu.style, style);
        }

        if (mq.max(this.mediaQ)) {
            for (const submenu of allSubmenu) {
                const style = {
                    left: '',
                    right: '',
                };
                Object.assign(submenu.style, style);
            }
        }
    }

    CloseOnScroll() {
        if (mq.max(this.mediaQ) && this.menuIsOpen) {
            this.closeSubmenu();
            this.closeMainMenu();
        }
    }
}
