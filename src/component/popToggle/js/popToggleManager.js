export class popToggleManagerClass {

    constructor() {
        this.popArray = [];
        this.functionArray = [];

    }

    pushToggle(_fn) {
        this.popArray.push(_fn)
    }

    // // funzione opzionale da eseguire all'apertura del sigolo PopUp
    callBackFunction(_fn) {
        this.functionArray.push(_fn)
    }

    onOpenPop(_name) {
        for (const item of this.popArray) {
            if (item.name != _name) {
                item.closePop();
            }
        }

        for (const item of this.functionArray) {
            item();
        }
    }

    closeAllPop() {
        for (const item of this.popArray) {
            item.closePop();
        }
    }
}
