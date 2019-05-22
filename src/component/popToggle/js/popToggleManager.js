class popToggleManagerClass {

  constructor() {
    if(!popToggleManagerClass.instance){
      this.s = {
          popArray: [],
          functionArray: []
      }
      popToggleManagerClass.instance = this;
    }
    return popToggleManagerClass.instance;
  }

  pushToggle(_fn) {
      this.s.popArray.push(_fn)
  }

  // // funzione opzionale da eseguire all'apertura del sigolo PopUp
  callBackFunction(_fn) {
      this.s.functionArray.push(_fn)
  }

  onOpenPop(_name) {

      for (let index = 0; index < this.s.popArray.length; index++) {
          const item = this.s.popArray[index];

          if(item.name != _name) {
            item.closePop();
        }
      }

      for (let index = 0; index < this.s.functionArray.length; index++) {
          const item = this.s.functionArray[index];
          item();
      }
  }

  closeAllPop() {
      for (let index = 0; index < this.s.popArray.length; index++) {
        const item = this.s.popArray[index];
        item.closePop();
      }
  }
  
}

const popToggleManager = new popToggleManagerClass()
