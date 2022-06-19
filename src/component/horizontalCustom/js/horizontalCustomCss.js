import { mq } from '../../../js/core';

let horizontalCustomCssIsAlive = false;

export const horizontalCustomCss = (queryType, breackpoint) => {
    if (horizontalCustomCssIsAlive) return;
    horizontalCustomCssIsAlive = true;
    const media = mq.getBreackpoint(breackpoint);

    const css = `
      @media (${queryType}-width:${media}px){.scroller{position:relative}}@media (${queryType}-width:${media}px){.scroller__trigger{z-index:10;position:absolute;pointer-events:none;overflow:hidden;top:0;left:0;right:0}}@media (${queryType}-width:${media}px){.scroller__row{--sectionheight:100vh}}@media (${queryType}-width:${media}px){.scroller__row{display:flex;height:var(--sectionheight)}}@media (${queryType}-width:${media}px){.scroller__section{height:var(--sectionheight);flex:0 0 auto}}.scroller__shadowEl{display:none}@media (${queryType}-width:${media}px){.scroller__shadowEl{width:100%;display:block;pointer-events:none}}.scroller__shadow{display:none}@media (${queryType}-width:${media}px){.scroller__shadow{pointer-events:none;display:block;position:absolute;left:0;right:0}.scroller__shadow__end,.scroller__shadow__in-center,.scroller__shadow__left,.scroller__shadow__out-center{opacity:0;border:1px red dashed;width:25%}.scroller__shadow__end.debug,.scroller__shadow__in-center.debug,.scroller__shadow__left.debug,.scroller__shadow__out-center.debug{opacity:1}.scroller__shadow__in-center{position:absolute;top:0;right:0;padding:0 40px;text-align:center}.scroller__shadow__out-center{position:absolute;top:0;right:0;padding:0 40px;text-align:center}.scroller__shadow__left{position:absolute;top:0;left:50%;transform:translateX(-50%);padding:0 40px;text-align:center}.scroller__shadow__end{position:absolute;top:0;left:0;padding-left:40px}}`;

    const head = document.head;
    const style = document.createElement('style');
    head.appendChild(style);
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
};
