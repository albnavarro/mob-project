import { eventManager } from "../../../js/base/eventManager.js";
import { modernzier } from "../../../js/utility/modernizr.js"

class toolTipClass {

  constructor() {
    if(!toolTipClass.instance){
      this.s = {
        // $bnt: $('.tooltip'),
        $bnt: $("*[data-conponent='m-comp--tooltip']"),
        $body :$('body'),
        lastToolTip: {},
        overTool: false
      }
      toolTipClass.instance = this;
    }
    return toolTipClass.instance;
  }

  init(){
    this.addHandler();
  }

  addHandler(){
    this.s.$bnt.on('click' , this.onClick.bind(this));
    this.s.$bnt.on('mouseover', this.onMouseOver.bind(this));
    this.s.$bnt.on('mouseout' , this.onMouseOut.bind(this));
    this.s.$body.on('click', this.bodyOnCLick.bind(this));
  }

  onClick(event) {
    if (Modernizr.touchevents) {

      // Prevent click on span tooltop
      if( $(event.target).is($('button.tooltip')) ) {
        this.addTollTip($(event.target) , event);
      }
    }
  }

  onMouseOver(event) {
    if (!Modernizr.touchevents) {
      // Controllo che non passi sopra il toolotip per non chiuderlo
      const $target = $(event.target)

      if(!$target.hasClass('tooltip-pop') && !this.s.overTool) {
        this.addTollTip($target , event);
        this.s.overTool = true;
      }
    }
  }

  onMouseOut(event) {
    // Controllo che non passi sopra il toolotip per non chiuderlo
    // event.relatedTarget = elemento di atterragio del mouseOut
    const $realtedTarget = $(event.relatedTarget)

    // Chiudo il PopUp solo se non passo dal btn al PopUp aperto
    if(!Modernizr.touchevents && !$realtedTarget.hasClass('tooltip-pop')) {
      this.resetTooltip();
      this.s.overTool = false;
    } else if ($realtedTarget.hasClass('tooltip-pop')) {

      // Altrimenti agiungo un listener al popUp per vedere quando esco dallo stesso
      this.s.overTool = true;
      $realtedTarget.off('mouseout');
      $realtedTarget.on('mouseout', this.outOfPopUp.bind(this))
    }
  }

  outOfPopUp(event) {
    const $target = $(event.target),
        $realtedTarget = $(event.relatedTarget);

    // Non chiudo il PopUp se:
    if ( // Se entro dentro un sottoelemento del popUp ( es. un link )
         $realtedTarget.parents('.tooltip-pop').length == 1 ||

         // Se da un sottoelemento del popUp torno nel popUp
         $realtedTarget.hasClass('tooltip-pop') ||

         // Se dal pop up entro nel bottone che lo ha aperto
         ( $realtedTarget.hasClass('tooltip') &&
           $realtedTarget.siblings('.tooltip-pop').length == 1 )
         ) return;

      // Altrimenti chiudo il popUp:
      $target.off('mouseout')
      this.resetTooltip();
      this.s.overTool = false;
  }

  bodyOnCLick(event) {
    if( !$(event.target).is(this.s.$bnt) && !$(event.target).is($('.tooltip-pop'))  ){
      this.resetTooltip();
    }
  }

  addTollTip(_item,event) {
    const $item = _item,
        data = $item.data('tooltip'),
        string = `<span class='tooltip-pop'>${data}</span>`

    if(this.s.lastToolTip.length) {
      if ( !this.s.lastToolTip.is($item) ) {
        this.resetTooltip();
      }
    }

    if( $(event.target).is($item) ) {
      if ( !$item.hasClass('tooltip-active') ) {
        $item.addClass('tooltip-active');

        const $wrapper = $item.closest('.toolTip-wrap')
        $wrapper.append(string);

        const $toolTip = $wrapper.find('.tooltip-pop'),
            toolTipPosX = $toolTip.offset().left,
            toolTipPosY = $toolTip.offset().top,
            toolTipPosWidth = $toolTip.outerWidth();

        if((toolTipPosX + toolTipPosWidth) >= eventManager.windowsWidth()) {
          $toolTip.addClass('tooltip-pop--is-right')
        }

        if(toolTipPosY - eventManager.scrollTop() < 0) {
          $toolTip.addClass('tooltip-pop--is-bottom')
        }

        $toolTip.addClass('active');
        this.s.lastToolTip = $item

      } else {
        $item.removeClass('tooltip-active');
        $('.tooltip-pop').remove();
      }
    }
  }

  resetTooltip() {
    if(this.s.lastToolTip.length) {
      this.s.lastToolTip.removeClass('tooltip-active');
      $('.tooltip-pop').remove();
      this.s.lastToolTip = {};
    }
  }

}

export const toolTip = new toolTipClass()