class loadImages {

  constructor(images,callback) {
    this.s = {
      $images: images,
      cont: 0,
      callback: callback,
      active: true
    }

    this.init();
  }


  init(){

    this.s.$images.each((i, el) => {
      let $img = $(el);

      if ($img.prop('complete')) {
        this.s.cont++;
        if( this.s.cont == this.s.$images.length ){
           this.s.callback();
        }
      }

      else {
        $img.on('load', () => {
          this.s.cont++;
          if( this.s.cont == this.s.$images.length ){
             if(this.s.active) {
               this.s.callback();
             }
          };
        });
      }

    });
  }

  stop() {
    this.s.active = false
  }

}
