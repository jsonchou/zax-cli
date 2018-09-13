#!/usr/bin/env node

'use strict';
const path = require('path')
const notifier = require('node-notifier');
const Ora = require('ora');
const exec = require('child_process').exec;

class DOWNLOAD {
    constructor(args) {
        
    }
    cmd() {
        const spinner = new Ora({
            text: 'Download zax-package',
            spinner: "dots"
        });

        spinner.start();

        exec('npm i zax-package -D')

        setTimeout(() => {
            spinner.succeed('Download zax-package, Done');
        }, 1000);
    }
}

module.exports = DOWNLOAD