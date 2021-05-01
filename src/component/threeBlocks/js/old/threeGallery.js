import { eventManager } from "../../../../js/base/eventManager.js";

class tGalleryClass {

  constructor() {
    if(!tGalleryClass.instance){
      this.s = {
        $containers: $("*[data-conponent='m-comp--tGallery']"),
        $items: $("*[data-conponent='m-comp--tGallery'] .tGallery__item"),
        arrItem: []
      }
      tGalleryClass.instance = this;
    }
    return tGalleryClass.instance;
  }


  init(){
    this.s.$items.on('click', this.onCLick.bind(this))
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

    this.s.$containers.each((i,el) => {
      this.s.arrItem.push(new obj($(el)));
      this.s.arrItem[i].item.attr('data-id', i)
    })
  }


  onCLick(event) {
      const $item = $(event.target);

      if(!$item.hasClass('tGallery__item--active')) {
        const id = $item.attr('data-id'),
              $container = this.s.arrItem[id].container,
              $scopeItem = this.s.arrItem[id].item,
              $innerElement = $scopeItem.not($item).find('.tGallery__item__wrap'),
              $currentInnerElement = $item.find('.tGallery__item__wrap'),
              itemPosX = $item.offset().left,
              center = this.s.arrItem[id].center,
              width = $container.outerWidth();

        let  direction = $container.attr('data-diretction'),
             scrollDestination = 0;

        // Posizione il precendete elemento attivo a dx o sx
        $scopeItem.css('order', 2)
        if (this.s.arrItem[id].activeDirection == 'sx') {
          this.s.arrItem[id].activeItem .css('order', 3)
        } else {
          this.s.arrItem[id].activeItem .css('order', 1)
        }


        // Posiziono l'attuale elemento attivo
        if(itemPosX > center - 20) {
            $currentInnerElement.addClass('tg-form-right').removeClass('tg-form-left')
            this.s.arrItem[id].activeDirection = 'sx'
          } else {
            $currentInnerElement.addClass('tg-form-left').removeClass('tg-form-right')
            this.s.arrItem[id].activeDirection = 'dx'
          }
          this.s.arrItem[id].activeItem = $item

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
    this.s.$items.each((i, el) => {
      const $item = $(el),
            $innerElement = $item.find('.tGallery__item__wrap');

      let width = $item.outerWidth();
      $innerElement.css('width', width);
    })

    for (let index = 0; index < this.s.arrItem.length; index++) {
      const item = this.s.arrItem[index];
      item.calcCenter()
    }
  }
}

export const tGallery = new tGalleryClass()
