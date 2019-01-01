"use strict"

const
isProd = process.env.NODE_ENV === 'production',

path         = require('path'),
config       = require('./config.json'),
concat       = require('gulp-concat'),
filter       = require('gulp-filter'),
gulp         = require('gulp'),
sass         = require('gulp-sass'),
sourcemaps   = require('gulp-sourcemaps'),
watch        = require('gulp-watch'),
wrap         = require('gulp-wrap'),
critical     = require('critical'),
gulpif       = require('gulp-if'),
cssmin       = require('gulp-cssmin'),
postcss      = require('gulp-postcss'),
rename       = require('gulp-rename'),
request      = require('request'),
svgmin       = require('gulp-svgmin'),
svgstore     = require('gulp-svgstore'),
uglify       = require('gulp-uglify'),
browserSync  = require('browser-sync'),
fs           = require('fs'),
replace      = require('gulp-replace'),
specialHtml  = require('gulp-special-html'),
htmlmin      = require('gulp-htmlmin'),
imagemin     = require('gulp-imagemin'),
pug          = require('gulp-pug'),
babel        = require("gulp-babel"),
reload       = browserSync.reload,

themePath = path.resolve('src'),
destPath = path.resolve('www'),

imgPath  = path.join(themePath, 'img'),
jsPath   = path.join(themePath, 'js'),
componentPath   = path.join(themePath, 'component'),
scssPath = path.join(themePath, 'scss'),
svgPath  = path.join(themePath, 'svg'),

cssPath  = path.join(destPath, 'assets/css'),
jsDest   = path.join(destPath, 'assets/js'),
svgDest  = path.join(destPath, 'assets/svg'),
imgDest  = path.join(destPath, 'assets/img'),

cssFile              = `${cssPath}/main.css`,
cssCritical          = `${cssPath}/critical.css`,
imgFiles             = `${imgPath}/*`,
jsFiles              = `${jsPath}/**/*.js`,
componentJsFiles     = `${componentPath}/**/*.js`,
scssFiles            = `${scssPath}/**/*.scss`,
componentscssFiles   = `${componentPath}/**/*.scss`,
svgFiles             = `${svgPath}/*.svg`,
pugFiles             = `${themePath}/*.pug`,
allPugFiles          = `${themePath}/**/*.pug`


gulp.task('browser-sync', function() {
  browserSync.init({
    proxy: config.host,
    open:  false
  })
})

gulp.task('js-watch', ['js'], function() {
	browserSync.reload()
})

gulp.task('html-watch', ['html'], function() {
	browserSync.reload()
})

gulp.task('sass', () => {
  return gulp.src(path.join(scssPath, 'main.scss'))
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'nested',
      includePaths: ['node_modules/susy/sass']
    }).on('error', sass.logError))
    .pipe(postcss([
      require('autoprefixer')(),
      require('css-mqpacker')({ sort: true }),
    ]))
    .pipe(gulpif(!isProd, sourcemaps.write('maps', {
      includeContent: false,
      sourceRoot:     scssPath
    })))
    .pipe(gulpif(isProd, cssmin({
      keepSpecialComments: false,
    })))
    .pipe(gulp.dest(cssPath))
    .pipe(browserSync.stream({ match: '**/*.css' }))
})

gulp.task('minifyAssetsLoading', () => {
  return gulp.src(path.join(jsPath, 'async-assets-loading.js'))
    .pipe(uglify())
    .pipe(rename('async-assets-loading.min.js'))
    .pipe(gulp.dest(jsDest))
})

gulp.task('js', () => {
  return gulp.src([
      path.join(jsPath, 'base/debounce.js'),
      path.join(jsPath, 'base/raf.js'),
      path.join(jsPath, 'base/throttle.js'),
      path.join(jsPath, 'base/modernizr.js'),
      path.join(jsPath, 'base/eventManager.js'),
      path.join(jsPath, 'base/mediaManager.js'),
      path.join(jsPath, 'utility/loadImages.js'),
      path.join(jsPath, 'utility/vh.js'),
      path.join(componentPath, 'tooltip/js/tooltip.js'),
      path.join(componentPath, 'to-top/js/toTop.js'),
      path.join(componentPath, 'fit-images/js/fitImage.js'),
      path.join(componentPath, 'parallax/js/parallaxBackground.js'),
      path.join(componentPath, 'parallax/js/parallax.js'),
      path.join(componentPath, 'navigation/js/menu.js'),
      path.join(componentPath, 'lightbox/js/lightbox.js'),
      path.join(componentPath, 'lightbox/js/lightbox-image.js'),
      path.join(componentPath, 'lightbox/js/lightbox-image-slide.js'),
      path.join(componentPath, 'lightbox/js/lightbox-image-description.js'),
      path.join(componentPath, 'lightbox/js/lightbox-common-dynamic.js'),
      path.join(componentPath, 'lightbox/js/lightbox-video.js'),
      path.join(componentPath, 'show-element/js/ShowElement.js'),
      path.join(componentPath, 'threeGallery/js/threeGallery.js'),
      path.join(jsPath, 'index.js'),
    ])
    .pipe(concat('main.js'))
    .pipe(wrap('(function($){<%= contents %>})(jQuery)'))
    .pipe(babel())
    .pipe(gulpif(isProd, uglify()))
    .pipe(gulp.dest(jsDest))
})

gulp.task('icons', () => {
	return gulp.src(svgFiles)
		.pipe(svgmin())
		.pipe(svgstore({ inlineSvg: true }))
		.pipe(gulp.dest(svgDest))
})

gulp.task('critical', function (e) {
    fs.writeFile(cssCritical,'',e);
});

gulp.task('css', ['sass'], () => {
  request(config.host, (err, response, body) => {
    if (err) return console.log(err)

    critical.generate({
      base:    './',
      html:    body,
      css:     `${cssPath}/main.css`,
      dest:    `${cssPath}/critical.css`,
      extract: true,
      minify:  true,
      width:   1024,
      height:  768,
      include:['.lighbox','.parallax-container','.parallax-item'],
    });
  })
});

gulp.task('html', function (e) {
  return gulp.src(pugFiles)
      .pipe(pug())
      .pipe(gulp.dest(destPath));
});

gulp.task('img', function (e) {
    return gulp.src(imgFiles)
    .pipe(imagemin())
    .pipe(gulp.dest(imgDest));
});

gulp.task('default', ['browser-sync', 'sass', 'js', 'html'], () => {
  gulp.watch(allPugFiles, ['html-watch'])
  gulp.watch([scssFiles,componentscssFiles], ['sass'])
  gulp.watch([jsFiles,componentJsFiles], ['js-watch'])
})
