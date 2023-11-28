// let horizontalCustomCssIsAlive = false;
import { mq } from '../../../utils/mediaManager.js';
import { horizontalScrollerContstant } from './horizontalScrollerConstant.js';

const getAlign = (columnAlign) => {
    switch (columnAlign) {
        case horizontalScrollerContstant.END: {
            return 'align-items:flex-end;';
        }

        case horizontalScrollerContstant.CENTER: {
            return 'align-items:center;';
        }

        default: {
            return 'align-items:flex-start;';
        }
    }
};

export const horizontalScrollerCss = ({
    mainContainer,
    queryType,
    breakpoint,
    container,
    trigger,
    row,
    column,
    shadow,
    useSticky,
    columnHeight,
    columnWidth,
    columnAlign,
}) => {
    // if (horizontalCustomCssIsAlive) return;
    // horizontalCustomCssIsAlive = true;
    const media = mq.getBreackpoint(breakpoint);

    /**
     * Add if
     */
    const userSelect = `user-select:none`;

    const triggerPosition = useSticky ? 'relative' : 'absolute';
    const rowSticky = useSticky ? 'position:sticky;top:0;' : '';
    const align = getAlign(columnAlign);

    const width = columnWidth ? `width:${columnWidth}vw;` : '';

    const css = `
      @media (${queryType}-width:${media}px){${container}{position:relative;${userSelect}}}@media (${queryType}-width:${media}px){${trigger}{z-index:10;position:${triggerPosition};pointer-events:none;overflow:hidden;top:0;left:0;right:0}}@media (${queryType}-width:${media}px){${row}{--sectionheight:${columnHeight}vh}}@media (${queryType}-width:${media}px){${row}{display:flex;height:100vh;${rowSticky}${align}}}@media (${queryType}-width:${media}px){${column}{height:var(--sectionheight);flex:0 0 auto;${width}}}.${shadow}{display:none}@media (${queryType}-width:${media}px){.${shadow}{width:100%;display:block;pointer-events:none}}.${shadow}{display:none}@media (${queryType}-width:${media}px){.${shadow}{pointer-events:none;display:block;position:absolute;left:0;right:0}.${shadow}--end,.${shadow}--in-center,.${shadow}--left,.${shadow}--out-center{opacity:0;border:1px red dashed;width:25%}.${shadow}--end.debug,.${shadow}--in-center.debug,.${shadow}--left.debug,.${shadow}--out-center.debug{opacity:1}.${shadow}--in-center{position:absolute;top:0;right:0;padding:0 40px;text-align:center}.${shadow}--out-center{position:absolute;top:0;right:0;padding:0 40px;text-align:center}.${shadow}--left{position:absolute;top:0;left:50%;transform:translateX(-50%);padding:0 40px;text-align:center}.${shadow}--end{position:absolute;top:0;left:0;padding-left:40px}}`;

    const styleDiv = document.createElement('div');
    styleDiv.classList.add('scroller-style');
    const style = document.createElement('style');
    style.append(document.createTextNode(css));
    styleDiv.append(style);
    mainContainer.prepend(styleDiv);
};
