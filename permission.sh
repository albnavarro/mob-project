#!/bin/bash
find wp-content -exec chown :apache {} \;
find wp-content -type d -exec chmod 755 {} \;
find wp-content -type f -exec chmod 644 {} \;
chmod 644 .htaccess
