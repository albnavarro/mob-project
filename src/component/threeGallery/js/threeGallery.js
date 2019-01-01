class tGalleryClass {

  constructor() {
    if(!tGalleryClass.instance){
      this.$ = {
        $items: $('.tGallery__item'),
        $containers: $('.tGallery'),
        arrItem: []
      }
      tGalleryClass.instance = this;
    }
    return tGalleryClass.instance;
  }

  init(){
    this.$.$items.on('click', this.onCLick.bind(this))
    eventManager.push('load', this.buildData.bind(this))
    eventManager.push('load', this.setWidth.bind(this))
    eventManager.push('resize', this.setWidth.bind(this))
  }

  buildData() {
    function obj(item) {
      this.container = item
      this.item = item.find('.tGallery__item')
      this.activeItem = item.find('.tGallery__item:nth-of-type(1)')
      this.activeDirection = 'dx'
      this.center = item.position().left + item.outerWidth()/2
      this.calcCenter = () => {
         this.center = item.position().left + item.outerWidth()/2
      }
    }

    this.$.$containers.each((i,el) => {
      this.$.arrItem.push(new obj($(el)));
      this.$.arrItem[i].item.attr('data-id', i)
    })
  }


  onCLick(event) {
      const $item = $(event.target);

      if(!$item.hasClass('tGallery__item--active')) {
        const id = $item.attr('data-id'),
              $container = this.$.arrItem[id].container,
              $scopeItem = this.$.arrItem[id].item,
              $innerElement = $scopeItem.not($item).find('.tGallery__item__wrap'),
              $currentInnerElement = $item.find('.tGallery__item__wrap'),
              itemPosX = $item.offset().left,
              center = this.$.arrItem[id].center,
              width = $container.outerWidth();

        let  direction = $container.attr('data-diretction'),
             scrollDestination = 0;

        // Posizione il precendete elemento attivo a dx o sx
        $scopeItem.css('order', 2)
        if (this.$.arrItem[id].activeDirection == 'sx') {
          this.$.arrItem[id].activeItem .css('order', 3)
        } else {
          this.$.arrItem[id].activeItem .css('order', 1)
        }


        // Posiziono l'attuale elemento attivo
        if(itemPosX > center - 20) {
            $currentInnerElement.addClass('tg-form-right').removeClass('tg-form-left')
            this.$.arrItem[id].activeDirection = 'sx'
          } else {
            $currentInnerElement.addClass('tg-form-left').removeClass('tg-form-right')
            this.$.arrItem[id].activeDirection = 'dx'
          }
          this.$.arrItem[id].activeItem = $item

        // Setto l'altrnanza top/bottom
        if (direction == 'up') {
          direction = 'down'
          scrollDestination = $container.position().top - (eventManager.windowsHeight() - $container.outerHeight());
        } else {
          direction = 'up'
          scrollDestination = $container.position().top;
        }

        $("html, body").animate({scrollTop: scrollDestination }, 350);

        $container.attr('data-diretction', direction )
        $scopeItem.not($item).removeClass('tGallery__item--active')

        // Fix IE11 animationinto flex fail
        $innerElement.css('width', width/2)
        $item.addClass('tGallery__item--active')
        $currentInnerElement.css('width', width)
      }
  }

  setWidth() {
    this.$.$items.each((i, el) => {
      const $item = $(el),
            $innerElement = $item.find('.tGallery__item__wrap');

      let width = $item.outerWidth();
      $innerElement.css('width', width);
    })

    for( let item of this.$.arrItem ) {
      item.calcCenter()
    }
  }
}

const tGallery = new tGalleryClass()
