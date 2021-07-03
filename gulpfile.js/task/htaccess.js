const util = require('util');
const glob = require('glob');
const path = require('path');
const fs = require('fs');
const config = require('../../config.json');
const store = require('../store.js');
const destPath = path.resolve('www');

function filterLangByDefault(lang) {
    return lang !== config.defaultLocales ? lang : '';
}

/**
 * Create htacess
 *
 * @param  {function} done - async completion function
 * @return {function}
 */
function htaccess(done) {
    const locale = 'locales' in config ? config.locales : [];
    const langArr = Object.keys(locale);

    const langRedirect = langArr.reduce((p, c) => {
        const langString = `
RewriteCond %{HTTP:Accept-Language} ^${c} [NC]
RewriteCond %{REQUEST_URI} !^${config.domain}${filterLangByDefault(c)} [NC]
RewriteRule ^$ ${config.domain}${filterLangByDefault(c)} [R=301,L]`;
        if (c !== config.defaultLocales) p.push(langString);
        return p;
    }, []);

    // To do redirect lang once
    // const redirects = langRedirect.join('')
    const redirects = '';

    const writeStream = fs.createWriteStream(`${destPath}/.htaccess`);
    writeStream.write(`ErrorDocument 404 /404.html

RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME}\.html -f
RewriteRule ^(.*)$ $1.html
${redirects}

<filesMatch "\.(html|htm)$">
  FileETag None
  <ifModule mod_headers.c>
     Header unset ETag
     Header set Cache-Control "max-age=0, no-cache, no-store, must-revalidate"
     Header set Pragma "no-cache"
     Header set Expires "Wed, 11 Jan 1984 05:00:00 GMT"
  </ifModule>
</filesMatch>
    `);
    writeStream.end();

    done();
}

exports.htaccess = htaccess;
