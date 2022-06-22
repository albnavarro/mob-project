import {
    disableBodyScroll,
    enableBodyScroll,
    clearAllBodyScrollLocks,
} from 'body-scroll-lock';

import {
    slideUpDownReset,
    slideUp,
    slideDown,
} from '../../../js/utility/animation.js';

import { modernzier } from '../../../js/utility/modernizr.js';

import {
    outerHeight,
    outerWidth,
    offset,
    getParents,
    getSiblings,
    mobbu,
} from '../../../js/core';

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
        this.firstLevelmenuData = [];
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

        this.lastWindowsWidth = window.innerWidth;
        this.getSubmenuWidth();
        this.getToggleWrapHeight();
        this.addArrow();
        this.setData();
        this.resizeMenu();
        this.addHandler();
        this.resetSubmenuHeight();

        mobbu.use('resize', () => {
            this.getSubmenuWidth();
            this.getToggleWrapHeight();
            this.resizeMenu();
            this.resetSubmenuHeight();
        });

        if (this.direction == 'horizontal') {
            this.SetPosition();

            mobbu.use('resize', () => {
                this.SetPosition();
            });
        }
    }

    // utils for mobile accordion menu slideUp/Down init
    resetSubmenuHeight() {
        if (mobbu.mq('max', this.mediaQ) && !this.offCanvas) {
            slideUpDownReset(this.menu);

            const targetArray = Array.from(this.allSubmenu);

            targetArray.forEach((item, i) => {
                slideUpDownReset(item);
                item.setAttribute('node-id', i);
            });
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
            this.maxLevel = [...this.submenu].reduce((p, c) => {
                const numSubmenuParents = getParents(c, context.SUB_MENU)
                    .length;
                return numSubmenuParents > p ? numSubmenuParents : p;
            }, 1);
            this.totalWidth = 0;
        }

        this.firstLevelmenuData = [...this.firstLevelItem].map((item) => {
            return new obj(item, this);
        });
    }

    addArrow() {
        // DESKTOP TOUCH SHOW SUBMENU
        [...this.itemHasChildren].forEach((item, i) => {
            const arrow = document.createElement('div');
            arrow.classList.add(this.ARROW_SUBMENU);
            item.insertBefore(arrow, item.firstChild);
        });
    }

    addHandler() {
        if (
            (!this.offCanvas && mobbu.mq('max', this.mediaQ)) ||
            Modernizr.touchevents
        ) {
            this.body.addEventListener('click', (event) =>
                this.bodyOnCLick(event)
            );
        }

        const arrows = this.mainWrap.querySelectorAll(`.${this.ARROW_SUBMENU}`);
        [...arrows].forEach((item, i) => {
            item.addEventListener('click', (event) => this.arrowOnClick(event));
        });

        this.toggle.addEventListener('click', () => this.toggleOnCLick());
        this.offCanvasBackButton.addEventListener('click', () =>
            this.offCanvasBack()
        );
    }

    offCanvasBack() {
        if (mobbu.mq('min', this.mediaQ)) return;

        const selectedMenu = [...this.allSubmenu].filter((element) => {
            return element.classList.contains('is-selected');
        });

        // Controllo se devo chiudere un submenu o il menu principale
        if (selectedMenu.length > 0) {
            [...selectedMenu].forEach((item, i) => {
                item.classList.remove(this.ACTIVE);
                item.classList.remove(this.IS_SELECTED);

                // Rimuovo la propietà overflow-y dal menu che vado a chiudere
                // Resetto un eventuale scroll nel menu un attimo dopo.
                // Il setTimeout viene usato per estetica, resetto lo scroll topo solo a menu chiuso
                setTimeout(() => {
                    item.scrollTop = 0;
                }, 350);

                // Constrollo a quale Submenu/menu (parente) attivare la propietà overflow-y: auto;
                // Solo il menu/submenu selezionato può scrollare
                const parentMenu = item.closest(
                    `.${this.SUB_MENU}.${this.ACTIVE}`
                );

                if (typeof parentMenu != 'undefined' && parentMenu != null) {
                    parentMenu.classList.add(this.IS_SELECTED);
                } else {
                    this.mainMenu.classList.add(this.IS_SELECTED);
                }
                ///////////
            });
        } else {
            this.closeMainMenu();
        }
    }

    bodyOnCLick(event) {
        const parents = getParents(event.target, this.NAV_WRAP);
        if (parents.length) return;

        this.closeSubmenu();
        if (mobbu.mq('max', this.mediaQ) && this.menuIsOpen) {
            this.closeMainMenu();
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
        if (!Modernizr.touchevents && mobbu.mq('min', this.mediaQ)) return;

        const menuType = this.offCanvas ? 'IS_OFFCANVAS' : 'IS_ACCORDION';
        const targetArrow = event.currentTarget;
        const closestMenuItem = targetArrow.closest(`.${this.MENU_ITEM}`);

        // Find the first submenu children of closestMenuItem with a querySelector
        // TODO: find more robust way to ind nearest submenu
        const closestSubmenu = closestMenuItem.querySelector(
            `.${this.SUB_MENU}`
        );
        const subMenuStatus = closestSubmenu.classList.contains(this.ACTIVE)
            ? 'SUBMENU_IS_OPEN'
            : 'SUBMENU_IS_CLOSE';

        // Remove active class form all submenu leaving out active submenu
        [...this.allSubmenu].forEach((item, i) => {
            if (item !== closestSubmenu) {
                item.classList.remove(this.ACTIVE);
            }
        });

        // add active class on partents submenu
        // get parents submenu
        const parentSubmenus = getParents(closestMenuItem, this.SUB_MENU);
        [...parentSubmenus].forEach((item, i) => {
            item.classList.add(this.ACTIVE);
        });

        // get parents arrow
        const parentsArrow = [...parentSubmenus]
            .map((item) => {
                return getSiblings(item, this.ARROW_SUBMENU);
            })
            .flat();

        // Remove active class form all arrows leaving out active arrow
        const arrowSubMenu = this.componentWrapper.querySelectorAll(
            `.${this.ARROW_SUBMENU}`
        );

        [...arrowSubMenu].forEach((item, i) => {
            if (item !== targetArrow) {
                item.classList.remove(this.ARROW_SELECTED);
            }
        });

        // add active class on partents arrow
        [...parentsArrow].forEach((item, i) => {
            item.classList.add(this.ARROW_SELECTED);
        });

        if (menuType === 'IS_ACCORDION') {
            // Slide Up submenu not active
            const allSubmenuId = [...this.allSubmenu].map((item) => {
                return item.getAttribute('node-id');
            });

            const parentSubmenusId = [...parentSubmenus].map((item) => {
                return item.getAttribute('node-id');
            });

            const submenuToClose = [...allSubmenuId].filter(
                (item) => !parentSubmenusId.includes(item)
            );

            [...submenuToClose].forEach((item, i) => {
                const el = document.querySelector(`[node-id="${item}"]`);
                if (typeof el != 'undefined' && el != null) {
                    slideUp(el);
                }
            });
        }

        // OPEN/CLOSE
        switch (subMenuStatus) {
            case 'SUBMENU_IS_OPEN':
                closestSubmenu.classList.remove(this.ACTIVE);
                targetArrow.classList.remove(this.ARROW_SELECTED);

                switch (menuType) {
                    case 'IS_ACCORDION':
                        slideUp(closestSubmenu);
                        break;
                }

                break;

            case 'SUBMENU_IS_CLOSE':
                closestSubmenu.classList.add(this.ACTIVE);
                targetArrow.classList.add(this.ARROW_SELECTED);

                switch (menuType) {
                    case 'IS_OFFCANVAS':
                        this.mainMenu.classList.remove(this.IS_SELECTED);

                        [...this.allSubmenu].forEach((item, i) => {
                            if (item !== closestSubmenu) {
                                item.classList.remove(this.IS_SELECTED);
                            }
                        });

                        // Attivo la propietà overflow-y: auto; nel menu selezionato
                        closestSubmenu.classList.add(this.IS_SELECTED);

                        // Posiziono il menu in verticale rispetto al menu parente;
                        const gap = (() => {
                            if (parentSubmenus.length) {
                                const parent =
                                    parentSubmenus[parentSubmenus.length - 1];
                                return parent.scrollTop;
                            } else {
                                return this.mainMenu.scrollTop;
                            }
                        })();

                        if (mobbu.mq('max', this.mediaQ))
                            closestSubmenu.style.top = `${gap}px`;
                        break;

                    case 'IS_ACCORDION':
                        slideDown(closestSubmenu);
                        break;
                }
                break;
        }
    }

    SetPosition() {
        if (mobbu.mq('min', this.mediaQ)) {
            this.firstLevelmenuData.forEach((el, index) => {
                el.parentItemPos = parseInt(offset(el.parentItem).left);
                el.totalWidth =
                    el.parentItemPos + el.maxLevel * this.subMenuWidth;

                if (el.totalWidth > window.innerWidth) {
                    el.item.style.right = '0';
                    el.item.style.left = 'auto';

                    [...el.submenu].forEach((item, i) => {
                        item.style.right = '100%';
                        item.style.left = 'auto';
                    });
                } else {
                    el.item.style.right = 'auto';
                    el.item.style.left = '0';

                    [...el.submenu].forEach((item, i) => {
                        item.style.right = 'auto';
                        item.style.left = '100%';
                    });
                }
            });
        }
    }

    closeMainMenu(immediate) {
        this.mainWrap.classList.remove(this.MENU_ON);
        this.menuIsOpen = false;
        enableBodyScroll(this.mainWrap);

        if (mobbu.mq('max', this.mediaQ) && !this.offCanvas) {
            slideUp(this.menu);
        }

        // Azzero lo scroll top di tutti i menu
        this.mainMenu.scrollTop = 0;

        [...this.allSubmenu].forEach((item, i) => {
            item.scrollTop = 0;
            item.classList.remove(this.ACTIVE);
            // Rimuovo la propietà overflow-y dal menu che vado a chiudere
            item.classList.remove(this.IS_SELECTED);
        });
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
        [...this.allSubmenu].forEach((item, i) => {
            item.classList.remove(this.ACTIVE);
        });

        const arrows = this.mainWrap.querySelectorAll(`.${this.ARROW_SUBMENU}`);
        [...arrows].forEach((item, i) => {
            item.classList.remove(this.ARROW_SELECTED);
        });

        if (mobbu.mq('min', this.mediaQ)) {
            [...this.allSubmenu].forEach((item, i) => {
                item.style.display = '';
            });
        } else {
            [...this.allSubmenu].forEach((item, i) => {
                if (!this.offCanvas) slideUp(item);
            });
        }
    }

    resizeMenu() {
        if (this.lastWindowsWidth != window.innerWidth) {
            this.closeSubmenu();
            this.closeMainMenu(true);
        }
        this.lastWindowsWidth = window.innerWidth;

        [...this.allSubmenu].forEach((item, i) => {
            item.style.top = '';
        });

        if (mobbu.mq('max', this.mediaQ)) {
            [...this.allSubmenu].forEach((item, i) => {
                item.style.left = '';
                item.style.right = '';
            });
        }
    }

    CloseOnScroll() {
        if (mobbu.mq('max', this.mediaQ) && this.menuIsOpen) {
            this.closeSubmenu();
            this.closeMainMenu();
        }
    }
}
