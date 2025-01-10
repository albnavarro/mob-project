// @ts-check

/**
 * @param {HTMLElement} element
 * @returns {number}
 *
 * @description
 * Return HTMLElement height with margin.
 */
export function outerHeight(element) {
    let height = element.offsetHeight;
    const style = getComputedStyle(element);

    height +=
        Number.parseInt(style.marginTop) + Number.parseInt(style.marginBottom);
    return height;
}

/**
 * @param {HTMLElement} element
 * @returns {number}
 *
 * @description
 * Return HTMLElement width with margin.
 */
export function outerWidth(element) {
    let width = element.offsetWidth;
    const style = getComputedStyle(element);

    width +=
        Number.parseInt(style.marginLeft) + Number.parseInt(style.marginRight);
    return width;
}

/**
 * @param {HTMLElement} element
 * @returns {{top: Number, left:Number}}
 *
 * @description
 * Return HTMLElement offset top/left value.
 */
export function offset(element) {
    const rect = element.getBoundingClientRect();
    const offset = {
        top: rect.top + window.pageYOffset,
        left: rect.left + window.pageXOffset,
    };

    return offset;
}

/**
 * @param {HTMLElement|Element} element
 * @returns {{bottom: Number, height:Number, left:Number, right:Number, top:Number, width:Number, x:Number, y:Number}}
 *
 * @description
 * Return HTMLElement position object.
 */
export function position(element) {
    const rect = element.getBoundingClientRect();

    return rect;
}

/**
 * @param {HTMLElement} element
 * @param {string} selector
 * @returns {Array.<ChildNode>}
 *
 * @description
 * Return sinblings of element by className
 */
export function getSiblings(element, selector) {
    // Setup siblings array and get the first sibling
    const siblings = [];
    let sibling = element?.parentNode?.firstChild;

    // Loop through each sibling and push to the array
    while (sibling) {
        if (
            sibling.nodeType === 1 &&
            sibling !== element && // @ts-ignore
            sibling.classList.contains(selector)
        ) {
            siblings.push(sibling);
        }
        sibling = sibling.nextSibling;
    }

    return siblings;
}

/**
 * @param {HTMLElement} element
 * @param {string} selector
 * @returns {Array.<ChildNode>}
 *
 * @description
 * Return all parent of element.
 */
export function getParents(element, selector) {
    // Set up a parent array
    const parents = [];

    // Push each parent element to the array
    // @ts-ignore
    for (; element && element !== document; element = element.parentNode) {
        if (selector) {
            if (element.classList.contains(selector)) {
                parents.push(element);
            }
            continue;
        }
        parents.push(element);
    }

    // Return our parent array
    return parents;
}

/**
 * @param {HTMLElement|undefined} parent
 * @param {HTMLElement|undefined} child
 * @returns {boolean}
 *
 * @description
 * Check if child is descendant od parent.
 */
export function isDescendant(parent, child) {
    let node = child?.parentNode;
    while (node) {
        if (node === parent) return true;
        node = node?.parentNode;
    }
    return false;
}

/**
 * @param {HTMLElement} element
 * @returns {{x:number, y:number, z:number}|undefined}
 *
 * @description
 * Gets computed translate values
 */
export function getTranslateValues(element) {
    const style = globalThis.getComputedStyle(element);
    const matrix =
        // @ts-ignore
        style['transform'] || style.mozTransform;

    // No transform property. Simply return 0 values.
    if (matrix === 'none' || matrix === undefined) {
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

/**
 * @param {Element} element
 * @returns {boolean}
 *
 * @description
 * Returns true if it is a DOM node
 */
export function isNode(element) {
    return typeof Node === 'object'
        ? element instanceof Node
        : element &&
              typeof element === 'object' &&
              typeof element.nodeType === 'number' &&
              typeof element.nodeName === 'string';
}

/**
 * @param {Element} element
 * @returns {boolean}
 *
 * @description
 * Returns true if it is a DOM element
 */
export function isElement(element) {
    return typeof HTMLElement === 'object'
        ? element instanceof HTMLElement //DOM2
        : element &&
              typeof element === 'object' &&
              element !== null &&
              element.nodeType === 1 &&
              typeof element.nodeName === 'string';
}

/**
 * @returns {string}
 *
 * @description
 * Generate univoque string id
 */
export const getUnivoqueId = () => {
    return `_${Math.random().toString(36).slice(2, 9)}`;
};

/**
 * @param {HTMLElement} element
 * @returns {boolean}
 */
export function isVisibleInViewport(element) {
    const elementStyle = globalThis.getComputedStyle(element);
    //Particular cases when the element is not visible at all
    if (
        elementStyle.height == '0px' ||
        elementStyle.display == 'none' ||
        elementStyle.opacity == '0' ||
        elementStyle.visibility == 'hidden' ||
        elementStyle.clipPath == 'circle(0px at 50% 50%)' ||
        elementStyle.transform == 'scale(0)' ||
        element.hasAttribute('hidden')
    ) {
        return false;
    }

    const rect = element.getBoundingClientRect();

    //Overlapping strict check
    const baseElementLeft = rect.left;
    const baseElementTop = rect.top;

    const elementFromStartingPoint = document.elementFromPoint(
        baseElementLeft,
        baseElementTop
    );

    if (
        elementFromStartingPoint !== null &&
        !element.isSameNode(elementFromStartingPoint)
    ) {
        const elementZIndex = elementStyle.zIndex;
        const elementOverlappingZIndex = globalThis.getComputedStyle(
            elementFromStartingPoint
        ).zIndex;

        if (Number(elementZIndex) < Number(elementOverlappingZIndex)) {
            return false;
        }

        if (
            elementZIndex === '' &&
            elementOverlappingZIndex === '' /**
        		If two positioned elements overlap without a z-index specified, the element 
			positioned last in the HTML code will be shown on top 
        		**/ &&
            element.compareDocumentPosition(elementFromStartingPoint) &
                Node.DOCUMENT_POSITION_FOLLOWING
        ) {
            return false;
        }
    }

    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <=
            (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <=
            (window.innerWidth || document.documentElement.clientWidth)
    );
}
