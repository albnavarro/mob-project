"use strict"

const
  isProd = process.env.NODE_ENV === 'production',

  path = require('path'),
  config = require('./config.json'),
  concat = require('gulp-concat'),
  gulp = require('gulp'),
  sass = require('gulp-sass'),
  sourcemaps = require('gulp-sourcemaps'),
  watch = require('gulp-watch'),
  wrap = require('gulp-wrap'),
  critical = require('critical'),
  gulpif = require('gulp-if'),
  cssmin = require('gulp-cssmin'),
  postcss = require('gulp-postcss'),
  rename = require('gulp-rename'),
  request = require('request'),
  svgmin = require('gulp-svgmin'),
  svgstore = require('gulp-svgstore'),
  uglify = require('gulp-uglify'),
  browserSync = require('browser-sync').create(),
  fs = require('fs'),
  specialHtml = require('gulp-special-html'),
  htmlmin = require('gulp-htmlmin'),
  imagemin = require('gulp-imagemin'),
  pug = require('gulp-pug'),
  babel = require("gulp-babel"),
  reload = browserSync.reload,

  themePath = path.resolve('src'),
  destPath = path.resolve('www'),

  imgPath = path.join(themePath, 'img'),
  jsPath = path.join(themePath, 'js'),
  componentPath = path.join(themePath, 'component'),
  scssPath = path.join(themePath, 'scss'),
  svgPath = path.join(themePath, 'svg'),

  cssPath = path.join(destPath, 'assets/css'),
  jsDest = path.join(destPath, 'assets/js'),
  svgDest = path.join(destPath, 'assets/svg'),
  imgDest = path.join(destPath, 'assets/img'),

  cssFile = `${cssPath}/main.css`,
  cssCritical = `${cssPath}/critical.css`,
  imgFiles = `${imgPath}/*`,
  jsFiles = `${jsPath}/**/*.js`,
  componentJsFiles = `${componentPath}/**/*.js`,
  scssFiles = `${scssPath}/**/*.scss`,
  componentscssFiles = `${componentPath}/**/*.scss`,
  svgFiles = `${svgPath}/*.svg`,
  pugFiles = `${themePath}/*.pug`,
  allPugFiles = `${themePath}/**/*.pug`,

  dataFile = `${themePath}/data/data.json`



function browser_sync(done) {
  browserSync.init({
    proxy: config.host,
    open: true
  })

  done();
};


function reloadPage(done) {
  browserSync.reload()
  done();
};


function style(done) {
  gulp.src(path.join(scssPath, 'main.scss'))
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'nested',
      includePaths: ['node_modules/susy/sass']
    }).on('error', sass.logError))
    .pipe(postcss([
      require('autoprefixer')(),
      require('css-mqpacker')({
        sort: true
      }),
    ]))
    .pipe(gulpif(!isProd, sourcemaps.write('maps', {
      includeContent: false,
      sourceRoot: scssPath
    })))
    .pipe(gulpif(isProd, cssmin({
      keepSpecialComments: false,
    })))
    .pipe(gulp.dest(cssPath))
    .pipe(browserSync.stream({
      match: '**/*.css'
    }))

  done();
};


function minifyAssetsLoading() {
  return gulp.src(path.join(jsPath, 'async-assets-loading.js'))
    .pipe(uglify())
    .pipe(rename('async-assets-loading.min.js'))
    .pipe(gulp.dest(jsDest))
};


function js(done) {
  gulp.src([
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

  done();
};


function icons() {
  return gulp.src(svgFiles)
    .pipe(svgmin({
        plugins: [{
          removeViewBox: false
        }]
      }
    ))
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(gulp.dest(svgDest))
}

function initializeCritical(done) {
  fs.writeFile(cssCritical, '', done);
};

function criticalCss(done) {
  request(config.host, (err, response, body) => {
    if (err) return console.log(err)

    critical.generate({
      base: './',
      html: body,
      // base: destPath,
      // src: 'index.html',
      minify: true,
      width: 1024,
      height: 768,
      css: `${cssPath}/main.css`,
      dest: `${cssPath}/critical.css`,
      include: ['.lighbox', '.parallax-container', '.parallax-item']
    });

    done();
  })
};


function html() {
  const jsonData = JSON.parse(fs.readFileSync(dataFile))

  return gulp.src(pugFiles)
    .pipe(pug({
      data: jsonData,
      pretty: false
    }))
    .pipe(gulp.dest(destPath));
};


function image() {
  return gulp.src(imgFiles)
    .pipe(imagemin())
    .pipe(gulp.dest(imgDest));
};


function watch_files(done) {
  gulp.watch([scssFiles, componentscssFiles], style)
  gulp.watch([jsFiles, componentJsFiles], gulp.series(js, reloadPage))
  gulp.watch([allPugFiles, dataFile], gulp.series(html, reloadPage))

  done();
}


// TASK
gulp.task("initializeCritical", initializeCritical)
gulp.task("style", style)
gulp.task("js", js)
gulp.task("html", html)
gulp.task("image", image)
gulp.task("icons", icons)
gulp.task("minifyAssetsLoading", minifyAssetsLoading)
gulp.task("criticalCss", gulp.series(style, criticalCss))

gulp.task("init", gulp.series(initializeCritical, icons, image, minifyAssetsLoading, style, js, html))
gulp.task("assets", gulp.parallel(style, js));
gulp.task('watch', gulp.parallel(browser_sync, watch_files))
