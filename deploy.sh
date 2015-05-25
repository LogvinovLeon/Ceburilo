#!/bin/bash
set -e
./node_modules/.bin/gulp build
sed -i 's/\.\(\.\/bower_components\)/\1/' build/index.html

target=ceburilo@ceburilo.pl:www/

rsync -avz build/* bower_components $target
