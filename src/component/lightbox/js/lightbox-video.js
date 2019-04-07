class lightBoxVideoClass {

  constructor() {
    if(!lightBoxVideoClass.instance){
      lightBoxVideoClass.instance = this;
      this.$ = {
        _data: {},
        onResizeId: -1
      }
    }
    return lightBoxVideoClass.instance;
  }

  init(data) {
    this.$._data = data;
    eventManager.remove('resize', this.$.onResizeId)
    const $videoContainer = '<div class="video-container"></div>';

    this.setVideoSize()

    this.$._data.$content.html($videoContainer);
    const $video = $('.video-container');

    setTimeout(() => {
      $video.html(`<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${this.$._data.url }" frameborder="0" allowfullscreen></iframe>`)
      $video.addClass('visible');
    }, 200);

    this.$.onResizeId = eventManager.push('resize', this.setVideoSize.bind(this))
    this.openDescription(this.$._data);
  }

  setVideoSize() {
    const maxHeight = eventManager.windowsHeight() - eventManager.windowsHeight()/3,
          maxWidth = eventManager.windowsWidth() - eventManager.windowsWidth()/3,
          width = this.$._data.ratioW,
          height = this.$._data.ratioH,
          ratio = lightboxCommonDynamic.calculateAspectRatioFit(width,height,maxWidth,maxHeight);

    this.$._data.$content.css("width", ratio.width);
    this.$._data.$content.css("height",  ratio.height);
  }

  openDescription(data) {
    const _data = data

    lightImageDescription.init({
        title: _data.title,
        description: _data.description,
        $content: _data.$content
    })
  }

}

const lightBoxVideo = new lightBoxVideoClass()
