import axios from 'axios';

class axiosTestClass {

    constructor() {

    }

    init() {
        axios.get('/assets/data/permalink.json')
            .then((response) => {
                console.log(response.data);
            });
    }


}

export const axiosTest = new axiosTestClass()
