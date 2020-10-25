class popToggleClass {

  constructor(data) {
      this.s = {
        name: data.name || 'pippo',
        $btn: $(`${data.openButton}`),
        $target: $(`${data.target}`),
        $closebtn: $(`${data.closeButton}`) || {},
        openCallBack: [], // funzioni opzionale da eseguire all'apertura del sigolo PopUp
        closeCallBack: [], // funzioni opzionale da eseguire alla chiusura del sigolo PopUp
        isDropDown: typeof data.isDropDown === "undefined" ? false : data.isDropDown,
        manager: data.manager
      }
      this.init();
  }

  init() {
      this.s.manager.pushToggle(this);
      this.s.$btn.on('click', (e) => this.openPop());
      this.s.$closebtn.on('click', (e) => this.closePop());
  }

  openPop() {
      if( this.s.$target.hasClass('active') ) {
        this.closePop();
    } else {
        this.s.$target.addClass('active');
        if(this.s.isDropDown) this.s.$target.slideDown(300, () => {
          eventManager.execute('resize');
        });

        if(this.s.openCallBack.length) {
            for (let index = 0; index < this.s.openCallBack.length; index++) {
                const item = this.s.openCallBack[index];
                item();
            }
        }

      }
      this.s.manager.onOpenPop(this.s.name);
  }

  closePop() {
      if( this.s.$target.hasClass('active') ) {
          this.s.$target.removeClass('active');
          if(this.s.isDropDown) this.s.$target.slideUp(300, () => {
            eventManager.execute('resize');
          });

          if(this.s.closeCallBack.length) {
              for (let index = 0; index < this.s.closeCallBack.length; index++) {
                  const item = this.s.closeCallBack[index];
                  item();
              }
          }
      }
  }

  set openCallBack(fn) {
      this.s.openCallBack.push(fn);
  }

  set closeCallBack(fn) {
      this.s.closeCallBack.push(fn);
  }

  get name() {
      return this.s.name;
  }
}
