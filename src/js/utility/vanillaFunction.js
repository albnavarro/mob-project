import { eventManager } from '../base/eventManager.js';

export function outerHeight(el) {
    let height = el.offsetHeight;
    const style = getComputedStyle(el);

    height += parseInt(style.marginTop) + parseInt(style.marginBottom);
    return height;
}

export function outerWidth(el) {
    let width = el.offsetWidth;
    const style = getComputedStyle(el);

    width += parseInt(style.marginLeft) + parseInt(style.marginRight);
    return width;
}

export function offset(el) {
    const rect = el.getBoundingClientRect();
    const offset = {
        top: rect.top + eventManager.scrollTop(),
        left: rect.left + window.pageXOffset,
    };

    return offset;
}

export function position(el) {
    const rect = el.getBoundingClientRect();

    return rect;
}

export function getSiblings(elem, selector) {
    // Setup siblings array and get the first sibling
    var siblings = [];
    var sibling = elem.parentNode.firstChild;

    // Loop through each sibling and push to the array
    while (sibling) {
        if (sibling.nodeType === 1 && sibling !== elem) {
            if (sibling.classList.contains(selector)) {
                siblings.push(sibling);
            }
        }
        sibling = sibling.nextSibling;
    }

    return siblings;
}

export function getParents(elem, selector) {
    // Set up a parent array
    var parents = [];

    // Push each parent element to the array
    for (; elem && elem !== document; elem = elem.parentNode) {
        if (selector) {
            if (elem.classList.contains(selector)) {
                parents.push(elem);
            }
            continue;
        }
        parents.push(elem);
    }

    // Return our parent array
    return parents;
}

export function isDescendant(parent, child) {
    var node = child.parentNode;
    while (node != null) {
        if (node == parent) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
}

export const simulateClick = function (elem) {
    // Create our event (with options)
    var evt = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window,
    });
    // If cancelled, don't dispatch our event
    var canceled = !elem.dispatchEvent(evt);
};
