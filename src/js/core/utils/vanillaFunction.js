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
        top: rect.top + window.pageYOffset,
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

/**
 * Gets computed translate values
 * @param {HTMLElement} element
 * @returns {Object}
 */

export function getTranslateValues(element) {
    const style = window.getComputedStyle(element);
    const matrix =
        style['transform'] || style.webkitTransform || style.mozTransform;

    // No transform property. Simply return 0 values.
    if (matrix === 'none' || typeof matrix === 'undefined') {
        return {
            x: 0,
            y: 0,
            z: 0,
        };
    }

    // Can either be 2d or 3d transform
    const matrixType = matrix.includes('3d') ? '3d' : '2d';
    const matrixValues = matrix.match(/matrix.*\((.+)\)/)[1].split(', ');

    // 2d matrices have 6 values
    // Last 2 values are X and Y.
    // 2d matrices does not have Z value.
    if (matrixType === '2d') {
        return {
            x: matrixValues[4],
            y: matrixValues[5],
            z: 0,
        };
    }

    // 3d matrices have 16 values
    // The 13th, 14th, and 15th values are X, Y, and Z
    if (matrixType === '3d') {
        return {
            x: matrixValues[12],
            y: matrixValues[13],
            z: matrixValues[14],
        };
    }
}

//Returns true if it is a DOM node
export function isNode(o) {
    return typeof Node === 'object'
        ? o instanceof Node
        : o &&
              typeof o === 'object' &&
              typeof o.nodeType === 'number' &&
              typeof o.nodeName === 'string';
}

//Returns true if it is a DOM element
export function isElement(o) {
    return typeof HTMLElement === 'object'
        ? o instanceof HTMLElement //DOM2
        : o &&
              typeof o === 'object' &&
              o !== null &&
              o.nodeType === 1 &&
              typeof o.nodeName === 'string';
}
