const sliceIntoChunks = (arr, chunkSize) => {
    const res = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        const chunk = arr.slice(i, i + chunkSize);
        res.push(chunk);
    }
    return res;
};

function multiDimensionalUnique(arr) {
    const uniques = [];
    const itemsFound = {};
    for (let i = 0, l = arr.length; i < l; i++) {
        const stringified = JSON.stringify(arr[i]);
        if (itemsFound[stringified]) {
            continue;
        }
        uniques.push(arr[i]);
        itemsFound[stringified] = true;
    }
    return uniques;
}

const items = 100;
const col = 6;
const x = 3;
const y = 3;
const arr = [...Array(items).keys()];

const chunk = sliceIntoChunks(arr, col);
console.log(chunk);
console.log('x:', x, 'y:', y);

// Get radial in y direction
const getRadialY = (arr, x, y) => {
    return arr.reduce((total, row, i) => {
        const offset = Math.abs(i - y);

        const newRow = row.reduce((p, c, i) => {
            return i < x - offset || i > x + offset ? p : [...p, ...[c]];
        }, []);

        return [...total, ...[newRow]];
    }, []);
};

const radialArrY = getRadialY(chunk, x, y);
console.log(radialArrY);

// Get radial in x direction
const getRadialX = (arr, x, y) => {
    return arr.reduce((total, row, i) => {
        const offset = Math.abs(i - y);

        // Estremi di ogni chunk
        const xStart = x - offset;
        const xEnd = x + offset;

        let row2 = [];
        for (var i = 0; i < offset; i++) {
            if (
                chunk[y + i] !== undefined &&
                chunk[y + i][xStart] !== undefined
            ) {
                row2.push(chunk[y + i][xStart]);
            }

            if (
                chunk[y + i] !== undefined &&
                chunk[y + i][xEnd] !== undefined
            ) {
                row2.push(chunk[y + i][xEnd]);
            }

            if (
                chunk[y - i] !== undefined &&
                chunk[y - i][xStart] !== undefined
            ) {
                row2.push(chunk[y - i][xStart]);
            }

            if (
                chunk[y - i] !== undefined &&
                chunk[y - i][xEnd] !== undefined
            ) {
                row2.push(chunk[y - i][xEnd]);
            }
        }

        const rowFiltered = row2.filter((item) => item != undefined);
        const rowClean = multiDimensionalUnique(rowFiltered);

        return [...total, ...[rowClean]];
    }, []);
};

const radialArrX = getRadialX(radialArrY, x, y);
console.log(radialArrX);
