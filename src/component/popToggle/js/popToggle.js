class popToggleClass {

  constructor(data) {
      this.s = {
        name: data.name || 'pippo',
        $btn: $(`${data.openButton}`),
        $target: $(`${data.target}`),
        $closebtn: $(`${data.closeButton}`) || {},
        openCallBack: null, // funzione opzionale da eseguire all'apertura del sigolo PopUp
        closeCallBack: null, // funzione opzionale da eseguire alla chiusura del sigolo PopUp
        isDropDown: data.isDropDown || false
      }
      this.init();
  }

  init() {
      popToggleManager.pushToggle(this);
      this.s.$btn.on('click', (e) => this.openPop());
      this.s.$closebtn.on('click', (e) => this.closePop());
  }

  openPop() {
      if( this.s.$target.hasClass('active') ) {
        this.closePop();
    } else {
        this.s.$target.addClass('active');
        if(this.s.isDropDown) this.s.$target.slideDown(300);
        if(this.s.openCallBack != null) this.s.openCallBack();
      }
      popToggleManager.onOpenPop(this.s.name);
  }

  closePop() {
      if( this.s.$target.hasClass('active') ) {
          this.s.$target.removeClass('active');
          if(this.s.isDropDown) this.s.$target.slideUp(300);
          if(this.s.closeCallBack != null) this.s.closeCallBack();
      }
  }

  set openCallBack(fn) {
      this.s.openCallBack = fn;
  }

  set closeCallBack(fn) {
      this.s.closeCallBack = fn;
  }

  get name() {
      return this.s.name;
  }
}
