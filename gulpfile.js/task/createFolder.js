const gulp = require('gulp');
const fs = require('fs');
const path = require('path');
const destPath = path.resolve('www');
const assetPath = path.join(destPath, 'assets');
const cssPath = path.join(assetPath, 'css');
const dataPath = path.join(assetPath, 'data');
const distPath = path.join(assetPath, 'dist');
const fontsPath = path.join(assetPath, 'fonts');
const jsPath = path.join(assetPath, 'js');
const svgPath = path.join(assetPath, 'svg');

/**
 * Create all empty folder necessary in build main folder
 *
 * @param  {function} done - async completion function
 * @return {function}
 */
function createFolder(done) {
    if (!fs.existsSync(destPath)) fs.mkdirSync(destPath);
    if (!fs.existsSync(assetPath)) fs.mkdirSync(assetPath);
    if (!fs.existsSync(cssPath)) fs.mkdirSync(cssPath);
    if (!fs.existsSync(dataPath)) fs.mkdirSync(dataPath);
    if (!fs.existsSync(distPath)) fs.mkdirSync(distPath);
    if (!fs.existsSync(fontsPath)) fs.mkdirSync(fontsPath);
    if (!fs.existsSync(jsPath)) fs.mkdirSync(jsPath);
    if (!fs.existsSync(svgPath)) fs.mkdirSync(svgPath);

    done();
}

exports.createFolder = createFolder;
