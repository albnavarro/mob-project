import { lightDescription } from './lightbox-description.js';
import { lightboxUtils } from './lightbox-utils.js';
import { useResize } from '.../../../js/core/events/resizeUtils/useResize.js';

class LightBoxVideoClass {
    constructor() {
        this.unsubscribeResize = () => {};
    }

    init({
        wrapper,
        title,
        description,
        sourceType,
        url,
        hGap,
        wGap,
        ratioW,
        ratioH,
    }) {
        this.unsubscribeResize();

        const videoEl = document.createElement('div');
        videoEl.classList.add('lightbox__video');

        this.setVideoSize(wrapper, hGap, wGap, ratioW, ratioH);

        wrapper.appendChild(videoEl);
        const videoWrapper = wrapper.querySelector('.lightbox__video');

        setTimeout(() => {
            switch (sourceType) {
                case 'youtube':
                    const iframe = document.createElement('iframe');
                    iframe.src = `https://www.youtube.com/embed/${url}`;
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

        this.unsubscribeResize = useResize(() => {
            this.setVideoSize(wrapper, hGap, wGap, ratioW, ratioH);
        });

        this.openDescription(title, description, wrapper);
    }

    setVideoSize(wrapper, hGap, wGap, ratioW, ratioH) {
        // WW and WH gap
        const newHGap = (window.innerHeight / 100) * parseInt(hGap);
        const newWGap = (window.innerWidth / 100) * parseInt(wGap);
        const maxHeight = window.innerHeight - newHGap;
        const maxWidth = window.innerWidth - newWGap;
        const width = ratioW;
        const height = ratioH;
        const { ratioWidth, ratioHeight } =
            lightboxUtils.calculateAspectRatioFit(
                width,
                height,
                maxWidth,
                maxHeight
            );

        const style = {
            width: `${ratioWidth}px`,
            height: `${ratioHeight}px`,
        };
        Object.assign(wrapper.style, style);
    }

    openDescription(title, description, wrapper) {
        lightDescription.init({
            title,
            description,
            wrapper,
        });
    }
}

export const lightBoxVideo = new LightBoxVideoClass();
