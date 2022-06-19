import { modernzier } from '../../../js/utility/modernizr.js';
import { outerWidth, offset, getParents, getSiblings } from '../../../js/core';

class toolTipClass {
    constructor() {
        this.bnt = document.querySelectorAll('.js-tooltip');
        this.body = document.querySelector('body');
        this.lastToolTip = null;
        this.overTool = false;
    }

    init() {
        this.addHandler();
    }

    addHandler() {
        const btnArray = Array.from(this.bnt);
        for (const btn of btnArray) {
            btn.addEventListener('click', this.onClick.bind(this));
            btn.addEventListener('mouseover', this.onMouseOver.bind(this));
            btn.addEventListener('mouseout', this.onMouseOut.bind(this));
        }

        this.body.addEventListener('click', this.bodyOnCLick.bind(this));
    }

    onClick(event) {
        event.preventDefault();

        if (Modernizr.touchevents) {
            if (event.target.classList.contains('tooltip')) {
                this.addTollTip(event.target, event);
            }
        }
    }

    onMouseOver(event) {
        if (!Modernizr.touchevents) {
            // Controllo che non passi sopra il toolotip per non chiuderlo
            const currentTarget = event.currentTarget;

            if (
                !currentTarget.classList.contains('tooltip-pop') &&
                !this.overTool
            ) {
                this.addTollTip(currentTarget, event);
                this.overTool = true;
            }
        }
    }

    onMouseOut(event) {
        // Controllo che non passi sopra il toolotip per non chiuderlo
        // event.relatedTarget = elemento di atterragio del mouseOut
        const realtedTarget = event.relatedTarget;
        const parents = getParents(realtedTarget, 'tooltip-pop');

        if (typeof realtedTarget === 'undefined' || realtedTarget === null)
            return;

        // Chiudo il PopUp solo se non passo dal btn al PopUp aperto
        if (
            !Modernizr.touchevents &&
            !realtedTarget.classList.contains('tooltip-pop') &&
            parents.length == 0
        ) {
            this.resetTooltip();
            this.overTool = false;
        } else if (
            !Modernizr.touchevents &&
            realtedTarget.classList.contains('tooltip-pop')
        ) {
            // Altrimenti agiungo un listener al popUp per vedere quando esco dallo stesso
            this.overTool = true;

            // REMOVE LISTERNER
            const clonedNode = realtedTarget.cloneNode(true);
            const parent = realtedTarget.parentNode;
            parent.replaceChild(clonedNode, realtedTarget);
            // ADD LISTENER
            const tooltip = parent.querySelector('.tooltip-pop');
            tooltip.addEventListener('mouseout', this.outOfPopUp.bind(this));
        }
    }

    outOfPopUp(event) {
        const target = event.currentTarget;
        const realtedTarget = event.relatedTarget;

        const parents = getParents(realtedTarget, 'tooltip-pop');
        const siblings = getSiblings(realtedTarget, 'tooltip-pop');

        // Non chiudo il PopUp se:
        if (
            // Se entro dentro un sottoelemento del popUp ( es. un link )
            parents.length > 0 ||
            // Se da un sottoelemento del popUp torno nel popUp
            realtedTarget.classList.contains('tooltip-pop') ||
            // Se dal pop up entro nel bottone che lo ha aperto
            (realtedTarget.classList.contains('tooltip') &&
                siblings.length == 1)
        )
            return;

        // Altrimenti chiudo il popUp:
        const clonedNode = target.cloneNode(true);
        const parent = target.parentNode;
        parent.replaceChild(clonedNode, target);

        this.resetTooltip();
        this.overTool = false;
    }

    bodyOnCLick(event) {
        const target = event.target;
        const parentToolTip = getParents(target, 'tooltip-pop');

        if (
            !target.classList.contains('tooltip') &&
            parentToolTip.length == 0 &&
            !target.classList.contains('tooltip-pop')
        ) {
            this.resetTooltip();
        }
    }

    addTollTip(item, event) {
        const data = item.getAttribute('data-tooltip');
        const toolTipPop = document.createElement('div');
        const toolTipPopInner = document.createElement('div');
        toolTipPop.classList.add('tooltip-pop');
        toolTipPopInner.classList.add('tooltip-pop__inner');
        toolTipPopInner.innerHTML = data;
        toolTipPop.appendChild(toolTipPopInner);

        if (
            typeof this.lastToolTip != 'undefined' &&
            this.lastToolTip != null
        ) {
            if (this.lastToolTip !== item) {
                this.resetTooltip();
            }
        }

        if (event.target.classList.contains('tooltip')) {
            if (!item.classList.contains('tooltip-active')) {
                item.classList.add('tooltip-active');

                // PARENT
                const wrapper = item.parentNode;
                wrapper.appendChild(toolTipPop);

                const toolTip = wrapper.querySelector('.tooltip-pop');
                const toolTipPosX = offset(toolTip).left;
                const toolTipPosY = offset(toolTip).top;
                const toolTipPosWidth = outerWidth(toolTip);

                if (toolTipPosX + toolTipPosWidth >= window.innerWidth) {
                    toolTip.classList.add('tooltip-pop--is-right');
                }

                if (toolTipPosY - window.pageYOffset < 0) {
                    toolTip.classList.add('tooltip-pop--is-bottom');
                }

                toolTip.classList.add('active');
                this.lastToolTip = item;
            } else {
                item.classList.remove('tooltip-active');

                const parent = item.parentNode;
                const toolTipAdded = parent.querySelector('.tooltip-pop');
                parent.removeChild(toolTipAdded);
            }
        }
    }

    resetTooltip() {
        if (
            typeof this.lastToolTip != 'undefined' &&
            this.lastToolTip != null
        ) {
            this.lastToolTip.classList.remove('tooltip-active');

            const allTootTip = document.querySelectorAll('.tooltip-pop');
            const allToolTopArray = Array.from(allTootTip);

            for (const element of allToolTopArray) {
                const parent = element.parentNode;
                parent.removeChild(element);
            }

            this.lastToolTip = null;
        }
    }
}

export const toolTip = new toolTipClass();
