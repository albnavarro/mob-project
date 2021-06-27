import { eventManager } from "../../../js/base/eventManager.js";
import { lightDescription } from "./lightbox-description.js";
import { lightboxUtils } from "./lightbox-utils.js";

class lightBoxVideoClass {

    constructor() {
        this.onResizeId = -1;
    }

    init({wrapper, title, description, sourceType, url, hGap, wGap, ratioW, ratioH}) {
        eventManager.remove('resize', this.onResizeId)

        const videoEl = document.createElement('div');
        videoEl.classList.add('lightbox__video');

        this.setVideoSize(wrapper, hGap, wGap, ratioW, ratioH)

        wrapper.appendChild(videoEl);
        const videoWrapper = wrapper.querySelector('.lightbox__video');

        setTimeout(() => {
            switch (sourceType) {
                case 'youtube':
                    const iframe = document.createElement('iframe');
                    iframe.src = `https://www.youtube.com/embed/${url }`;
                    iframe.setAttribute('allowfullscreen', '');
                    iframe.setAttribute('frameborder', '0');
                    videoWrapper.appendChild(iframe);
                break;

                case 'local':
                    const video = document.createElement('video');
                    video.setAttribute('controls', '');
                    video.setAttribute('autoplay', '');
                    video.setAttribute('loop', '');

                    const source = document.createElement('source');
                    source.setAttribute('type', 'video/mp4');
                    source.src = url;

                    videoWrapper.appendChild(video);
                    const videoEl = videoWrapper.querySelector('video');
                    videoEl.appendChild(source);
                break;

            }

            videoWrapper.classList.add('visible');
        }, 200);

        this.onResizeId = eventManager.push('resize', () => this.setVideoSize(wrapper, hGap, wGap, ratioW, ratioH))
        this.openDescription(title, description, wrapper);
    }

    setVideoSize(wrapper, hGap, wGap, ratioW, ratioH) {
        // WW and WH gap
        const newHGap = (eventManager.windowsHeight() / 100) * parseInt(hGap);
        const newWGap = (eventManager.windowsWidth() / 100) * parseInt(wGap);

        const maxHeight = eventManager.windowsHeight() - newHGap,
            maxWidth = eventManager.windowsWidth() - newWGap,
            width = ratioW,
            height = ratioH,
            ratio = lightboxUtils.calculateAspectRatioFit(width, height, maxWidth, maxHeight);

        const style = {
            'width': ratio.width + 'px',
            'height': ratio.height + 'px'
        };
        Object.assign(wrapper.style, style);
    }

    openDescription(title, description, wrapper) {
        lightDescription.init({
            title,
            description,
            wrapper
        })
    }

}

export const lightBoxVideo = new lightBoxVideoClass()
