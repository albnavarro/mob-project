class lightBoxVideoClass {

  constructor() {
    if(!lightBoxVideoClass.instance){
      lightBoxVideoClass.instance = this;
    }
    return lightBoxVideoClass.instance;
  }

  init(data) {
    const _data = data,
          $videoContainer = '<div class="video-container"></div>';

    let lightboxWidth = 0
    if( eventManager.windowsWidth() > 600 ) {
      lightboxWidth = 600;
    } else {
      lightboxWidth = eventManager.windowsWidth() - 100;
    }
    _data.$content.css("width", lightboxWidth);
    _data.$content.css("height", '56.25%');
    _data.$content.html($videoContainer);
    const $video = $('.video-container');

    setTimeout(() => {
      $video.html('<iframe width="100%" height="315" src="https://www.youtube.com/embed/'+ _data.url + '" frameborder="0" allowfullscreen></iframe>')
      $video.addClass('visible');
    }, 200);

    this.openDescription(_data);
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
