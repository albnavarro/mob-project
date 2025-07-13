import { sliceIntoChunks } from '../animation-utils.js';
import { MERGE_FROM_UP, MERGE_FROM_DOWN } from './stagger-costant.js';

/**
 * Get radial in y direction
 *
 * @param {any[][]} arr
 * @param {number} x
 * @param {number} y
 * @returns Array<Array>
 */
const getRadialY = (arr, x, y) => {
    return arr.reduce((total, row, i) => {
        const offset = Math.abs(i - y);

        const newRow = row.reduce((p, c, i) => {
            return i < x - offset || i > x + offset ? p : [...p, c];
        }, []);

        return [...total, newRow];
    }, []);
};

/**
 * Get radial in x direction
 *
 * @template {any[]} T
 * @param {T} arr
 * @param {number} x
 * @param {number} y
 * @param {T} chunk
 * @returns {T}
 */
const getRadialX = (arr, x, y, chunk) => {
    return arr.reduce((total, _row, i) => {
        const offset = Math.abs(i - y);

        /** @type {any[][]} */
        const newRow = [];

        // Avoid duplicate form before and after y
        if (i >= y && i <= y * 2) {
            return [...total, newRow];
        }

        // Estremi di ogni chunk
        const xStart = x - offset;
        const xEnd = x + offset;

        for (let i = 0; i < offset; i++) {
            if (isAvailableIntoChunk(chunk, y + i, xStart)) {
                newRow.push(chunk[y + i][xStart]);
            }

            if (isAvailableIntoChunk(chunk, y + i, xEnd)) {
                newRow.push(chunk[y + i][xEnd]);
            }

            // Avoid duplicate
            if (i > 0) {
                if (isAvailableIntoChunk(chunk, y - i, xStart)) {
                    newRow.push(chunk[y - i][xStart]);
                }

                if (isAvailableIntoChunk(chunk, y - i, xEnd)) {
                    newRow.push(chunk[y - i][xEnd]);
                }
            }
        }

        const newRowFiltered = newRow.filter((item) => item != undefined);

        return [...total, newRowFiltered];
    }, []);
};

/**
 * @param {any[][]} arr
 * @param {number} i
 * @param {number} i2
 * @returns Boolean
 */
const isAvailableIntoChunk = (arr, i, i2) => {
    return arr[i] !== undefined && arr[i][i2] !== undefined;
};

/**
 * @template {any[]} T
 * @param {T} arr
 * @param {import('./type.js').StaggerObject} stagger
 * @returns {{ cleanArray: T[] }}
 */
export const getRadialArray = (arr, stagger) => {
    const { col } = stagger.grid;
    // @ts-ignore
    const { x, y } = stagger.from;

    const chunk = sliceIntoChunks(arr, col);

    // Add empty row (one row for each column) at the end to prevent missing cell form matrix calc
    [...Array.from({ length: col }).keys()].forEach(() => {
        chunk.push([]);
    });

    const radialArrY = getRadialY(chunk, x, y);
    const radialArrX = getRadialX(radialArrY, x, y, chunk);

    // Merge  x and y array
    const radialXY = radialArrY.reduce((p, _c, i) => {
        const row = [...radialArrY[i], ...radialArrX[i]];
        p.push(row);
        return p;
    }, []);

    // Merge over and down y array
    const arrayLength = radialXY.length;
    const mergeDirection =
        y >= arrayLength / 2 ? MERGE_FROM_UP : MERGE_FROM_DOWN;

    const finalArray =
        mergeDirection === MERGE_FROM_DOWN
            ? radialXY.reduce(
                  (
                      /** @type {any[][]} */ previous,
                      /** @type {[]} */ _current,
                      /** @type {number} */ index
                  ) => {
                      if (index < y) {
                          return previous;
                      } else if (index === y) {
                          const merged = [...radialXY[index]];
                          previous.push(merged);
                          return previous;
                      } else {
                          const downRow = radialXY[y - (index - y)] ?? [];
                          const merged = [...radialXY[index], ...downRow];
                          previous.push(merged);
                          return previous;
                      }
                  },
                  []
              )
            : radialXY
                  .reduce(
                      (
                          /** @type {any[][]} */ previous,
                          /** @type {[]} */ _current,
                          /** @type {number} */ index
                      ) => {
                          if (index > y) {
                              return previous;
                          } else if (index === y) {
                              const merged = [...radialXY[index]];
                              previous.push(merged);
                              return previous;
                          } else {
                              const upRow = radialXY[y + (y - index)] ?? [];
                              const merged = [...radialXY[index], ...upRow];
                              previous.push(merged);
                              return previous;
                          }
                      },
                      []
                  )
                  .reverse();

    // Remove empty row added at start
    const cleanArray = finalArray.reduce(
        (/** @type {any[][]} */ previous, /** @type {[]} */ current) => {
            return current.length === 0 ? previous : [...previous, current];
        },
        []
    );

    return {
        cleanArray,
    };
};
