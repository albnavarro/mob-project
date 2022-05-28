import { sliceIntoChunks, arrayColumn } from '../animationUtils.js';
import { MERGE_FROM_UP, MERGE_FROM_DOWN } from './staggerCostant';

export const getRadialArray = (arr, stagger) => {
    const { col } = stagger.grid;
    const { x, y } = stagger.from;

    const chunk = sliceIntoChunks(arr, col);

    // Add empy row (one row for each column) at the end to prevent missing cell form matrix calc
    [...Array(col).keys()].forEach((item, i) => {
        chunk.push([]);
    });

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

    // Get radial in x direction
    const getRadialX = (arr, x, y) => {
        return arr.reduce((total, row, i) => {
            const offset = Math.abs(i - y);
            let newRow = [];

            const isAvailable = (arr, i, i2) => {
                return arr[i] !== undefined && chunk[i][i2] !== undefined;
            };

            // Avoid duplicate form before and after y
            if (i >= y && i <= y * 2) {
                return [...total, ...[newRow]];
            }

            // Estremi di ogni chunk
            const xStart = x - offset;
            const xEnd = x + offset;

            for (let i = 0; i < offset; i++) {
                if (isAvailable(chunk, y + i, xStart)) {
                    newRow.push(chunk[y + i][xStart]);
                }

                if (isAvailable(chunk, y + i, xEnd)) {
                    newRow.push(chunk[y + i][xEnd]);
                }

                // Avoid duplicate
                if (i > 0) {
                    if (isAvailable(chunk, y - i, xStart)) {
                        newRow.push(chunk[y - i][xStart]);
                    }

                    if (isAvailable(chunk, y - i, xEnd)) {
                        newRow.push(chunk[y - i][xEnd]);
                    }
                }
            }

            const newRowFiltered = newRow.filter((item) => item != undefined);

            return [...total, ...[newRowFiltered]];
        }, []);
    };

    const radialArrX = getRadialX(radialArrY, x, y);

    // Merge  x and y array
    const radialXY = radialArrY.reduce((p, c, i) => {
        const row = [...radialArrY[i], ...radialArrX[i]];
        p.push(row);
        return p;
    }, []);

    // Merge over and down y array
    const arrayLength = radialXY.length;
    const mergeDirection =
        y >= arrayLength / 2 ? MERGE_FROM_UP : MERGE_FROM_DOWN;

    const finalArray = (() => {
        if (mergeDirection === MERGE_FROM_DOWN) {
            return radialXY.reduce((p, c, i) => {
                if (i < y) {
                    return p;
                } else if (i === y) {
                    const merged = [...radialXY[i]];
                    p.push(merged);
                    return p;
                } else {
                    const downRow = radialXY[y - (i - y)]
                        ? radialXY[y - (i - y)]
                        : [];
                    const merged = [...radialXY[i], ...downRow];
                    p.push(merged);
                    return p;
                }
            }, []);
        } else {
            return radialXY
                .reduce((p, c, i) => {
                    if (i > y) {
                        return p;
                    } else if (i === y) {
                        const merged = [...radialXY[i]];
                        p.push(merged);
                        return p;
                    } else {
                        const upRow = radialXY[y + (y - i)]
                            ? radialXY[y + (y - i)]
                            : [];
                        const merged = [...radialXY[i], ...upRow];
                        p.push(merged);
                        return p;
                    }
                }, [])
                .reverse();
        }
    })();

    // Remove empty row added at start
    const cleanArray = finalArray.reduce((p, c) => {
        return c.length === 0 ? p : [...p, ...[c]];
    }, []);

    return {
        cleanArray,
    };
};
