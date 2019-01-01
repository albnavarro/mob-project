class loadImages {

  constructor(images,callback) {
    this.$ = {
      $images: images,
      cont: 0,
      callback: callback,
      active: true
    }

    this.init();
  }


  init(){

    this.$.$images.each((i, el) => {
      let $img = $(el);

      if ($img.prop('complete')) {
        this.$.cont++;
        if( this.$.cont == this.$.$images.length ){
           this.$.callback();
        }
      }

      else {
        $img.on('load', () => {
          this.$.cont++;
          if( this.$.cont == this.$.$images.length ){
             if(this.$.active) {
               this.$.callback();
             }
          };
        });
      }

    });
  }

  stop() {
    this.$.active = false
  }

}
