import { eventManager } from "../base/eventManager.js";

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
            left: rect.left + window.scrollX,
        };
    return offset;
}
