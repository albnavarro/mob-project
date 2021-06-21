const util = require('util')
const glob = require('glob')
const path = require('path')
const fs = require('fs')
const themePath = path.resolve('src')
const destPath = path.resolve('www')
const dataPath = path.join(themePath, 'data')
const dataDestFolder = path.join(destPath, 'assets/data')
const draftFile = `${dataDestFolder}/draftMap.json`
const store = require('../store.js')
const {
	getLanguage,
	getUnivoqueId,
	mergeData,
	langIsDisable
} = require('../functions/function.js')


/*
* CREATE draft MAP
* draftMap: {
*     univoqueId: { en: '{pageTitle}', it: '{pageTitle}', ... },
      ....
 * }
*/
function draftMap(done) {
	const allPath = glob.sync(path.join(dataPath, '/**/*.json'))

	const draftObj = allPath.reduce((acc, curr) => {
		const parsed = JSON.parse(fs.readFileSync(curr))
		const lang = getLanguage(curr)
		const univoqueId = getUnivoqueId(curr)
		const isDraft = (('draft' in parsed) && parsed.draft === true || langIsDisable(lang)) ? false : true

		acc[univoqueId] = {
			...acc[univoqueId]
		}
		acc[univoqueId][lang] = !isDraft


		return acc;
	}, {});


	/*
	 * DEBUG
	 * gulp html -debug for debug
	 */
	if (store.arg.debug) {
		console.log(draftObj)
	}

	/*
	 * Check if destination folder exist and save the file with permalink map
	 */
	if (!fs.existsSync(dataDestFolder)) {
		fs.mkdirSync(dataDestFolder, {
			recursive: true
		})
	}

	store.draftMapData = draftObj

	if (store.arg.debug) {
		fs.writeFileSync(draftFile, JSON.stringify(draftObj))
	} else {
		fs.writeFile(draftFile, JSON.stringify(draftObj), () => {})
	}

	done()

}

exports.draftMap = draftMap
