/**
 * check if nested prop exist in obj
 */
const propValidate = (p, o) => p.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, o)



/**
 * sortbyDate - sort array by datye
 *
 * @param  {Array} arr Array of obj with date propierties
 * @return {Array}  ordered Array by date
 */
function sortbyDate(arr) {
	return arr.sort((a, b) => {
		const dateA = new Date(a.date);
		const dateB = new Date(b.date);
		return dateA - dateB;
	});
}



/**
 * chunk - create chunked array
 *
 * @param  {Array} array source Array
 * @param  {number} size  chunk size
 * @return {Array}  Chunked array
 */
function chunk(array, size) {
	const chunked_arr = [];
	let index = 0;
	while (index < array.length) {
		chunked_arr.push(array.slice(index, size + index));
		index += size;
	}
	return chunked_arr;
}


/**
 * Simple is object check.
 * @param item
 * @returns {boolean}
 */
function isObject(item) {
	return (item && typeof item === 'object' && !Array.isArray(item));
}


/**
 * Deep merge two objects.
 * @param target
 * @param source
 */
function mergeDeep(target, source) {
	if (isObject(target) && isObject(source)) {
		for (const key in source) {
			if (isObject(source[key])) {
				if (!target[key]) Object.assign(target, {
					[key]: {}
				});
				mergeDeep(target[key], source[key]);
			} else {
				Object.assign(target, {
					[key]: source[key]
				});
			}
		}
	}
	return target;
}


exports.propValidate = propValidate
exports.sortbyDate = sortbyDate
exports.chunk = chunk
exports.mergeDeep = mergeDeep
