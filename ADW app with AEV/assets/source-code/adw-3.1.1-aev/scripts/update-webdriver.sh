#!/usr/bin/env bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

if [ "$CI" = "true" ]; then
    echo "Updating wedriver-manager with chromedriver: $npm_package_config_chromeDriver."
    ./node_modules/protractor/bin/webdriver-manager update --gecko=false --versions.chrome=$(google-chrome --product-version)
else
    echo "Updating wedriver-manager with latest chromedriver, be sure to use evergreen Chrome."
    ./node_modules/protractor/bin/webdriver-manager update --gecko=false
fi
