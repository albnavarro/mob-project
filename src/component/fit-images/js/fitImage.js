class fitImagesClass {

  constructor() {
    if(!fitImagesClass.instance){
      this.$ = {
        $imgContainers: $('.fit-img-container')
      }
      fitImagesClass.instance = this;
    }
    return fitImagesClass.instance;
  }

  init(){
    eventManager.push('resize', this.fitImages.bind(this));
    eventManager.push('load', this.fitImages.bind(this));
    this.fitImages();
  }

  fitImages() {
    this.$.$imgContainers.each((i, el) => {
      const
      $imgContainer = $(el),
      $img          = $imgContainer.children('.fit-img');

      if ($img.prop('complete')) {
        this.applyClass($imgContainer, $img);
      }
      else {
        $img.on('load',() => {
          this.applyClass($imgContainer, $img);
        });
      }
    });
  }

  applyClass($imgContainer, $img) {
    const
    containerRatio = $imgContainer.width() / $imgContainer.height(),
    imgRatio       = $img.width() / $img.height();

    if (imgRatio < containerRatio) {
      $img.addClass('fit-width').removeClass('fit-height');
    }
    else {
      $img.addClass('fit-height').removeClass('fit-width');
    }
  }

  rescanImages() {
      this.fitImages();
  }

}

const fitImages = new fitImagesClass()
