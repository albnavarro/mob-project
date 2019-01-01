### Setup NPM
Type this command in terminal

* npm install

NPM will install all the dependencies for the project's gulpfile

Edit file config.json.dist in config.json, open files and enter your domain in localhost

### Type this command in terminal the first time:

* gulp css ( for create critical.css and other css assets)
* gulp icons ( for svg )
* gulp img ( for img )
* gulp minifyAssetsLoading ( for create async-assets-loading.min.js )
* gulp html ( compile html )
* gulp css ( recompile critical css )
* gulp html ( recompile html with critical )

* gulp ( watch pug,scss,js )

### Type this command form minify css and js

NODE_ENV=production gulp css
NODE_ENV=production gulp js
