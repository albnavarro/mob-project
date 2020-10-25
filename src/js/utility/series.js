export class seriesClass {

    constructor() {
        this.s = {
            arr: [],
            index: 0
        }
    }

    push(fn) {
        this.s.arr.push(fn)
    }

    go() {
        this.s.index = 0;
        const fn = this.s.arr[0]
        this.s.index++;
        fn().then(() => {
            this.next();
        });
    }

    next() {
        const fn = this.s.arr[this.s.index]
        if(this.s.index == this.s.arr.length) return;

        this.s.index++;
        fn().then(() => {
            this.next();
        });
    }
}

// ISTANCE EXAMPLE:
// const serie = new seriesClass();
// serie.push(popToggle1.test.bind(popToggle1));
// serie.push(popToggle2.test.bind(popToggle2));
// serie.push(popToggle3.test.bind(popToggle3));
// serie.go();


// METHOD EXAMPLE:

// test() {
//     return new Promise((res) => {
//         setTimeout(() => {
//             console.log(this.s.name);
//             res();
//         }, 1000)
//     });
// }
