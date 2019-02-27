### Setup NPM
Type this command in terminal

* npm install

NPM will install all the dependencies for the project's gulpfile

Edit file config.json.dist in config.json, open files and enter your domain in localhost

### Type this command in terminal the first time:

* gulp init

### Type this command form minify css/js and revisioning by appending content hash to filenames )
### Set isProd -> true in src/data/config.json for use new distribution assets

* gulp prod

### Type this command form generate critical css

* gulp criticalCss
* gulp html


### Type this command form use browserSync and liveReload

* gulp watch


### Type this command form delete generated files

* gulp cleanAll
