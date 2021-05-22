/*
* check if nested prop exist in obj
*/
const propValidate = (p, o) => p.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, o)


/*
* Sort by date utility
*/
function sortbyDate(arr) {
    return arr.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA - dateB;
    });
}



function chunk(array, size) {
    const chunked_arr = [];
    let index = 0;
    while (index < array.length) {
        chunked_arr.push(array.slice(index, size + index));
        index += size;
    }
    return chunked_arr;
}

exports.propValidate = propValidate
exports.sortbyDate = sortbyDate
exports.chunk = chunk
