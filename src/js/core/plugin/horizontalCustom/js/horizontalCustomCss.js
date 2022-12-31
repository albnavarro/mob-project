// let horizontalCustomCssIsAlive = false;
import { mq } from '../../../utils/mediaManager.js';

export const horizontalCustomCss = ({
    queryType,
    breackpoint,
    container,
    trigger,
    row,
    column,
    shadow,
}) => {
    // if (horizontalCustomCssIsAlive) return;
    // horizontalCustomCssIsAlive = true;
    const media = mq.getBreackpoint(breackpoint);

    const css = `
      @media (${queryType}-width:${media}px){${container}{position:relative}}@media (${queryType}-width:${media}px){${trigger}{z-index:10;position:absolute;pointer-events:none;overflow:hidden;top:0;left:0;right:0}}@media (${queryType}-width:${media}px){${row}{--sectionheight:100vh}}@media (${queryType}-width:${media}px){${row}{display:flex;height:var(--sectionheight)}}@media (${queryType}-width:${media}px){${column}{height:var(--sectionheight);flex:0 0 auto}}.${shadow}{display:none}@media (${queryType}-width:${media}px){.${shadow}{width:100%;display:block;pointer-events:none}}.${shadow}{display:none}@media (${queryType}-width:${media}px){.${shadow}{pointer-events:none;display:block;position:absolute;left:0;right:0}.${shadow}--end,.${shadow}--in-center,.${shadow}--left,.${shadow}--out-center{opacity:0;border:1px red dashed;width:25%}.${shadow}--end.debug,.${shadow}--in-center.debug,.${shadow}--left.debug,.${shadow}--out-center.debug{opacity:1}.${shadow}--in-center{position:absolute;top:0;right:0;padding:0 40px;text-align:center}.${shadow}--out-center{position:absolute;top:0;right:0;padding:0 40px;text-align:center}.${shadow}--left{position:absolute;top:0;left:50%;transform:translateX(-50%);padding:0 40px;text-align:center}.${shadow}--end{position:absolute;top:0;left:0;padding-left:40px}}`;

    const head = document.head;
    const style = document.createElement('style');
    head.appendChild(style);
    style.appendChild(document.createTextNode(css));
};
