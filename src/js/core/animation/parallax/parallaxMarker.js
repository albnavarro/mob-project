import { parallaxConstant } from './parallaxConstant.js';
import { handleFrame } from '../../events/rafutils/handleFrame.js';

export const parallaxMarker = ({
    startMarker,
    endMarker,
    startPoint,
    endPoint,
    screen,
    direction,
    invertSide,
    label,
}) => {
    // Creat emarker if not exist
    const { lastStartMarker, lastEndMarkerEl } = (() => {
        if (!startMarker && !endMarker) {
            // Replace illegal charachter with '-'
            const labelSanitized = label.replace(/^[^a-z]+|[^\w:.-]+/gi, '-');

            const startMarkerEL = document.createElement('span');
            startMarkerEL.className += `p-marker p-marker--start  p-marker-${labelSanitized}`;
            startMarkerEL.innerHTML = `start ${labelSanitized}`;

            const endMarkerEL = document.createElement('span');
            endMarkerEL.className += `p-marker p-marker--end  p-marker-${labelSanitized}`;
            endMarkerEL.innerHTML = `end ${labelSanitized}`;

            document.body.appendChild(startMarkerEL);
            document.body.appendChild(endMarkerEL);

            const startMarkerGenerated = document.querySelector(
                `.p-marker--start.p-marker-${labelSanitized}`
            );
            const endMarkerElGenerated = document.querySelector(
                `.p-marker--end.p-marker-${labelSanitized}`
            );
            return {
                lastStartMarker: startMarkerGenerated,
                lastEndMarkerEl: endMarkerElGenerated,
            };
        } else {
            return {
                lastStartMarker: startMarker,
                lastEndMarkerEl: endMarker,
            };
        }
    })();

    const style = {
        position: 'fixed',
        'z-index': '99999',
        background: 'red',
        'font-size': '14px',
        'white-space': 'nowrap',
    };

    const { top, right, bottom, left } = (() => {
        if (screen === window) {
            return {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
            };
        } else {
            const rect = screen.getBoundingClientRect();

            return {
                top: rect.top,
                right:
                    document.documentElement.clientWidth -
                    (rect.left + screen.offsetWidth),
                bottom: window.innerHeight - (rect.top + screen.offsetHeight),
                left: rect.left,
            };
        }
    })();

    const startStyle = (() => {
        if (direction === parallaxConstant.DIRECTION_VERTICAL) {
            return invertSide
                ? {
                      right: 0,
                      width: '100vw',
                      height: '2px',
                      top: `${startPoint + top}px`,
                      padding: '0 30px',
                      pointerEvents: 'none',
                  }
                : {
                      right: 0,
                      width: '100vw',
                      height: '2px',
                      bottom: `${startPoint + bottom}px`,
                      padding: '0 30px',
                      pointerEvents: 'none',
                  };
        } else {
            return invertSide
                ? {
                      top: 0,
                      height: '100vw',
                      width: '2px',
                      left: `${startPoint + left}px`,
                      padding: '30px 0',
                      pointerEvents: 'none',
                  }
                : {
                      top: 0,
                      height: '100vw',
                      width: '2px',
                      right: `${startPoint + right}px`,
                      padding: '30px 0',
                      pointerEvents: 'none',
                  };
        }
    })();

    const endStyle = (() => {
        if (direction === parallaxConstant.DIRECTION_VERTICAL) {
            return invertSide
                ? {
                      right: 0,
                      width: '100vw',
                      height: '2px',
                      top: `${startPoint + endPoint + top}px`,
                      padding: '0 30px',
                      pointerEvents: 'none',
                  }
                : {
                      right: 0,
                      width: '100vw',
                      height: '2px',
                      bottom: `${startPoint + endPoint + bottom}px`,
                      padding: '0 30px',
                      pointerEvents: 'none',
                  };
        } else {
            return invertSide
                ? {
                      top: 0,
                      height: '100vw',
                      width: '2px',
                      left: `${startPoint + endPoint + left}px`,
                      padding: '30px 0',
                      pointerEvents: 'none',
                  }
                : {
                      top: 0,
                      height: '100vw',
                      width: '2px',
                      right: `${startPoint + endPoint + right}px`,
                      padding: '30px 0',
                      pointerEvents: 'none',
                  };
        }
    })();

    handleFrame.add(() => {
        Object.assign(lastStartMarker.style, { ...style, ...startStyle });
        Object.assign(lastEndMarkerEl.style, { ...style, ...endStyle });
    });

    return {
        startMarker: lastStartMarker,
        endMarker: lastEndMarkerEl,
    };
};
