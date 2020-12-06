### Setup NPM
Type this command in terminal

* npm install

NPM will install all the dependencies for the project's gulpfile

Copy file config.json.dist in config.json

PROXY WITH HOST:
Open the new file config.json and enter your serverName ( from your virtualhost ) in host propierties.
the serverName is necessary for the tasks watch_files and criticalCss.
set useHost to true

PROXY WITHOUT HOST:
set useHost to false in config.json

NOTE:
The project use XMLHttpRequest fot load font, svg and so on.
So use a localhost or browserSync to open project.

### Type this command in terminal the first time:

* gulp init

It may happen that by executing the gulp init task it is not possible to create the css folder automatically inside the compiled folder (probably for a permissions problem).

In this case, just create the www/assets/css folder by hand.
To be noticed.

### Type this command form minify css/js and revisioning by appending content hash to filenames )

* Set isProd -> true in src/data/config.json for use new distribution assets
* gulp prod

### Type this command form generate critical css

* gulp criticalCss
* gulp html


### Type this command form use browserSync and liveReload

* gulp watch


### Type this command form delete generated files

* gulp cleanAll
